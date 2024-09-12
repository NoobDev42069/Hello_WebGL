varying highp vec2 vTextureCoord;
varying highp vec3 vLight;
varying highp vec4 vColor;

uniform sampler2D uSampler;
uniform sampler2D uSampler2;
uniform int uDoTexturing;

void main(void){
    highp vec4 stoneColor = texture2D(uSampler,vTextureCoord.st);
    highp vec4 webglLogoColor = texture2D(uSampler2,vTextureCoord.st);
    highp vec4 textureMixture = mix(stoneColor,webglLogoColor,webglLogoColor.a);
    if(uDoTexturing == 1)
    {
        gl_FragColor = vec4(textureMixture.xyz * vLight,textureMixture.a);
    }else{
        gl_FragColor = vec4(vColor.xyz * vLight , vColor.a);
    }
}