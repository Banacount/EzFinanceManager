import { getBusinessId, getBusinessName } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { fetchAccounts, formatAmount } from './reportData.js';
const { ipcRenderer } = require('electron');

const control = {};

control.name = 'aje';
control.entries = null;
control.activeFilter = '';
control.activeSearch = '';
control.modalAccounts = [];

const toCentavos = (value) => Math.round(Number(value || 0) * 100);

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Adjusting Journal Entries (AJE)</h2>
					<p class="coa-subtitle">Period-end adjustments · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<input type="search" id="searchAdjustmentsInput" placeholder="Search adjusting entry">
					<button type="button" class="coa-primary-btn" id="addAdjustmentBtn">Add AJE +</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active" data-filter="">All</button>
				<button type="button" data-filter="Deferral">Deferrals</button>
				<button type="button" data-filter="Accrual">Accruals</button>
				<button type="button" data-filter="Depreciation">Depreciation</button>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">Date</th>
							<th class="col-title">Particulars</th>
							<th>Type</th>
							<th class="text-right">Debit</th>
							<th class="text-right">Credit</th>
						</tr>
					</thead>
					<tbody id="adjustmentsTable"></tbody>
				</table>
			</div>

			<div class="coa-edit-modal je-entry-modal aje-entry-modal" id="adjustmentModal">
				<div class="coa-edit-modal-backdrop" id="adjustmentBackdrop"></div>
				<div class="coa-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="adjustmentTitle">
					<div class="coa-edit-modal-header">
						<h3 id="adjustmentTitle">Add adjusting entry</h3>
						<button type="button" class="coa-edit-modal-close" id="adjustmentCloseBtn">&times;</button>
					</div>

					<div class="coa-edit-modal-body">
						<div class="coa-edit-modal-field">
							<label for="adjustmentDateInput">Date</label>
							<input type="date" id="adjustmentDateInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="adjustmentReferenceInput">Reference no.</label>
							<input type="text" id="adjustmentReferenceInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="adjustmentTypeInput">Type</label>
							<select id="adjustmentTypeInput">
								<option value="Deferral">Deferral</option>
								<option value="Accrual">Accrual</option>
								<option value="Depreciation">Depreciation</option>
							</select>
						</div>
						<div class="coa-edit-modal-field">
							<label for="adjustmentDescriptionInput">Description</label>
							<input type="text" id="adjustmentDescriptionInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="adjustmentCreatedByInput">Created by</label>
							<input type="text" id="adjustmentCreatedByInput">
						</div>

						<div class="je-line-header">
							<span>Account</span>
							<span>Debit</span>
							<span>Credit</span>
						</div>
						<div id="adjustmentLines"></div>
						<button type="button" class="je-add-line-btn" id="addAdjustmentLineBtn">Add line +</button>
					</div>

					<div class="coa-edit-modal-footer">
						<button type="button" class="coa-edit-modal-secondary-btn" id="adjustmentCancelBtn">Cancel</button>
						<button type="button" class="coa-edit-modal-primary-btn" id="adjustmentSaveBtn">Save adjustment</button>
					</div>
				</div>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);

	const adjustmentModal = document.getElementById("adjustmentModal");
	const saveBtn = document.getElementById("adjustmentSaveBtn");

	const closeAdjustmentModal = () => {
		adjustmentModal.classList.remove("is-active");
	};

	document.getElementById("adjustmentCloseBtn").addEventListener("click", closeAdjustmentModal);
	document.getElementById("adjustmentCancelBtn").addEventListener("click", closeAdjustmentModal);
	document.getElementById("adjustmentBackdrop").addEventListener("click", closeAdjustmentModal);
	document.getElementById("addAdjustmentLineBtn").addEventListener("click", (e) => control.addAdjustmentLine(control.modalAccounts));

	saveBtn.addEventListener("click", async (e) => {
		const lineRows = document.querySelectorAll("#adjustmentLines .je-line");
		const adjustment = {
			BusinessID: getBusinessId(),
			AdjustmentDate: document.getElementById("adjustmentDateInput").value,
			ReferenceNo: document.getElementById("adjustmentReferenceInput").value,
			AdjustmentType: document.getElementById("adjustmentTypeInput").value,
			Description: document.getElementById("adjustmentDescriptionInput").value,
			CreatedBy: document.getElementById("adjustmentCreatedByInput").value,
			Lines: Array.from(lineRows).map((row) => ({
				AccountID: row.querySelector('select').value,
				Debit: toCentavos(row.querySelector('.je-debit-input').value),
				Credit: toCentavos(row.querySelector('.je-credit-input').value)
			}))
		};

		saveBtn.disabled = true;
		try {
			const contactForAdjustment = await ipcRenderer.invoke('add-adjustment', adjustment);
			if (!contactForAdjustment.didFail) {
				alert("Successfully Added Adjusting Entry!");
				closeAdjustmentModal();
				control.fetchAdjustments();
			} else {
				alert(contactForAdjustment.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		} finally {
			saveBtn.disabled = false;
		}
	});

	document.getElementById("addAdjustmentBtn").addEventListener("click", (e) => control.openAdjustmentModal());

	const filterButtons = document.querySelectorAll(`#${control.name} .coa-filters button[data-filter]`);
	filterButtons.forEach((button) => {
		button.addEventListener('click', (e) => {
			filterButtons.forEach((other) => other.classList.remove('is-active'));
			button.classList.add('is-active');
			control.activeFilter = button.dataset.filter;
			control.renderAdjustmentRows(control.entries);
		});
	});

	document.getElementById("searchAdjustmentsInput").addEventListener("input", (e) => {
		control.activeSearch = e.target.value.trim().toLowerCase();
		control.renderAdjustmentRows(control.entries);
	});
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · Period-end adjustments`;
	}
};

control.openAdjustmentModal = async () => {
	if (getBusinessId() < 0) return;

	const getAccounts = await fetchAccounts();
	if (!getAccounts) return;

	control.modalAccounts = getAccounts;
	document.getElementById("adjustmentDateInput").value = new Date().toISOString().slice(0, 10);
	document.getElementById("adjustmentReferenceInput").value = "";
	document.getElementById("adjustmentTypeInput").value = "Deferral";
	document.getElementById("adjustmentDescriptionInput").value = "";
	document.getElementById("adjustmentCreatedByInput").value = "System";
	document.getElementById("adjustmentLines").innerHTML = "";

	control.addAdjustmentLine(control.modalAccounts);
	control.addAdjustmentLine(control.modalAccounts);
	document.getElementById("adjustmentModal").classList.add("is-active");
};

control.addAdjustmentLine = (accounts) => {
	const lineContainer = document.getElementById("adjustmentLines");
	if (!accounts) return;

	const lineRow = document.createElement('div');
	const accountSelect = document.createElement('select');
	const debitInput = document.createElement('input');
	const creditInput = document.createElement('input');

	lineRow.className = 'je-line';
	accountSelect.className = 'je-account-select';
	debitInput.className = 'je-debit-input';
	creditInput.className = 'je-credit-input';

	debitInput.type = 'number';
	creditInput.type = 'number';
	debitInput.min = '0';
	creditInput.min = '0';
	debitInput.step = '0.01';
	creditInput.step = '0.01';
	debitInput.placeholder = 'Debit';
	creditInput.placeholder = 'Credit';

	for (const account of accounts) {
		const option = document.createElement('option');
		option.value = account.AccountID;
		option.textContent = `${account.AccountCode} - ${account.AccountName}`;
		accountSelect.appendChild(option);
	}

	lineRow.append(accountSelect, debitInput, creditInput);
	lineContainer.appendChild(lineRow);
};

control.fetchAdjustments = async () => {
	if (getBusinessId() < 0) return null;

	const getEntries = await ipcRenderer.invoke('get-adjustments', getBusinessId());
	if (getEntries.didFail) return getEntries;

	control.entries = getEntries.message;
	control.renderAdjustmentRows(control.entries);
	return control.entries;
};

control.renderAdjustmentRows = (entries) => {
	const tableBody = document.getElementById("adjustmentsTable");
	tableBody.innerHTML = "";
	control.updateSubtitle();
	if (!entries) return;

	const displayedEntries = entries.filter((entry) => {
		const matchesFilter = !control.activeFilter || entry.AdjustmentType === control.activeFilter;
		const matchesSearch = !control.activeSearch ||
			entry.AdjustmentDate.toLowerCase().includes(control.activeSearch) ||
			entry.Description.toLowerCase().includes(control.activeSearch) ||
			entry.ReferenceNo.toLowerCase().includes(control.activeSearch);
		return matchesFilter && matchesSearch;
	});

	if (displayedEntries.length === 0) {
		const tr = document.createElement('tr');
		const empty_ = document.createElement('td');
		empty_.colSpan = 5;
		empty_.textContent = entries.length > 0 ? "No adjustments match the current filters." : "No adjusting entries yet.";
		tr.appendChild(empty_);
		tableBody.appendChild(tr);
		return;
	}

	for (const entry of displayedEntries) {
		entry.lines.forEach((line, index) => {
			const tr = document.createElement('tr');
			const date_ = document.createElement('td');
			const particulars_ = document.createElement('td');
			const type_ = document.createElement('td');
			const debit_ = document.createElement('td');
			const credit_ = document.createElement('td');

			date_.className = 'col-no mono-nums';
			particulars_.className = 'col-title';
			if (index > 0) particulars_.classList.add('indent-credit');
			type_.textContent = index === 0 ? entry.AdjustmentType : "";
			debit_.className = 'text-right mono-nums';
			credit_.className = 'text-right mono-nums';

			date_.textContent = index === 0 ? entry.AdjustmentDate : "";
			particulars_.textContent = line.AccountName;
			debit_.textContent = line.Debit > 0 ? formatAmount(line.Debit) : "";
			credit_.textContent = line.Credit > 0 ? formatAmount(line.Credit) : "";

			tr.append(date_, particulars_, type_, debit_, credit_);
			tableBody.appendChild(tr);
		});

		const noteRow = document.createElement('tr');
		const noteSpacer = document.createElement('td');
		const note = document.createElement('td');
		noteRow.className = 'entry-note';
		note.colSpan = 4;
		note.textContent = entry.Description;
		noteRow.append(noteSpacer, note);
		tableBody.appendChild(noteRow);
	}
};

export default control;
