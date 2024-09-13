precision highp float;



varying highp vec4 vColor;
varying highp float vLight;
varying highp float specular;

void main(){
    
    gl_FragColor = vec4( vColor.xyz * vLight ,vColor.a) ;
    
}