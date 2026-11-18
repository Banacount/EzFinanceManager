import { loadPage } from "../renderer.js";

const control = {};

// page name
control.name = "not-found";

// render html page
control.render = () => {
	return `
		<div class="not-found-container">
			not-found
			<button id="goHomeBtn">Go to Main Menu</button>
		</div>
	`;
};

// events, block of code, startups
control.init = () => {
	const goHomeBtn = document.getElementById("goHomeBtn");
	goHomeBtn.addEventListener("click", (e) => {
		loadPage("main-menu");
	});
}

export default control;
