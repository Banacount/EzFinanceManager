import { loadPage } from "../renderer.js";

const control = {};

// page name
control.name = "business-menu";

// render html page
control.render = () => {
	return `
		<div class="menu-container">
			business-menu
		</div>
	`;
};

// events, block of code, startups
control.init = () => {
}

export default control;

