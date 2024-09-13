
import {mat3,mat4} from 'gl-matrix';
import  $, { data, htmlPrefilter } from 'jquery';
import { WebGLUtils } from 'three';




window.onload=initWebGL;
/**
						 * @type {WebGL2RenderingContext}
						 */
var gl = null,
/**
* @type {HTMLCanvasElement}
*/
canvas = null,
/**
 * @type {WebGLProgram}
 */
glProgram = null,

fragmentShader = null,
vertexShader = null;

var vertexPositionAttribute = null,
 	TexCoordBuffer = null,
	trianglesVerticeBuffer = null,
	vertexColorAttribute = null,
	trianglesColorBuffer = null,
	triangleVertexIndices = null,
	triangleVerticesIndexBuffer = null,
	vertexNormalAttribute = null,
	trianglesNormalsBuffer = null;

var triangleVertices = [],
	triangleTexCoords =[];

var TextureImg = [],
	Texture = [];

var fs_source = null,
	vs_source = null;
var STONE_TEXTURE = 0,
	WEBGL_LOGO_TEXTURE = 1;

var mvMatrix = mat4.create(),
	pMatrix = mat4.create(),	
	normalMatrix = mat3.create();
var angle = 0;

var useTexture = false,
	useLighting = false,
	Paused = false;
	$(document).on('keyup',(event)=>{
		switch(event.key){
			case 't':
				useTexture = !useTexture;
				if(!useTexture){
					gl.uniform1i(gl.uDoTexturing,0);
				}else{
					gl.uniform1i(gl.uDoTexturing,1);
				}
				break;
			case 'l':
				useLighting = !useLighting;
				break;
			case 'p':
				Paused = !Paused;
		}
	})




				
				function initWebGL()
				{
					
					try{
						
						canvas = document.querySelector(".canvas");  
						canvas.width=window.innerWidth;
						canvas.height = window.innerHeight;
						
						
						gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl");
						
					}catch(e){
					}
					
				if(gl)
				{
					
					initShaders();
					setupBuffers();
					getMatrixUniforms();
					loadTexture();
					
					(function animLoop(){
						if(!Paused){
							setupWebGL();

							setMatrixUniforms();
							drawScene();
						}
						requestAnimationFrame(animLoop);
					})();
				}else{	
					alert(  "Error: Your browser does not appear to support WebGL.");
				}
			}
			
			
			function setupWebGL()
			{
				

				//set the clear color to a shade of green
				gl.clearColor(0.5, 0.5, 0.5, 1.0); 	
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); 	
				
				gl.viewport(0, 0, canvas.width, canvas.height);
				mat4.identity(mvMatrix);
			
				mat4.perspective(pMatrix,45,canvas.width/canvas.height,0.1,100);
				mat4.lookAt(mvMatrix,[0.0,0.0,8.0],[0.0,0.0,0.0],[0.0,1.0,0.0]);
				// mat4.translate(mvMatrix,mvMatrix,[-1.0, -1.0, -5.0]);         
				mat4.rotate(mvMatrix,mvMatrix, angle, [0.0, 1.0, 0.0]);
				mat3.invert(normalMatrix,mvMatrix);
				mat3.transpose(normalMatrix,normalMatrix);
				
				angle =performance.now() / 1000 / 6 * 2 *  Math.PI;
				gl.enable(gl.DEPTH_TEST);
				
			}
			
			function initShaders()
			{
				//get shader source
				 

				

				$.ajax({
					async:false,
					url:'../../assets/shaders/first_website/vertex_shader.vs',
					data:data,
					dataType:'text',
					success:function(data){
						vs_source = data;
					}
				});
				
				$.ajax({
					async:false,
					url:'../../assets/shaders/first_website/frag_shader.fs',
					data:data,
					dataType:'text',
					success:function(data){
						fs_source = data;
					}
				});

				//compile shaders	
                vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
				fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);
				
				//create program
				glProgram = gl.createProgram();
				
				//attach and link shaders to the program
                gl.attachShader(glProgram, vertexShader);
                gl.attachShader(glProgram, fragmentShader);
                gl.linkProgram(glProgram);

                if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
                    alert("Unable to initialize the shader program.");
                }
				
				//use program
				gl.useProgram(glProgram);
			}
			
			function makeShader(src, type)
			{
				//compile the vertex shader
				var shader = gl.createShader(type);
                gl.shaderSource(shader, src);
                gl.compileShader(shader);
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
                }
				return shader;
			}
			
			function setupBuffers()
			{
				// var triangleVerticeColors = [ 
				// 	//front face	
				// 	0.0, 0.0, 1.0,
				// 	1.0, 1.0, 1.0,
				// 	0.0, 0.0, 1.0,
				// 	0.0, 0.0, 1.0,
				// 	0.0, 0.0, 1.0,
				// 	 1.0, 1.0, 1.0,
				
				// 	//rear face
				// 	0.0, 1.0, 1.0,
				// 	 1.0, 1.0, 1.0,
				// 	 0.0, 1.0, 1.0,
				// 	 0.0, 1.0, 1.0,
				// 	 0.0, 1.0, 1.0,
				// 	 1.0, 1.0, 1.0
				// 	];
					
					// trianglesColorBuffer = gl.createBuffer();
					// gl.bindBuffer(gl.ARRAY_BUFFER, trianglesColorBuffer);
					// gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVerticeColors), gl.STATIC_DRAW);	
					
					//12 vertices
					var triangleVerticesOriginal = [ 
						// front face
						// bottom left to right,  to top
						0.0, 0.0, 0.0,
						1.0, 0.0, 0.0,
						2.0, 0.0, 0.0,
						0.5, 1.0, 0.0,
						1.5, 1.0, 0.0,
						1.0, 2.0, 0.0,
						
						//rear face
						0.0, 0.0, -2.0,
						1.0, 0.0, -2.0,
						2.0, 0.0, -2.0,
						0.5, 1.0, -2.0,
						1.5, 1.0, -2.0,
						1.0, 2.0, -2.0


						// -0.5, -0.5, 0.0,
						// 0.5, -0.5, 0.0,
						// 0.5, 0.5, 0.0,
						// 0.5, 0.5, 0.0,
						// -0.5, 0.5, 0.0,
						// -0.5, -0.5, 0.0
					];
					
					//setup vertice buffers
				//18 triangles
				 triangleVertexIndices = [ 
					//front face
					0,1,3,
					1,4,3,	//flipped
					1,2,4,
					3,4,5,
					
					//rear face
					6,7,9,
					7,10,9,  //flipped
					7,8,10,
					9,10,11,
					
					//left side
					0,6,3,	//flipped
					3,6,9,
					3,9,5,
					5,9,11,
					
					//right side
					2,4,8,	//flipped
					4,10,8,
					4,5,10,	//flipped
					5,11,10,
					
					//bottom faces
					0,6,8,
					8,2,0
				];
				triangleVerticesIndexBuffer = gl.createBuffer();
				triangleVerticesIndexBuffer.number_vertex_points = triangleVertexIndices.length;
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleVerticesIndexBuffer);
				gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(triangleVertexIndices), gl.STATIC_DRAW);		
				
				
				
				for(var i=0; i<triangleVertexIndices.length; ++i)
				{
					
				var a = triangleVertexIndices[i];
				triangleVertices.push(triangleVerticesOriginal[a*3]);
				triangleVertices.push(triangleVerticesOriginal[a*3 + 1]);
				triangleVertices.push(triangleVerticesOriginal[a*3 + 2]);
				if(i >= 24)
				{
				triangleTexCoords.push(triangleVerticesOriginal[a*3 + 2]);
				triangleTexCoords.push(triangleVerticesOriginal[a*3 + 1]);
				}else{
				triangleTexCoords.push(triangleVerticesOriginal[a*3]);
				triangleTexCoords.push(triangleVerticesOriginal[a*3 + 1]);
				}
			}
			
			trianglesVerticeBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);		
			TexCoordBuffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, TexCoordBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleTexCoords), gl.STATIC_DRAW);
			
