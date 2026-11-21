import { getBusinessId } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
const { ipcRenderer } = require('electron');

const control = {};

control.name = 'journal-entries';
control.entries = null;
control.activeFilter = '';
control.activeSearch = '';
control.modalAccounts = [];

const formatAmount = (amount) => (amount / 100).toLocaleString('en-US', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

const toCentavos = (value) => Math.round(Number(value || 0) * 100);

const entryMatchesFilter = (entry) => {
	if (control.activeFilter === 'cash') {
		return entry.lines.some(line => line.AccountCode === '110' || line.AccountName.toLowerCase().includes('cash'));
	}
	if (control.activeFilter === 'on-account') {
		return entry.lines.some(line => line.AccountType === 'Liability');
	}
	if (control.activeFilter === 'expenses') {
		return entry.lines.some(line => line.AccountType === 'Expenses');
	}
	return true;
};

const entryMatchesSearch = (entry) => {
	if (!control.activeSearch) return true;

	return entry.EntryDate.toLowerCase().includes(control.activeSearch) ||
		entry.Description.toLowerCase().includes(control.activeSearch);
};

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Journal Entries</h2>
					<p class="coa-subtitle">General Journal · Jan 1, 2026 to Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<input type="search" id="searchJournalInput" placeholder="Search date or description">
					<button type="button" class="coa-primary-btn" id="addEntryBtn">Add entry +</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active" data-filter="">All</button>
				<button type="button" data-filter="cash">Cash</button>
				<button type="button" data-filter="on-account">On Account</button>
				<button type="button" data-filter="expenses">Expenses</button>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">Date</th>
							<th class="col-title">Particulars</th>
							<th>Ref</th>
							<th class="text-right">Debit</th>
							<th class="text-right">Credit</th>
						</tr>
					</thead>
					<tbody id="journalEntriesTable">
						<tr>
							<td class="col-no mono-nums">2026-01-02</td>
							<td class="col-title">Cash</td>
							<td class="tabular-nums">110</td>
							<td class="text-right mono-nums">150,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Owner’s capital</td>
							<td class="tabular-nums">310</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">150,000.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Initial owner investment into Juan’s Bakery</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="coa-edit-modal je-entry-modal" id="journalEntryModal">
				<div class="coa-edit-modal-backdrop" id="journalEntryBackdrop"></div>
				<div class="coa-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="journalEntryTitle">
					<div class="coa-edit-modal-header">
						<h3 id="journalEntryTitle">Add journal entry</h3>
						<button type="button" class="coa-edit-modal-close" id="journalEntryCloseBtn">&times;</button>
					</div>

					<div class="coa-edit-modal-body">
						<div class="coa-edit-modal-field">
							<label for="entryDateInput">Date</label>
							<input type="date" id="entryDateInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="entryReferenceInput">Reference no.</label>
							<input type="text" id="entryReferenceInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="entryDescriptionInput">Description</label>
							<input type="text" id="entryDescriptionInput">
						</div>
						<div class="coa-edit-modal-field">
							<label for="entryCreatedByInput">Created by</label>
							<input type="text" id="entryCreatedByInput">
						</div>

						<div class="je-line-header">
							<span>Account</span>
							<span>Debit</span>
							<span>Credit</span>
						</div>
						<div id="journalEntryLines"></div>
						<button type="button" class="je-add-line-btn" id="addJournalLineBtn">Add line +</button>
					</div>

					<div class="coa-edit-modal-footer">
						<button type="button" class="coa-edit-modal-secondary-btn" id="journalEntryCancelBtn">Cancel</button>
						<button type="button" class="coa-edit-modal-primary-btn" id="journalEntrySaveBtn">Save entry</button>
					</div>
				</div>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);

	const entryModal = document.getElementById("journalEntryModal");
	const saveBtn = document.getElementById("journalEntrySaveBtn");

	const closeEntryModal = () => {
		entryModal.classList.remove("is-active");
	};

	document.getElementById("journalEntryCloseBtn").addEventListener("click", closeEntryModal);
	document.getElementById("journalEntryCancelBtn").addEventListener("click", closeEntryModal);
	document.getElementById("journalEntryBackdrop").addEventListener("click", closeEntryModal);
	document.getElementById("addJournalLineBtn").addEventListener("click", (e) => control.addJournalLine(control.modalAccounts));

	saveBtn.addEventListener("click", async (e) => {
		const lineRows = document.querySelectorAll("#journalEntryLines .je-line");
		const entry = {
			BusinessID: getBusinessId(),
			EntryDate: document.getElementById("entryDateInput").value,
			ReferenceNo: document.getElementById("entryReferenceInput").value,
			Description: document.getElementById("entryDescriptionInput").value,
			CreatedBy: document.getElementById("entryCreatedByInput").value,
			Lines: Array.from(lineRows).map((row) => ({
				AccountID: row.querySelector('select').value,
				Debit: toCentavos(row.querySelector('.je-debit-input').value),
				Credit: toCentavos(row.querySelector('.je-credit-input').value)
			}))
		};

		saveBtn.disabled = true;
		try {
			const contactForEntry = await ipcRenderer.invoke('add-journal-entry', entry);
			if (!contactForEntry.didFail) {
				alert("Successfully Added Journal Entry!");
				closeEntryModal();
				control.fetchJournalEntries();
			} else {
				alert(contactForEntry.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		} finally {
			saveBtn.disabled = false;
		}
	});

	document.getElementById("addEntryBtn").addEventListener("click", (e) => control.openJournalEntryModal());

	const filterButtons = document.querySelectorAll(`#${control.name} .coa-filters button[data-filter]`);
	filterButtons.forEach((button) => {
		button.addEventListener('click', (e) => {
			filterButtons.forEach((other) => other.classList.remove('is-active'));
			button.classList.add('is-active');
			control.activeFilter = button.dataset.filter;
			control.renderEntryRows(control.entries);
		});
	});

	document.getElementById("searchJournalInput").addEventListener("input", (e) => {
		control.activeSearch = e.target.value.trim().toLowerCase();
		control.renderEntryRows(control.entries);
	});
};

control.openJournalEntryModal = async () => {
	if (getBusinessId() < 0) return;

	const getAccounts = await ipcRenderer.invoke('get-all-accounts', getBusinessId());
	if (getAccounts.didFail) {
		alert(getAccounts.message);
		return;
	}

	control.modalAccounts = getAccounts.message;
	document.getElementById("entryDateInput").value = new Date().toISOString().slice(0, 10);
	document.getElementById("entryReferenceInput").value = "";
	document.getElementById("entryDescriptionInput").value = "";
	document.getElementById("entryCreatedByInput").value = "System";
	document.getElementById("journalEntryLines").innerHTML = "";

	control.addJournalLine(control.modalAccounts);
	control.addJournalLine(control.modalAccounts);
	document.getElementById("journalEntryModal").classList.add("is-active");
};

control.addJournalLine = (accounts) => {
	const lineContainer = document.getElementById("journalEntryLines");
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

control.renderEntryRows = (entries) => {
	const journalEntriesTable = document.getElementById("journalEntriesTable");
	journalEntriesTable.innerHTML = "";
	if (!entries) return;

	const displayedEntries = entries.filter(entry => entryMatchesFilter(entry) && entryMatchesSearch(entry));

	if (displayedEntries.length === 0) {
		const tr = document.createElement('tr');
		const empty_ = document.createElement('td');

		empty_.colSpan = 5;
		empty_.textContent = "No journal entries match the current filters.";

		tr.append(empty_);
		journalEntriesTable.appendChild(tr);
		return;
	}

	for (const entry of displayedEntries) {
		entry.lines.forEach((line, index) => {
			const tr = document.createElement('tr');
			const date_ = document.createElement('td');
			const particulars_ = document.createElement('td');
			const ref_ = document.createElement('td');
			const debit_ = document.createElement('td');
			const credit_ = document.createElement('td');

			date_.className = 'col-no mono-nums';
			particulars_.className = 'col-title';
			if (index > 0) {
				particulars_.classList.add('indent-credit');
			}
			ref_.className = 'tabular-nums';
			debit_.className = 'text-right mono-nums';
			credit_.className = 'text-right mono-nums';

			date_.textContent = index === 0 ? entry.EntryDate : "";
			particulars_.textContent = line.AccountName;
			ref_.textContent = line.AccountCode;
			debit_.textContent = line.Debit > 0 ? formatAmount(line.Debit) : "";
			credit_.textContent = line.Credit > 0 ? formatAmount(line.Credit) : "";

			tr.append(date_, particulars_, ref_, debit_, credit_);
			journalEntriesTable.appendChild(tr);
		});

		const noteRow = document.createElement('tr');
		const noteSpacer = document.createElement('td');
		const note = document.createElement('td');

		noteRow.className = 'entry-note';
		note.colSpan = 4;
		note.textContent = entry.Description;

		noteRow.append(noteSpacer, note);
		journalEntriesTable.appendChild(noteRow);
	}
};

control.fetchJournalEntries = async () => {
	if (getBusinessId() < 0) return;

	const getJournal = await ipcRenderer.invoke('get-journal-entries', getBusinessId());
	if (getJournal.didFail) return getJournal;

	control.entries = getJournal.message;
	control.renderEntryRows(control.entries);
};

export default control;
