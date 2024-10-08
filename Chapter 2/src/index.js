import { mat4,mat3, } from 'gl-matrix';
import $ from 'jquery';




//Variables
//Main variables
/**
 * @type {HTMLCanvasElement}
 */
var canvas = null;
/**
 * @type {WebGL2RenderingContext}
 */
var gl = null,
    glProgram = null;

//Shader Variables
var vertexShader = null,
    fragmentShader = null,
    vs_src = null,
    fs_src = null;

//Buffers
var Buffers = {};


//Vertex Attributes
var attribLocations = {};
//uniforms
var cameraPos = [0.0,0.0,20.0],
    specInt = 128.0;

// Matrices
var Matrices = {};    
// vertex Attribute Arrays
var attributes = {};   
//mouse and keyboard interaction flags
var capture = false,
    start = [],
    angleX = 0,
    angleY = 0;
    //
    //mouse and keyboard controls
    //
    $('#canvas').on('mousedown',function(e){
        capture = true;
        start = [e.pageX,e.pageY];
        console.log('start capture');
    }).on('mouseup',function(){
        capture = false;
        console.log('end capture');
    }).on('mousemove',function(e){
        if(capture){
        var x = e.pageX - start[0];
        var y = e.pageY - start[1];
        start[0] = e.pageX;
        start[1] = e.pageY;
        angleX += x;
        angleY += y;
        console.log(`angle : (${angleX},${angleY})`);
    
    }
});



var cubeMesh = function( options = {}){
    

    this.size = ( options.size !== undefined) ? options.size : 1;
    this.color = ( options.color !== undefined) ? options.color : [0,0,0,1];
    this.texture = ( options.texture !== undefined) ? options.texture : null;
    this.translation = ( options.translation !== undefined) ? options.translation : [0,0,0];
    this.origin = ( options.origin !== undefined) ? options.origin : [0,0,0];
    this.attributes = {
        indices : [],
        vertices : [],
        colors : [],
        normals : [],
    };    

    //------------------------------------
    //        Matrix initialization
    //------------------------------------
    
    this.modelMatrix = mat4.create();
    this.normalMatrix = mat4.create();
    //-------------------------------------
    //              Buffers
    //-------------------------------------
    this.buffers = {
        vertexBuffer : gl.createBuffer(),
        indexBuffer : gl.createBuffer(),
        colorBuffer : gl.createBuffer(),
    }
    //--------------------------------------
    //         Attribute Locations
    //--------------------------------------
    this.attribLocations = {
        vertexPositionAttribute : gl.getAttribLocation(glProgram,'aVertPos'),
        vertexNormalAttribute : gl.getAttribLocation(glProgram,'aVertNormal'),
        vertexColorAttribute : gl.getAttribLocation(glProgram,'aVertColor'),   
    }    
    //--------------------------------------
    //          Uniform Locations
    //--------------------------------------
    this.uniforms = {
        mMat : gl.getUniformLocation(glProgram,'uMmatrix'),
        normMat : gl.getUniformLocation(glProgram,'uNmatrix'),
    } 
    
    
    
    
    //-------------------------------------------------
    //                  Attributes                     
    //-------------------------------------------------
    this.attributes.vertices = [
        // Front face
        this.origin[0] - this.size , this.origin[1] + this.size  , this.origin[2] + this.size , // 0
        this.origin[0] + this.size , this.origin[1] + this.size  , this.origin[2] + this.size , // 1
        this.origin[0] + this.size , this.origin[1] - this.size  , this.origin[2] + this.size , // 2
        this.origin[0] - this.size , this.origin[1] - this.size  , this.origin[2] + this.size , // 3
        // Back face 
        this.origin[0] - this.size , this.origin[1] + this.size  , this.origin[2] - this.size , // 4
        this.origin[0] + this.size , this.origin[1] + this.size  , this.origin[2] - this.size , // 5
        this.origin[0] + this.size , this.origin[1] - this.size  , this.origin[2] - this.size , // 6
        this.origin[0] - this.size , this.origin[1] - this.size  , this.origin[2] - this.size   // 7
    ]    
    this.attributes.indices = [
        //front
        0,1,2,
        0,2,3,
        //left
        4,0,7,
        0,7,3,
        //right
        1,5,2,
        5,2,6,
        //top
        6,7,2,
        7,2,3,
        //bottom
        0,1,4,
        1,4,5,
        //back
        4,5,7,
        5,7,6
    ];    
    //-------------------------------------
    //              Methods
    //-------------------------------------

    this.computeMatrices = function(){
        mat4.identity(this.modelMatrix);
        if(options.translation){
            mat4.translate(this.modelMatrix,this.modelMatrix,this.translation);
        }
        mat4.invert(this.normalMatrix,this.modelMatrix);
        mat4.transpose(this.normalMatrix,this.normalMatrix);
        
        return{
            modelMat: this.modelMatrix,
            normalMat: this.normalMatrix,
        };    
    };    
    
    this.setBufferData = ()=>{
        if(this.color){
            for(let i = 0;i < this.attributes.vertices.length; i++){
                this.attributes.colors.push.apply(this.attributes.colors,this.color);
            }
            gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.colorBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.attributes.colors),gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.attribLocations.vertexColorAttribute);
            gl.vertexAttribPointer(this.attribLocations.vertexColorAttribute,4,gl.FLOAT,false,0,0);
        }
    
    
    gl.bindBuffer(gl.ARRAY_BUFFER,this.buffers.vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(this.attributes.vertices), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(this.attribLocations.vertexPositionAttribute);
    gl.vertexAttribPointer(this.attribLocations.vertexPositionAttribute,3,gl.FLOAT,false,0,0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,this.buffers.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(this.attributes.indices),gl.STATIC_DRAW);
    
    
    };
}








