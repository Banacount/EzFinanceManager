import { loadPage } from "../renderer.js";

const control = {};

// page name
control.name = "business-menu";

// render html page
control.render = () => {
	return `
		<div class="business-menu-container">
			<div class="section-1">
				<button id="businessMenuBackBtn">Back</button>
				<h1>Select a business</h1>
				<p>Open a business you are managing, or create a new one.</p>
				<div class="table">
					<div class="header"><h2>Your business</h2></div>

					<div class="item">
						<h3>Example Business Title</h3>
						<button>Open</button>
					</div>

					<div class="item">
						<h3>Example Business Title</h3>
						<button>Open</button>
					</div>

					<div class="item">
						<h3>Example Business Title</h3>
						<button>Open</button>
					</div>
				</div>
			</div>

			<div class="section-2">
				<div class="contain">
					<h2>Create new business</h2>
					<div class="input-item">
						<p>Business name</p>
						<input type="text">
					</div>

					<div class="input-item">
						<p>Owner</p>
						<input type="text">
					</div>
					
					<div class="period">
						<div class="input-item">
							<p>Period Start</p>
							<input type="date">
						</div>
						<div class="input-item">
							<p>Period End</p>
							<input type="date">
						</div>
					</div>
				</div>
			</div>
		</div>
	`;
};

// events, block of code, startups
control.init = () => {
	const exitBtn = document.getElementById("businessMenuBackBtn");
	exitBtn.addEventListener("click", (e) => {
		loadPage('main-menu');
	});
}

export default control;

