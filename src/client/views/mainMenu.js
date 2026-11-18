import { loadPage } from "../renderer.js";

const control = {};

// page name
control.name = "main-menu";

// render html page
control.render = () => {
	return `
		<div class="menu-container">
			<div class="menu-logo">
				<img src="assets/logo.svg" alt="ezfinancemanager-logo">
			</div>

			<div class="menu-1">
				<h1>EZFinanceManager</h1>
				<p>Run the full accounting cycle for a small business, one step at a time.</p>
			</div>

			<div class="menu-2">
				<div class="contain">
					<h2>Welcome</h2>
					<button class="start" id="startBtn">Start</button>
					<button class="settings" id="settingsBtn">Settings</button>
					<button class="exit" id="exitBtn">Exit</button>
				</div>
			</div>
		</div>
	`;
};

// events, block of code, startups
control.init = () => {
	const exitBtn = document.getElementById("exitBtn");
	const settingsBtn = document.getElementById("settingsBtn");
	const startBtn = document.getElementById("startBtn");

	exitBtn.addEventListener('click', (e) => {
		console.log(exitBtn.innerHTML);
		let secondGuess = confirm("Are you sure you wanna exit?");
		if (secondGuess)
			window.close();
	});

	startBtn.addEventListener('click', (e) => {
		loadPage('business-menu');
	});
}

export default control;
