import { loadPage, setBusinessId } from "../renderer.js";
import { default as chartOfAccounts } from "./worksheets/chartOfAccounts.js";
const { ipcRenderer } = require('electron');

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

					<div id="businessItems">
						<div class="item">
							<p>Loading...</p>
						</div>
					</div>

				</div>
			</div>

			<div class="section-2">
				<div class="contain">
					<h2>Create new business</h2>
					<div class="input-item">
						<p>Business name</p>
						<input type="text" id="inputBusinessName">
					</div>

					<div class="input-item">
						<p>Owner</p>
						<input type="text" id="inputOwnerName">
					</div>
					
					<div class="period">
						<div class="input-item">
							<p>Period Start</p>
							<input type="date" id="inputDateStart">
						</div>
						<div class="input-item">
							<p>Period End</p>
							<input type="date" id="inputDateEnd">
						</div>
					</div>
					
					<button id="createBusinessBtn">Create business</button>
				</div>
			</div>
		</div>
	`;
};

// events, block of code, startups
control.init = () => {
	const exitBtn = document.getElementById("businessMenuBackBtn");
	const businessItemContainer = document.getElementById("businessItems");
	const createBusinessBtn = document.getElementById("createBusinessBtn");

	exitBtn.addEventListener("click", (e) => {
		loadPage('main-menu');
	});

	const loadBusinessItems = async () => {
		try {
			const getAllBusiness = await ipcRenderer.invoke('get-all-business');
			businessItemContainer.innerHTML = "";

			for (const business of getAllBusiness) {
				const itemElement = document.createElement('div');
				const titleElement = document.createElement('div');
				const h3 = document.createElement('h3');
				const p = document.createElement('p');
				const button = document.createElement('button');

				itemElement.className = "item";
				titleElement.className = "title";
				titleElement.append(h3, p)
				itemElement.append(titleElement, button);
				h3.textContent = business.BusinessName;
				p.textContent = `${business.PeriodStart} to ${business.PeriodEnd}`;
				button.textContent = "Open";
				businessItemContainer.appendChild(itemElement);

				button.addEventListener('click', (e) => {
					setBusinessId(business.BusinessID);
					loadPage('chart-of-accounts');
					chartOfAccounts.fetchAccounts();
				});
			}
		} catch (err) {
			console.log("Client error: ", err);
		}
	};

	createBusinessBtn.addEventListener("click", async (e) => {
		try {
			const businessNameIn = document.getElementById("inputBusinessName");
			const ownerIn = document.getElementById("inputOwnerName");
			const dateStart = document.getElementById("inputDateStart");
			const dateEnd = document.getElementById("inputDateEnd");

			const business = {
				BusinessName: businessNameIn.value,
				OwnerName: ownerIn.value,
				PeriodStart: dateStart.value,
				PeriodEnd: dateEnd.value,
			};
			console.log(business);

			const contactForAdd = await ipcRenderer.invoke('add-business', business);
			console.log(contactForAdd);

			if (!contactForAdd.didFail) {
				alert("Successfully Added Business!");
				loadBusinessItems();
				businessNameIn.value = "";
				ownerIn.value = "";
				dateStart.value = "";
				dateEnd.value = "";
			} else {
				alert(contactForAdd.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		}
	});

	loadBusinessItems();
}

export default control;