function repeat(n, pattern) {
    return [...Array(n)].reduce(sum => sum.concat(pattern), []);
}





    
try {
    
        canvas = document.getElementById('canvas');
        gl = canvas.getContext('webgl2');
        
        
    } catch (error) {
        
        console.error('error' + '\n' + error);
}
function calculateNormal(vertArray, indices){
    var normals=[];
    
    for(var i = 0;i<indices.length;i+=3){
        var a = indices[i];
        var b = indices[i+1];
        var c = indices[i+2];
        
        
        var v1 = [
            vertArray[a * 3] - vertArray[b * 3],
            vertArray[a * 3 + 1] - vertArray[b * 3 + 1],
            vertArray[a * 3 + 2] - vertArray[b * 3 + 2]
    ];
        var v2 = [
            vertArray[a * 3] - vertArray[c * 3],
            vertArray[a * 3 + 1] - vertArray[c * 3 + 1],
            vertArray[a * 3 + 2] - vertArray[c * 3 + 2]
        ];
        
        var cross = [
            v1[1]*v2[2] - v1[2]*v2[1],
            v1[2]*v2[0] - v1[0]*v2[2],
            v1[0]*v2[1] - v1[1]*v2[0]
        ];
        const length = Math.sqrt(
            Math.pow(cross[0],2) +
            Math.pow(cross[1],2) +
            Math.pow(cross[2],2)
        );
        cross[0] /= length;
        cross[1] /= length;
        cross[2] /= length;
        normals.push.apply(normals, cross);
        normals.push.apply(normals, cross);
        normals.push.apply(normals, cross);
        
    }
    

    
    
    return normals;
    
}





function makeShader(src,type){
    var shader = gl.createShader(type);
    var shader_type;
    if(type == gl.VERTEX_SHADER){
         shader_type = 'vertexShader';
    }else{
        shader_type = 'fragment_shader';
    }
    gl.shaderSource(shader,src);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))
    {
        alert(`error occured in ${shader_type} : ` + gl.getShaderInfoLog(shader));
    }
    return shader;
}
if(!gl){
    console.warn('Your Browser doesn\'t support WebGL!');
}
// =======================================
// ########## Shader Program #############
// =======================================



