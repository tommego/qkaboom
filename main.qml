import QtQuick 2.12
import QtQuick.Window 2.12
import QtQuick.Controls 2.14

Window {
    visible: true
    width: 640
    height: 480
    title: qsTr("Hello World")
    color: "black"

    Item{
        anchors.fill: parent
//        property vector3d  hit;
        ShaderEffect{
            id: bbb
            property real sphere_radius: dddd.value
            property real noise_amplitude:eeee.value
            anchors.fill: parent
            vertexShader: "qrc:/kaboom.vert"
            fragmentShader: "qrc:/kaboom.frag"
        }
    }


    Column{
        anchors.bottom: parent.bottom
        spacing: 20
        width: parent.width
        Slider{
            id: dddd
            from: 0.0
            to: 3
            stepSize: 0.0001
            width: parent.width
        }
        Slider{
            id: eeee
            from: 0.0
            to: 3
            value: 1.0
            stepSize: 0.0001
            width: parent.width
            height: 30
        }
    }

}
