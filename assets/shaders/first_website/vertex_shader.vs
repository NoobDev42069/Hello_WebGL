attribute vec3 aVertexPosition;
attribute vec2 aVertexTexCoord;
attribute vec3 aVertexNormal;
attribute vec3 aVertexColor;

uniform mat3 uNormalMatrix;
uniform mat4 uMVmatrix;
uniform mat4 uPmatrix;
varying highp vec2 vTextureCoord;
varying highp vec3 vLight;
varying highp vec4 vColor;
void main(void){
    gl_Position =  uPmatrix * uMVmatrix * vec4(aVertexPosition,1.0);
    vTextureCoord = aVertexTexCoord;
    vColor = vec4(aVertexColor,1.0);
    //lighting 
    vec3 ambient_light = vec3(1.0,1.0,1.0);

    vec3 pointLightPosition = vec3(1.0,-2.0,-1.0);
    vec3 pointLightDirection = normalize(vec3(pointLightPosition.xyz - aVertexPosition.xyz));
    vec3 transformedNormal = uNormalMatrix * aVertexNormal;
    vec3 L = vec3(uMVmatrix * vec4(pointLightDirection,1.0));
    float diffuseLightAmount = max( dot(normalize(transformedNormal), normalize(L)), 0.0);
    
    vLight = ambient_light * (vec3(.8,.8,.8) * diffuseLightAmount);
}