$.ajax({
    async:false,
    url:'../../assets/shaders/second_website/vertex_shader.vs',
    dataType:'text',
    success:function(data){
        vs_src = data;
    }
});
$.ajax({
    async:false,
    url:'../../assets/shaders/second_website/fragment_shader.fs',
    dataType:'text',
    success:function(data){
        fs_src = data;
    }
});

vertexShader = makeShader(vs_src,gl.VERTEX_SHADER);
fragmentShader = makeShader(fs_src,gl.FRAGMENT_SHADER);

glProgram = gl.createProgram();
if(glProgram){
gl.attachShader(glProgram,vertexShader);
gl.attachShader(glProgram,fragmentShader);

gl.linkProgram(glProgram);
console.log(gl.getProgramInfoLog(glProgram));
}
if(!gl.getProgramParameter(glProgram,gl.LINK_STATUS)){
    alert('unable to link program');
}
gl.useProgram(glProgram);


// =========================
//####### Attributes #########
// =========================

attributes = {
    vertexCoordinates : [
        -1.0,-1.0,0.0,      //bottom left
        1.0,-1.0,0.0,       //bottom right
        1.0,1.0,0.0,        //top right
        -1.0,1.0,0.0,       //top left
    
        -1.0,-1.0,-2.0,     //bottom left in
        1.0,-1.0,-2.0,      //bottom right in
        1.0,1.0,-2.0,       //top right in
        -1.0,1.0,-2.0       //top left in
    
    ],

    Colors : [
        1.0,0.0,0.0,
        0.6,0.0,0.0,
        0.7,0.0,0.0,
        0.8,0.0,0.0,
        0.8,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0,
        1.0,0.0,0.0
    ],
    
    //
    //Generating Indices array
    //
    Indices : [
        //front
        0,1,2,
        0,2,3,
        //left
        4,0,7,
        0,7,3,
        //right
        1,5,2,
        5,2,6,
        //top
        6,7,2,
        7,2,3,
        //bottom
        0,1,4,
        1,4,5,
        //back
        4,5,7,
        5,7,6
    ],
    //
    //Calculate Normals
    //
    surfaceNormal : [
        ...repeat(6, [0, 0, 1]),    // Z+
        ...repeat(6, [-1, 0, 0]),   // X-
        ...repeat(6, [1, 0, 0]),    // X+
        ...repeat(6, [0, 1, 0]),    // Y+
        ...repeat(6, [0, -1, 0]),   // Y-
        ...repeat(6, [0, 0, -1]),   // Z-
    
    ],
};

// console.log(surfaceNormal);


// =========================
//####### Buffers #########
// =========================

Buffers = {
    vertexBuffer : gl.createBuffer(),
    colorBuffer : gl.createBuffer(),
    IndexBuffer : gl.createBuffer(),
    normalBuffer : gl.createBuffer(),
}
//
//send vertex data to the gpu
// 

gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(attributes.vertexCoordinates),gl.STATIC_DRAW);


gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.colorBuffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(attributes.Colors),gl.STATIC_DRAW);


gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,Buffers.IndexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(attributes.Indices),gl.STATIC_DRAW);


gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.normalBuffer);
gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(attributes.surfaceNormal),gl.STATIC_DRAW);




// ==================================
// ###### Attribute Locations #######
// ==================================

attribLocations = {
    vertexPositionAttribute : gl.getAttribLocation(glProgram,'aVertPos'),
    vertexNormalAttribute : gl.getAttribLocation(glProgram,'aVertNormal'),
    vertexColorAttribute : gl.getAttribLocation(glProgram,'aVertColor'),

}


