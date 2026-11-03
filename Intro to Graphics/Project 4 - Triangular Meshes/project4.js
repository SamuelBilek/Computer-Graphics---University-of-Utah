// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection( projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY )
{
	const mRotX = [
		1, 0, 0, 0,
		0, Math.cos(rotationX), Math.sin(rotationX), 0,
		0, -Math.sin(rotationX), Math.cos(rotationX), 0,
		0, 0, 0, 1
	]
	const mRotY = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	]
	var trans = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		translationX, translationY, translationZ, 1
	];
	const mRXY = MatrixMult(mRotY, mRotX)
	var mvp = MatrixMult(MatrixMult( projectionMatrix, trans ), mRXY)
	return mvp;
}


// Vertex shader source code
var objVS = `
	attribute vec3 pos;
	attribute vec2 txc;

	uniform mat4 mvp;
	uniform int swapYZ;

	varying vec2 texCoords;

	float decideSwap(float a, float b, int swap) {
		float clampedSwap = clamp(float(swap), 0.0, 1.0);
		return (1.0 - clampedSwap) * a + clampedSwap * b;
	}

	vec2 getSwapDecided(vec2 co, int swap) {
		return vec2(decideSwap(co.x, co.y, swap), decideSwap(co.y, co.x, swap));
	}

	void main()
	{
		texCoords = txc;	

		vec4 finalPos = vec4(pos.x, getSwapDecided(pos.yz, swapYZ), 1);
		gl_Position = mvp * finalPos;
	}
`;
// Fragment shader source code
var objFS = `
	precision mediump float;

	uniform int showTexture;
	uniform sampler2D tex;
	varying vec2 texCoords;

	void main()
	{
		float showTex = clamp(float(showTexture), 0.0, 1.0);
		gl_FragColor = (1.0 - showTex) * vec4(1,gl_FragCoord.z*gl_FragCoord.z,0,1) + showTex * texture2D(tex, texCoords);
	}
`;

// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		this.prog = InitShaderProgram(objVS, objFS)

		this.mvp = gl.getUniformLocation(this.prog, 'mvp')
		this.swap = gl.getUniformLocation(this.prog, 'swapYZ')
		this.showTx = gl.getUniformLocation(this.prog, 'showTexture')

		this.vertPos = gl.getAttribLocation(this.prog, 'pos')
		this.txcPos = gl.getAttribLocation(this.prog, 'txc')

		this.vertBuffer = gl.createBuffer()
		this.txcBuffer = gl.createBuffer()

		this.texture = gl.createTexture()
		this.sampler = gl.getUniformLocation(this.prog, 'tex')

		this.showTexture(true) // To be consistent with the default state of the "Show Texture" checkbox.
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txcBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW)
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader

		gl.useProgram(this.prog)
		gl.uniform1i(this.swap, swap)
	}
	
	// This method is called to draw the triangular mesh.
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
	draw( trans )
	{
		// [TO-DO] Complete the WebGL initializations before drawing

		gl.useProgram(this.prog)
		gl.uniformMatrix4fv(this.mvp, false, trans)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuffer)
		gl.vertexAttribPointer(this.vertPos, 3, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.vertPos)

		gl.bindBuffer(gl.ARRAY_BUFFER, this.txcBuffer)
		gl.vertexAttribPointer(this.txcPos, 2, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(this.txcPos)

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		gl.generateMipmap(gl.TEXTURE_2D);

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.useProgram(this.prog)
		gl.uniform1i(this.sampler, 0) //Texture unit 0
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		gl.useProgram(this.prog)
		gl.uniform1i(this.showTx, show)
	}
	
}
