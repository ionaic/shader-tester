// utilities
var gl_console = null;

// error logging
function CreateConsoleMessage(message) {
	// TODO sanitize the messages
	var p = document.createElement("pre");
	var text = document.createTextNode(message);
	p.appendChild(text);
	return p;
}
function LogConsole(message) {
	if (!gl_console) {
		gl_console = document.getElementById("console");
	}
	gl_console.appendChild(CreateConsoleMessage(message));
}
function LogConsoleError(message) {
	if (!gl_console) {
		gl_console = document.getElementById("console");
	}
	var console_element = CreateConsoleMessage(message);
	addClass(console_element, "gl-console-error");
	gl_console.appendChild(console_element);
}
function ObjectToString(obj, depth) {
	if (!depth) {
		depth = 0;
	}
	var tabdepth = new Array(depth + 1).join("\t");
	var str = "{\n";
	for (var prop in obj) {
		str += tabdepth + "\t" + prop + " : ";
		if (typeof obj[prop] == "object") {
			str += ObjectToString(obj[prop], depth + 1);
		}
		else if (typeof obj[prop] == "undefined") {
			str += "undefined";
		}
		else {
			str += obj[prop];
		}
		str += ",\n";;
	}
	str += tabdepth + "}";
	return str;
}

/* add a class */
function addClass(obj, selected_class) {
	if (obj.className === undefined) {
		obj.className = selected_class;
	}
	else {
		classes = obj.className.split(' ');
		if (classes.indexOf === undefined) {
			// going the long way for older browsers
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] === selected_class) {
					break;
				}
			}
		}
		else {
			var idx = classes.indexOf(selected_class);
			if (idx < 0) {
				classes.push(selected_class);
			}
		}
		obj.className = classes.join(" ");
	}
	return obj;
}

/* remove a class */
function removeClass(obj, selected_class) {
	if (obj.className === undefined) {
		obj.className = "";
	}
	else {
		classes = obj.className.split(' ');
		if (classes.indexOf === undefined) {
			// going the long way for older browsers
			for (var i = 0; i < classes.length; i++) {
				if (classes[i] === selected_class) {
					classes.splice(i, 1);
				}
			}
		}
		else {
			var idx = classes.indexOf(selected_class);
			if (idx >= 0) {
				classes.splice(idx, 1);
			}
		}
		obj.className = classes.join(" ");
	}
	return obj;
}