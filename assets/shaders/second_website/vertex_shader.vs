attribute vec3 aVertPos;
attribute vec4 aVertColor;
attribute vec3 aVertNormal;

uniform mat4 uMmatrix;
uniform mat4 uVmatrix;
uniform mat4 uPmatrix;
uniform mat4 uNmatrix;
uniform float uSpec_intensity;
uniform vec3 uCameraPos;

varying highp vec3 vPosition;
varying highp vec4 vColor;
varying highp float vLight;

void main(){
    gl_Position = uPmatrix * uVmatrix * uMmatrix * vec4(aVertPos,1.0);
    vColor = aVertColor;
    vPosition = aVertPos;
    float ambient = 0.3;
    vec3 transformedNormal = (uNmatrix * vec4(aVertNormal,1.0)).xyz;
    vec3 directionaLight = vec3(3.0,2.0,-1.0);

    float dirLightAmount = max(dot(transformedNormal,directionaLight),0.0);

    vLight = ambient + dirLightAmount;
}