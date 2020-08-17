varying highp vec2 coord;
uniform lowp float qt_Opacity;
uniform float sphere_radius; // all the explosion fits in a sphere with this radius. The center lies in the origin.
uniform float noise_amplitude; // amount of noise applied to the sphere (towards the center)
uniform lowp float width;
uniform lowp float height;
highp vec3 hit = vec3(0.0, 0.0, 0.0);

float ddt(vec3 v1, vec3 v2) {
    float ret = 0.0;
    ret = ret + (v1.x * v2.x);
    ret = ret + (v1.y * v2.y);
    ret = ret + (v1.z * v2.z);
    return ret;
}

float norm(vec3 p) {
    return pow((p.x * p.x + p.y * p.y + p.z * p.z), 0.5);
}

float lerp( float v0, float v1, float t) {
    return v0 + (v1 -v0) * max(0.0, min(1.0, t));
}

vec3 lerp3(vec3 v0, vec3 v1, float t) {
    return v0 + (v1 -v0) * max(0.0, min(1.0, t));
}

float hash(float n) {
    float x = sin(n)*43758.5453f;
    return x-floor(x);
}

float noise(vec3 x) {
    vec3 p = vec3(floor(x.x), floor(x.y), floor(x.z));
    vec3 f = vec3(x.x-p.x, x.y-p.y, x.z-p.z);
    vec3 q = vec3(3.0, 3.0, 3.0 ) - (f * 2.0);
    f = f * ddt(f , q);
    float n = ddt(p,vec3(1.f, 57.f, 113.f));
    return lerp(lerp(
                     lerp(hash(n +  0.f), hash(n +  1.f), f.x),
                     lerp(hash(n + 57.f), hash(n + 58.f), f.x), f.y),
                lerp(
                    lerp(hash(n + 113.f), hash(n + 114.f), f.x),
                    lerp(hash(n + 170.f), hash(n + 171.f), f.x), f.y), f.z);
}

vec3 rotate(vec3 v) {
    return vec3(ddt(vec3(0.0, 0.8, 0.6) , v), ddt(vec3(-0.80,  0.36, -0.48) , v), ddt(vec3(-0.60, -0.48,  0.64) , v));
}

float fractal_brownian_motion(vec3 x) {
    vec3 p = rotate(x);
    float f = 0.0;
    f = f + 0.5000 * noise(p); p = p* 2.32;
    f = f + 0.2500 * noise(p); p = p* 3.03;
    f = f + 0.1250 * noise(p); p = p* 2.61;
    f = f + 0.0625 * noise(p);
    return f/0.9375;
}

vec3 palette_fire(float d) {
    vec3 yellow = vec3(1.7, 1.3, 1.0);
    vec3 orange = vec3(1.0, 0.6, 0.0);
    vec3 red = vec3(1.0, 0.0, 0.0);
    vec3 darkgray = vec3(0.2, 0.2, 0.2);
    vec3 gray = vec3(0.4, 0.4, 0.4);

    float x = max(0.0, min(1.0, d));
    if (x < 0.25)
        return lerp3(gray, darkgray, x *  4.0);
    else if (x < 0.5)
        return lerp3(darkgray, red, x * 4.0 - 1.0);
    else if(x < 0.75)
        return lerp3(red, orange, x * 4.0 - 2.0);
    return lerp3(orange, yellow, x * 4.0 - 3.0);
}


float signed_distance(vec3 p) {
    float displacement = -fractal_brownian_motion(p * 3.4) * noise_amplitude;
    return norm(p) - (sphere_radius + displacement);
}

bool sphere_trace(vec3 orig, vec3 dir, vec3 pos) {
    if (ddt(orig,orig) - pow(ddt(orig,dir), 2.0) > pow(sphere_radius, 2.0))
        return false;
    hit = orig;
    for (int i = 0; i < 128; i++) {
        float d = signed_distance(hit);
        if (d < 0.0)
            return true;
        hit = hit + dir * max(d * 0.1, 0.01);
    }
    return false;
}

vec3 distance_field_normal(vec3 pos) {
    float eps = 0.1;
    float d = signed_distance(pos);
    float nx = signed_distance(pos + vec3(eps, 0, 0)) - d;
    float ny = signed_distance(pos + vec3(0, eps, 0)) - d;
    float nz = signed_distance(pos + vec3(0, 0, eps)) - d;
    return normalize(vec3(nx, ny, nz));

}

void main() {
    float fov = 3.1415 / 3.0;
    float i = coord.x * width;
    float j = coord.y * height;
    float dir_x = (i + 0.5) - width / 2.0;
    float dir_y = -(j + 0.5) + height / 2.0;
    float dir_z = -height / (2.0 * tan(fov/ 2.0));
    vec3 ret ;
    if(sphere_trace(vec3(0.0, 0.0, 3.0), normalize(vec3(dir_x, dir_y, dir_z)), hit)) {
        float noise_level = (sphere_radius - norm(hit)) / noise_amplitude;
        vec3 light_dir = normalize(vec3(10.0, 10.0, 10.0) - hit);
        float light_intensity = max(0.4, ddt(light_dir ,  distance_field_normal(hit)));
        ret = palette_fire((-0.2 + noise_level) * 2.0) * light_intensity;
    }
    else
        ret = vec3(0.2, 0.7, 0.8);

    gl_FragColor = vec4(ret, 1.0);
}
