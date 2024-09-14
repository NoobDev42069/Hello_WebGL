import {mat4,mat3} from 'gl-matrix';


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



export default class cubeMesh {
    constructor(gl,glProgram,options = {}) {


        this.size = (options.size !== undefined) ? options.size : 1;
        this.color = (options.color !== undefined) ? options.color : [0, 0, 0, 1];
        this.texture = (options.texture !== undefined) ? options.texture : null;
        this.translation = (options.translation !== undefined) ? options.translation : [0, 0, 0];
        this.origin = (options.origin !== undefined) ? options.origin : [0, 0, 0];
        this.attributes = {
            indices: [],
            vertices: [],
            colors: [],
            normals: [],
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
            vertexBuffer: gl.createBuffer(),
            indexBuffer: gl.createBuffer(),
            colorBuffer: gl.createBuffer(),
            normalBuffer: gl.createBuffer()
        };
        //--------------------------------------
        //         Attribute Locations
        //--------------------------------------
        this.attribLocations = {
            vertexPositionAttribute: gl.getAttribLocation(glProgram, 'aVertPos'),
            vertexNormalAttribute: gl.getAttribLocation(glProgram, 'aVertNormal'),
            vertexColorAttribute: gl.getAttribLocation(glProgram, 'aVertColor'),
            vertexNormalAttribute: gl.getAttribLocation(glProgram, 'aVertNormal')
        };
        //--------------------------------------
        //          Uniform Locations
        //--------------------------------------
        this.uniforms = {
            mMat: gl.getUniformLocation(glProgram, 'uMmatrix'),
            normMat: gl.getUniformLocation(glProgram, 'uNmatrix'),
        };




        //-------------------------------------------------
        //                  Attributes                     
        //-------------------------------------------------
        this.attributes.vertices = [
            // Front face
            this.origin[0] - this.size, this.origin[1] + this.size, this.origin[2] + this.size, // 0
            this.origin[0] + this.size, this.origin[1] + this.size, this.origin[2] + this.size, // 1
            this.origin[0] + this.size, this.origin[1] - this.size, this.origin[2] + this.size, // 2
            this.origin[0] - this.size, this.origin[1] - this.size, this.origin[2] + this.size, // 3

            // Back face 
            this.origin[0] - this.size, this.origin[1] + this.size, this.origin[2] - this.size, // 4
            this.origin[0] + this.size, this.origin[1] + this.size, this.origin[2] - this.size, // 5
            this.origin[0] + this.size, this.origin[1] - this.size, this.origin[2] - this.size, // 6
            this.origin[0] - this.size, this.origin[1] - this.size, this.origin[2] - this.size // 7
        ];
        this.attributes.indices = [
            //front
            0, 1, 2,
            0, 2, 3,
            //left
            4, 0, 7,
            0, 7, 3,
            //right
            1, 5, 2,
            5, 2, 6,
            //top
            6, 7, 2,
            7, 2, 3,
            //bottom
            0, 1, 4,
            1, 4, 5,
            //back
            4, 5, 7,
            5, 7, 6
        ];
        this.attributes.normals = calculateNormal(this.attributes.vertices, this.attributes.indices);
        //-------------------------------------
        //              Methods
        //-------------------------------------
        this.computeMatrices = function () {
            mat4.identity(this.modelMatrix);
            if (options.translation) {
                mat4.translate(this.modelMatrix, this.modelMatrix, this.translation);
            }
            mat4.invert(this.normalMatrix, this.modelMatrix);
            mat4.transpose(this.normalMatrix, this.normalMatrix);

            return {
                modelMat: this.modelMatrix,
                normalMat: this.normalMatrix,
            };
        };

        this.setBufferData = () => {
            if (this.color) {
                for (let i = 0; i < this.attributes.vertices.length; i++) {
                    this.attributes.colors.push.apply(this.attributes.colors, this.color);
                }
                gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.colorBuffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.attributes.colors), gl.STATIC_DRAW);
                gl.enableVertexAttribArray(this.attribLocations.vertexColorAttribute);
                gl.vertexAttribPointer(this.attribLocations.vertexColorAttribute, 4, gl.FLOAT, false, 0, 0);
            }

            //send vertex Position data
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.attributes.vertices), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.attribLocations.vertexPositionAttribute);
            gl.vertexAttribPointer(this.attribLocations.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0);

            //send normal data
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.attributes.normals), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(this.attribLocations.vertexNormalAttribute);
            gl.vertexAttribPointer(this.attribLocations.vertexNormalAttribute, 3, gl.FLOAT, true, 0, 0);

            //send Index data
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.attributes.indices), gl.STATIC_DRAW);


        };
    }
}

