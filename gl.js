var gl;
var shader = {
	program : null,
	vert : null,
	frag : null,
	attribLocations : {},
	uniformLocations : {},
	m_mat : mat4.create(),
	v_mat : mat4.create(),
	p_mat : mat4.create()
};

var buffers = {
	vbo : null,
	ibo : null
};

var model;

function initShaders() {
	if (!gl) {
		LogConsole("In function initShaders, GL not initialized, creating")
		return;
	}
	// create the program
	shader.program = gl.createProgram();
	
	// create the shaders
	shader.vert = gl.createShader(gl.VERTEX_SHADER);
	shader.frag = gl.createShader(gl.FRAGMENT_SHADER);
	
	// load the shader sources
	var vs_el = document.getElementById("vertex-shader");
	var fs_el = document.getElementById("frag-shader");
	gl.shaderSource(shader.vert, vs_el.value);
	gl.shaderSource(shader.frag, fs_el.value);
	
	// compile vertex shader and log errors
	gl.compileShader(shader.vert);
	LogConsole("Compiling vertex shader...");
	if (!gl.getShaderParameter(shader.vert, gl.COMPILE_STATUS)) {
		LogConsoleError(gl.getShaderInfoLog(shader.vert));
		return;
	}
	else {
		LogConsole(gl.getShaderParameter(shader.vert, gl.COMPILE_STATUS));
		LogConsole(gl.getShaderInfoLog(shader.vert));
	}
	
	// compile fragment shader and log errors
	gl.compileShader(shader.frag);
	LogConsole("Compiling fragment shader...");
	if (!gl.getShaderParameter(shader.frag, gl.COMPILE_STATUS)) {
		LogConsoleError(gl.getShaderInfoLog(shader.frag));
		return;
	}
	else {
		LogConsole(gl.getShaderParameter(shader.frag, gl.COMPILE_STATUS));
		LogConsole(gl.getShaderInfoLog(shader.frag));
	}
	
	gl.attachShader(shader.program, shader.vert);
	gl.attachShader(shader.program, shader.frag);
	gl.linkProgram(shader.program);
	
	if (!gl.getProgramParameter(shader.program, gl.LINK_STATUS)) {
		LogConsoleError(gl.getProgramInfoLog(shader.program));
		return;
	}
	
	getAttributeLocations();
	getUniformLocations();
	
	gl.useProgram(shader.program);
}

function getAttributeLocations() {
	shader.attribLocations["position"] 	= gl.getAttribLocation(shader.program, "position");
	shader.attribLocations["normal"] 	= gl.getAttribLocation(shader.program, "normal");
	shader.attribLocations["color"] 	= gl.getAttribLocation(shader.program, "color");
	shader.attribLocations["uv"] 		= gl.getAttribLocation(shader.program, "uv");
}

function getUniformLocations() {
	shader.uniformLocations["modelMatrix"] 		= gl.getUniformLocation(shader.program, "modelMatrix");
	shader.uniformLocations["viewMatrix"] 		= gl.getUniformLocation(shader.program, "viewMatrix");
	shader.uniformLocations["projectionMatrix"] = gl.getUniformLocation(shader.program, "projectionMatrix");
}

function updateShaders() {
	if (!gl) {
		LogConsole("In function updateShaders, GL not initialized, creating");
		return;
	}
	LogConsole("Update Shaders");
	initShaders();
}

function initBuffers() {
	model = parseObj(pane_elements.vertices.value);
	
	LogConsole("Initializing buffers...");
	if (!gl) {
		LogConsole("In function initBuffers, GL not initialized, creating");
		return;
	}
	// generate the buffers
	buffers.vbo = gl.createBuffer();
	buffers.ibo = gl.createBuffer();
	
	
	updateBuffers();
}

function updateUniforms() {
	gl.uniformMatrix4fv(shader.uniformLocations['modelMatrix'], false, shader.m_mat);
	gl.uniformMatrix4fv(shader.uniformLocations['viewMatrix'], false, shader.m_mat);
	gl.uniformMatrix4fv(shader.uniformLocations['projectionMatrix'], false, shader.m_mat);
}

function updateBuffers() {
	// bind the vertex buffer and set the data
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vbo);
	gl.bufferData(gl.ARRAY_BUFFER, model.vertices_data, gl.STATIC_DRAW);
	
	// bind the index buffer and set the data
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.ibo);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.indices), gl.STATIC_DRAW);
}

function draw() {
	if (!gl) {
		LogConsole("In function draw, GL not initialized, creating");
		return;
	}
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);

	// set the viewport
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
	// clear the depth and color
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
	mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, shader.p_mat);
	
	mat4.identity(shader.m_mat);
	mat4.identity(shader.v_mat);
	
	mat4.translate(shader.v_mat, shader.v_mat, [-1.5, 0.0, -7.0]);
	updateUniforms();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vbo);
	var float_size = Float32Array.BYTES_PER_ELEMENT;
	var vert_size = model.vertices_objects[0].GetDataArray().length * float_size;
	var position_size = model.vertices_objects[0].position.length;
	var normal_size = model.vertices_objects[0].normal.length;
	var uv_size = model.vertices_objects[0].texcoord.length;
	var color_size = model.vertices_objects[0].color.length;
	
	//LogConsole(ObjectToString(shader));
	
	gl.vertexAttribPointer(shader.attribLocations["position"], position_size, gl.FLOAT, false, vert_size, 0);
	// gl.vertexAttribPointer(shader.attribLocations["normal"], normal_size, gl.FLOAT, false, vert_size, position_size * float_size);
	gl.vertexAttribPointer(shader.attribLocations["uv"], uv_size, gl.FLOAT, false, vert_size, (position_size + normal_size) * float_size);
	gl.vertexAttribPointer(shader.attribLocations["color"], color_size, gl.FLOAT, false, vert_size, (position_size + normal_size + uv_size) * float_size);
	
	gl.enableVertexAttribArray(shader.attribLocations["position"]);
	// gl.enableVertexAttribArray(shader.attribLocations["normal"]);
	gl.enableVertexAttribArray(shader.attribLocations["uv"]);
	gl.enableVertexAttribArray(shader.attribLocations["color"]);
	
	gl.drawElements(gl.TRIANGLES, model.indices.length/3, gl.UNSIGNED_SHORT, 0);
}

function initGL(canvas) {
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		
		// remove to remove webgl debugging
		gl = WebGLDebugUtils.makeDebugContext(gl);
		
		gl.viewportWidth = canvas.width;
		gl.viewportHeight = canvas.height;
	}
	catch (e) {}
}

function init(canvas) {
	initGL(canvas);
	if (!gl) {
		LogConsoleError("Could not initialize WebGL context");
	}
	else {
		LogConsole("WebGL Context initialized");
	}
	
	updatePaneVisibility();
	
	initShaders();
	initBuffers();
	
	LogConsole(ObjectToString(shader));
	LogConsole(ObjectToString(buffers));
	
	draw();
}