gl.enableVertexAttribArray(attribLocations.vertexPositionAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.vertexBuffer);
gl.vertexAttribPointer(attribLocations.vertexPositionAttribute,3,gl.FLOAT,false,0,0);


gl.enableVertexAttribArray(attribLocations.vertexNormalAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.normalBuffer);
gl.vertexAttribPointer(attribLocations.vertexNormalAttribute,3,gl.FLOAT,true,0,0);


gl.enableVertexAttribArray(attribLocations.vertexColorAttribute);
gl.bindBuffer(gl.ARRAY_BUFFER,Buffers.colorBuffer);
gl.vertexAttribPointer(attribLocations.vertexColorAttribute,3,gl.FLOAT,false,0,0);


// =================================
// ####### Uniform Locations #########
// =================================


var uniforms = {
    vMat : gl.getUniformLocation(glProgram,'uVmatrix'),
    pMat : gl.getUniformLocation(glProgram,'uPmatrix'),
    specInt : gl.getUniformLocation(glProgram,'uSpec_intensity'),
    cameraPos : gl.getUniformLocation(glProgram,'uCameraPos'),
};

// ======================================
// ############ Matrices ################
// ======================================

Matrices = {
    ProjectionMatrix : mat4.create(),
    ViewMatrix : mat4.create(),
}

var Cube = new cubeMesh({
    translation:[-5,0,-3],
    color:[0.0,0.0,1.0,1.0],
    size : 2,

});
var Cube2 = new cubeMesh({
    translation:[5,0,-3],
    color:[0.0,1.0,0.0,1.0],
    size : 2,

});

var meshes = [
    Cube,Cube2
];
let then = 0,
    deltaTime = 0;
var angle = 0;
function render(now) {
    //time calculation
    now *= 0.001;
    deltaTime = now - then;
    then = now;

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    // Update any dynamic variables (e.g., angles based on user interaction)
    // Example: Cube rotation based on mouse interaction
    Matrices.ViewMatrix = mat4.create();
    mat4.lookAt(Matrices.ViewMatrix,cameraPos,[0.0,0.0,0.0],[0.0,1.0,0.0]);
    mat4.rotateY(Matrices.ViewMatrix, Matrices.ViewMatrix, angleX * Math.PI / 180);
    mat4.rotateX(Matrices.ViewMatrix, Matrices.ViewMatrix, angleY * Math.PI / 180);

    // Clear the canvas
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0,0,canvas.width,canvas.height);
    gl.enable(gl.DEPTH_TEST);
    // Set up projection matrix (assuming perspective projection)
    mat4.perspective(Matrices.ProjectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100.0);

    // Loop through each mesh and render
    meshes.forEach(function(mesh) {
        // Compute matrices for the mesh
        var matrices = mesh.computeMatrices();
        var modelMat = matrices.modelMat;
        var normalMat = matrices.normalMat;
        //model rotation
        mat4.rotateX(modelMat,modelMat,angle);
        mat4.rotateY(mesh.modelMatrix,mesh.modelMatrix,angle);
        // Bind buffers and draw
        mesh.setBufferData();

        // Set uniforms
        gl.uniformMatrix4fv(uniforms.vMat, false, Matrices.ViewMatrix);
        gl.uniformMatrix4fv(uniforms.pMat, false, Matrices.ProjectionMatrix);
        gl.uniformMatrix4fv(mesh.uniforms.mMat, false, modelMat);
        gl.uniformMatrix4fv(mesh.uniforms.normMat, false, normalMat);
        gl.uniform3fv(uniforms.cameraPos, cameraPos);
        gl.uniform1f(uniforms.specInt, specInt);


        // Draw the mesh
        gl.drawElements(gl.TRIANGLES, mesh.attributes.indices.length, gl.UNSIGNED_SHORT, 0);
    });
    angle+=deltaTime;
    // Request the next frame
    requestAnimationFrame(render);
}

// Start the animation loop
render(Date.now());




