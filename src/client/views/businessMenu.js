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

			<div class="business-delete-modal" id="businessDeleteModal">
				<div class="business-delete-modal-backdrop" id="businessDeleteBackdrop"></div>
				<div class="business-delete-modal-panel" role="dialog" aria-modal="true" aria-labelledby="businessDeleteTitle">
					<div class="business-delete-modal-header">
						<h3 id="businessDeleteTitle">Delete business</h3>
						<button type="button" class="business-delete-modal-close" id="businessDeleteCloseBtn">&times;</button>
					</div>
					<div class="business-delete-modal-body">
						<input type="hidden" id="businessDeleteId">
						<p id="businessDeleteMessage">Are you sure you want to delete this business?</p>
					</div>
					<div class="business-delete-modal-footer">
						<button type="button" class="business-delete-modal-cancel-btn" id="businessDeleteCancelBtn">Cancel</button>
						<button type="button" class="business-delete-modal-confirm-btn" id="businessDeleteConfirmBtn">Delete</button>
					</div>
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
	const deleteModal = document.getElementById("businessDeleteModal");
	const businessDeleteId = document.getElementById("businessDeleteId");

	exitBtn.addEventListener("click", (e) => {
		loadPage('main-menu');
	});

	const closeDeleteModal = () => {
		deleteModal.classList.remove("is-active");
	};

	const openDeleteModal = (business) => {
		businessDeleteId.value = business.BusinessID;
		document.getElementById("businessDeleteMessage").textContent =
			`Are you sure you want to delete "${business.BusinessName}"? This will also remove its accounts and records.`;
		deleteModal.classList.add("is-active");
	};

	document.getElementById("businessDeleteCloseBtn").addEventListener("click", closeDeleteModal);
	document.getElementById("businessDeleteCancelBtn").addEventListener("click", closeDeleteModal);
	document.getElementById("businessDeleteBackdrop").addEventListener("click", closeDeleteModal);

	document.getElementById("businessDeleteConfirmBtn").addEventListener("click", async (e) => {
		const business = {
			BusinessID: businessDeleteId.value
		};
		const confirmBtn = document.getElementById("businessDeleteConfirmBtn");

		confirmBtn.disabled = true;
		try {
			const contactForDelete = await ipcRenderer.invoke('delete-business', business);

			if (!contactForDelete.didFail) {
				alert("Successfully Deleted Business!");
				closeDeleteModal();
				loadBusinessItems();
			} else {
				alert(contactForDelete.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		} finally {
			confirmBtn.disabled = false;
		}
	});

	const loadBusinessItems = async () => {
		try {
			const getAllBusiness = await ipcRenderer.invoke('get-all-business');

			businessItemContainer.innerHTML = "";
			for (const business of getAllBusiness.message) {
				const itemElement = document.createElement('div');
				const titleElement = document.createElement('div');
				const h3 = document.createElement('h3');
				const p = document.createElement('p');
				const button = document.createElement('button');
				const deleteButton = document.createElement('button');
				const actions = document.createElement('div');

				itemElement.className = "item";
				titleElement.className = "title";
				actions.className = "item-actions";
				titleElement.append(h3, p)
				actions.append(button, deleteButton);
				itemElement.append(titleElement, actions);
				h3.textContent = business.BusinessName;
				p.textContent = `${business.PeriodStart} to ${business.PeriodEnd}`;
				button.textContent = "Open";
				deleteButton.className = "delete-business-btn";
				deleteButton.textContent = "Delete";
				businessItemContainer.appendChild(itemElement);

				button.addEventListener('click', (e) => {
					setBusinessId(business.BusinessID);
					loadPage('chart-of-accounts');
					chartOfAccounts.fetchAccounts();
				});

				deleteButton.addEventListener('click', (e) => openDeleteModal(business));
			}
		} catch (err) {
			console.log("Client error: ", err);
		}
	};

	createBusinessBtn.addEventListener("click", async (e) => {
		const businessNameIn = document.getElementById("inputBusinessName");
		const ownerIn = document.getElementById("inputOwnerName");
		const dateStart = document.getElementById("inputDateStart");
		const dateEnd = document.getElementById("inputDateEnd");

		const business = {
			BusinessName: businessNameIn.value.trim(),
			OwnerName: ownerIn.value.trim(),
			PeriodStart: dateStart.value,
			PeriodEnd: dateEnd.value,
		};

		createBusinessBtn.disabled = true;
		try {
			const contactForAdd = await ipcRenderer.invoke('add-business', business);

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
		} finally {
			createBusinessBtn.disabled = false;
		}
	});

	loadBusinessItems();
}

export default control;

