// states for the various panes that can be visible
// true is visible, false is not
var pane_state = {
	vertices : true,
	geometry : true,
	vertex : true,
	fragment : true,
	console : true
};
var pane_elements;

function updatePaneVisibility() {
	if (!pane_elements) {
		pane_elements = {};
		pane_elements.vertices = document.getElementById('vertex-inputs');
		pane_elements.geometry = document.getElementById('geometry-shader');
		pane_elements.vertex = document.getElementById('vertex-shader');
		pane_elements.fragment = document.getElementById('frag-shader');
		pane_elements.console = document.getElementById('console');
	}
	
	for (var prop in pane_elements) {
		if (pane_state[prop]) {
			removeClass(pane_elements[prop], "invisible");
		}
		else {
			addClass(pane_elements[prop], "invisible");
		}
	}
}

function toggle(pane) {
	LogConsole("Changing visibility of " + pane);
	// ignores calls that don't refer to a proper pane
	if (pane_state.hasOwnProperty(pane)) {
		pane_state[pane] = !pane_state[pane];
	}
	
	updatePaneVisibility();
}