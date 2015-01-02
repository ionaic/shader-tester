var Vertex = function() {
	this.position 	= [0.0, 0.0, 0.0, 0.0];
	this.normal 	= [0.0, 0.0, 0.0];
	this.texcoord 	= [0.0, 0.0];
	this.color 		= [0.0, 0.0, 0.0, 1.0];
	this.GetDataArray = function() {
		// guarantee that we have default values in case of undefined
		return (this.position || this.prototype.position).concat(this.normal || this.prototype.normal, this.texcoord || this.prototype.texcoord, this.color || this.prototype.color);
	};
};

var IndexedData = function() {
	this.vertices_objects = [];
	this.vertices_data = new Float32Array();
	this.indices = [];	
}

function parseObj(str) {
	// currently does a naive conversion, ends up with non-indexed geometry
	// TODO try to convert obj indexed geometry to indexed VBO (make a hashset, index in on string of the combination)
	LogConsole("Parsing OBJ...");
	var lines = str.split("\n");
	var verts = {};
	
	var positions = [];
	var normals = [];
	var texcoords = [];
	var vert_objs = {};
	var faces = [];
	
	// parse the obj string into arrays
	for (var idx = 0; idx < lines.length; ++idx) {
		var token = lines[idx].match(/[A-Za-z#]+/);
		if (token == "#" || !token) {
			continue;
		}
		var values = lines[idx].match(/[0-9.-]+/g);
		if (token == "v") {
			var tmp = [];
			tmp[0] = values[0] || 0.0; // if value parsing failed, default to (0,0,0,1)
			tmp[1] = values[1] || 0.0;
			tmp[2] = values[2] || 0.0;
			tmp[3] = values[3] || 1.0;
			positions.push(tmp);
		}
		else if (token == "vt") {
			var tmp = [];
			tmp[0] = values[0] || 0.0; // if value parsing failed, default to (0,0)
			tmp[1] = values[1] || 0.0;
			texcoords.push(tmp);
		}
		else if (token == "vn") {
			var tmp = [];
			tmp[0] = values[0] || 0.0; // if value parsing failed, default to (0,0,0,1)
			tmp[1] = values[1] || 0.0;
			tmp[2] = values[2] || 1.0;
			normals.push(tmp);
		}
		else if (token == "f") {
			values = lines[idx].match(/[0-9\/]+/g);
			if (values) {
				for (var val in values) {
					// need to prevent duplicates, use object as set
					vert_objs[values[val]] = -1;
				}
				faces.push(values.join(" "));
			}
			else {
				LogConsoleError("Face found with null value on line " + (idx + 1) + ": " + lines[idx]);
			}
		}
		else {
			LogConsoleError("Unknown or un-implemented starting token " + token);
			continue;
		}
	}
	
	// produce the vertex objects to be indexed
	for (var v in vert_objs) {
		var idxs = v.split("/");
		
		var tmp_v = new Vertex();
		tmp_v.position = positions[idxs[0]];
		tmp_v.texcoord = texcoords[idxs[1]];
		tmp_v.normal = normals[idxs[2]];
		
		if (!tmp_v.position) {
			LogConsoleError("No vertex defined for index " + idxs[0] + " in face definition " + idxs + "\n\tMax index defined is " + (positions.length-1));
			continue;
		}
		if (!tmp_v.texcoord && idxs[1] >= 0) {
			LogConsoleError("No texture coordinate defined for index " + idxs[1] + " in face definition " + idxs + "\n\tMax index defined is " + (texcoords.length - 1));
		}
		if (!tmp_v.normal && idxs[2] >= 0) {
			LogConsoleError("No vertex normal defined for index " + idxs[2] + " in face definition " + idxs + "\n\tMax index defined is " + (normals.length-1));
		}
		verts[v] = tmp_v;
	}
	
	// set up indices
	var rdata = new IndexedData();
	LogConsole(faces);
	for (var f in faces) {
		var tmp_f = faces[f].split(" ");
		
		// TODO currently require the definitions to be triangle faces
		for (var idx = 0; idx < 3; ++idx) {
			// fill in a default vertex if it does not exist
			// undefined vertex values filled in by the GetDataArray function
			if (verts[tmp_f[idx]]) {
				// if this value is -1, then it has not been added to the vertices array yet
				if (vert_objs[tmp_f[idx]] < 0) {
					rdata.vertices_objects.push(verts[tmp_f[idx]]);
					
					LogConsole("Adding vertex " + tmp_f[idx] + " at index " + (rdata.vertices_objects.length - 1));
					
					vert_objs[tmp_f[idx]] = rdata.vertices_objects.length - 1;
				}
			}
			else {
				rdata.vertices_objects.push((new Vertex()));
				
				LogConsoleError("No vertex found at index " + tmp_f[idx] + "\n\tin face " + f + ": " + faces[f] + "\nFilling in default vertex at index " + (rdata.vertices_objects.length - 1));
				
				vert_objs[tmp_f[idx]] = rdata.vertices_objects.length - 1;
			}
			
			// add the index
			rdata.indices.push(vert_objs[tmp_f[idx]]);
		}
		if (tmp_f.length > 3) {
			LogConsoleError("Extra vertices given for face definition, currently requires triangle faces.\n\tface " + f + ": " + faces[f]);
		}
		
	}
	
	rdata.vertices_data = new Float32Array([].concat.apply([], rdata.vertices_objects.map(function(val) { return val.GetDataArray(); })));
	
	LogConsole("OBJ Parsing done.");
	
	return rdata;
}