var triangleNormals = [];
//18 triangles - normal will be the same for each vertex of triangle
for(var i=0; i<triangleVertexIndices.length; i+=3)
{
var a = triangleVertexIndices[i];
var b = triangleVertexIndices[i + 1];
var c = triangleVertexIndices[i + 2];
//normal is the cross-product
var v1 = [
triangleVerticesOriginal[a*3] - triangleVerticesOriginal[b*3],
triangleVerticesOriginal[a*3 + 1] - triangleVerticesOriginal[b*3 + 1],
triangleVerticesOriginal[a*3 + 2] - triangleVerticesOriginal[b*3 + 2],
];
var v2 = [
triangleVerticesOriginal[a*3] - triangleVerticesOriginal[c*3],
triangleVerticesOriginal[a*3 + 1] - triangleVerticesOriginal[c*3 + 1],
triangleVerticesOriginal[a*3 + 2] - triangleVerticesOriginal[c*3 + 2],
];


var cross = [
v1[1]*v2[2] - v1[2]*v2[1],
v1[2]*v2[0] - v1[0]*v2[2],
v1[0]*v2[1] - v1[1]*v2[0]
];
//same value for each of the three vertices
triangleNormals.push.apply(triangleNormals, cross);
triangleNormals.push.apply(triangleNormals, cross);
triangleNormals.push.apply(triangleNormals, cross);
}
trianglesNormalsBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, trianglesNormalsBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleNormals), gl.STATIC_DRAW);

			}
			function loadTexture(){
				
				TextureImg[STONE_TEXTURE] = new Image();
				TextureImg[STONE_TEXTURE].onload = ()=>{
					setupTexture(STONE_TEXTURE);
				}
				TextureImg[STONE_TEXTURE].src = '../../assets/Textures/stone-128px.jpg';
				
				TextureImg[WEBGL_LOGO_TEXTURE] = new Image();
				TextureImg[WEBGL_LOGO_TEXTURE].onload = ()=>{
					
					setupTexture(WEBGL_LOGO_TEXTURE);
				}
				TextureImg[WEBGL_LOGO_TEXTURE].src = '../../assets/Textures/webgl_logo-512px.png';
				glProgram.uDoTexturing = gl.getUniformLocation(glProgram, "uDoTexturing");
				gl.uniform1i(glProgram.uDoTexturing, 1);
			}
			function setupTexture(TextureIndex){
					if(TextureIndex >= 0){

						gl.activeTexture(gl.TEXTURE0 + TextureIndex);
						Texture[TextureIndex] = gl.createTexture();
						gl.bindTexture(gl.TEXTURE_2D,Texture[TextureIndex]);
						gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
						gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,TextureImg[TextureIndex]);
						// gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
						  // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
						gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
						gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.NEAREST);
						if(!gl.isTexture(Texture[TextureIndex])){
							console.log('Error: Texture is invalid!')
						}
					}
					
					gl.uDoTexturing = gl.getUniformLocation(glProgram,'uDoTexturing');
					gl.uniform1i(gl.uDoTexturing,1);
				} 
			
			
			function drawScene()
			{
				vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
                gl.enableVertexAttribArray(vertexPositionAttribute);
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesVerticeBuffer);
				gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);
				
				// vertexColorAttribute = gl.getAttribLocation(glProgram, "VertexColor");
                // gl.enableVertexAttribArray(vertexColorAttribute);
				// gl.bindBuffer(gl.ARRAY_BUFFER, trianglesColorBuffer);
				// gl.vertexAttribPointer(vertexColorAttribute, 3, gl.FLOAT, false, 0, 0);

				var vertexTexCoordAttribute = gl.getAttribLocation(glProgram,'aVertexTexCoord');
				gl.enableVertexAttribArray(vertexTexCoordAttribute);
				gl.bindBuffer(gl.ARRAY_BUFFER, TexCoordBuffer);  
				gl.vertexAttribPointer(vertexTexCoordAttribute,2,gl.FLOAT,false,0,0);
				vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
				gl.enableVertexAttribArray(vertexNormalAttribute);
				gl.bindBuffer(gl.ARRAY_BUFFER, trianglesNormalsBuffer);
				gl.vertexAttribPointer(vertexNormalAttribute, 3, gl.FLOAT, false, 0, 0);
				
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleVerticesIndexBuffer);  
				// gl.drawElements(gl.TRIANGLES, 18*3, gl.UNSIGNED_SHORT, 0);
				gl.drawArrays(gl.TRIANGLES,0,18*3);
			}
			
			
			function getMatrixUniforms(){
				glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "pMatrix");
                glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVmatrix");          
				glProgram.samplerUniform = gl.getUniformLocation(glProgram,'uSampler');
				glProgram.samplerUniform2 = gl.getUniformLocation(glProgram,'uSampler2');
				glProgram.normalMatrixUniform = gl.getUniformLocation(glProgram, "uNormalMatrix");
			}
			
			function setMatrixUniforms() {
				gl.uniformMatrix4fv(glProgram.pMatrixUniform, false, pMatrix);
                gl.uniformMatrix4fv(glProgram.mvMatrixUniform, false, mvMatrix);
                
				gl.uniformMatrix3fv(glProgram.normalMatrixUniform, false, normalMatrix);
				gl.uniform1i(glProgram.samplerUniform,0);
				gl.uniform1i(glProgram.samplerUniform2,1);
				
            }
			