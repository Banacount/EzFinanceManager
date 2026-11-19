import { getBusinessId } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
const { ipcRenderer } = require('electron');

const control = {};

control.name = 'chart-of-accounts';
control.accounts = null;
control.activeClassification = '';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<h2>Chart of Accounts</h2>
				<div class="coa-actions">
					<input type="search" placeholder="Search number or title">
					<button type="button" class="coa-primary-btn" id="addAccountBtn">Add account +</button>
					<button type="button" class="coa-secondary-btn" id="selectAccountsBtn">Select</button>
					<button type="button" class="coa-delete-selected-btn" id="deleteSelectedAccountsBtn">Delete selected</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active" data-classification="">All</button>
				<button type="button" data-classification="Asset">Assets</button>
				<button type="button" data-classification="Liability">Liabilities</button>
				<button type="button" data-classification="Owners Equity">Equity</button>
				<button type="button" data-classification="Income">Income</button>
				<button type="button" data-classification="Expenses">Expenses</button>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">No.</th>
							<th class="col-title">Account title</th>
							<th class="col-class">Classification</th>
							<th class="col-normal">Normal balance</th>
						</tr>
					</thead>
					<tbody id="accountsTable">
						<tr>
							<td class="col-no tabular-nums">110</td>
							<td class="col-title">Cash</td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">120</td>
							<td class="col-title">Accounts receivable</td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">150</td>
							<td class="col-title">Prepaid supplies</td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">155</td>
							<td class="col-title">Prepaid rent</td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">190</td>
							<td class="col-title">Equipment</td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">195</td>
							<td class="col-title"><span>Accumulated depreciation-equipment</span><span class="contra-tag">contra</span></td>
							<td class="col-class">Asset</td>
							<td class="col-normal">Credit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">210</td>
							<td class="col-title">Accounts payable</td>
							<td class="col-class">Liability</td>
							<td class="col-normal">Credit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">310</td>
							<td class="col-title">Owner’s capital</td>
							<td class="col-class">Equity</td>
							<td class="col-normal">Credit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">320</td>
							<td class="col-title"><span>Owner’s drawings</span><span class="contra-tag">contra</span></td>
							<td class="col-class">Equity</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">410</td>
							<td class="col-title">Service fee</td>
							<td class="col-class">Income</td>
							<td class="col-normal">Credit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">520</td>
							<td class="col-title">Salaries expense</td>
							<td class="col-class">Expense</td>
							<td class="col-normal">Debit</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums"></td>
							<td class="col-title">Rent expense</td>
							<td class="col-class">Expense</td>
							<td class="col-normal">Debit</td>
						</tr>
					</tbody>
				</table>
			</div>

			<div class="coa-edit-modal" id="accountFormModal">
				<div class="coa-edit-modal-backdrop" id="accountFormBackdrop"></div>
				<div class="coa-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="accountFormTitle">
					<div class="coa-edit-modal-header">
						<h3 id="accountFormTitle">Add account</h3>
						<button type="button" class="coa-edit-modal-close" id="accountFormCloseBtn">&times;</button>
					</div>

					<div class="coa-edit-modal-body">
						<input type="hidden" id="accountFormId">
						<div class="coa-edit-modal-field">
							<label for="accountFormCode">Account code</label>
							<input type="text" id="accountFormCode">
						</div>
						<div class="coa-edit-modal-field">
							<label for="accountFormName">Account title</label>
							<input type="text" id="accountFormName">
						</div>
						<div class="coa-edit-modal-field">
							<label for="accountFormType">Classification</label>
							<select id="accountFormType">
								<option value="Asset">Asset</option>
								<option value="Liability">Liability</option>
								<option value="Owners Equity">Owners Equity</option>
								<option value="Income">Income</option>
								<option value="Expenses">Expenses</option>
							</select>
						</div>
						<div class="coa-edit-modal-field">
							<label for="accountFormNormalBalance">Normal balance</label>
							<select id="accountFormNormalBalance">
								<option value="Debit">Debit</option>
								<option value="Credit">Credit</option>
							</select>
						</div>
					</div>

					<div class="coa-edit-modal-footer">
						<button type="button" class="coa-edit-modal-secondary-btn" id="accountFormCancelBtn">Cancel</button>
						<button type="button" class="coa-edit-modal-primary-btn" id="accountFormSaveBtn">Add account</button>
					</div>
				</div>
			</div>

			<div class="coa-edit-modal coa-delete-modal" id="accountsDeleteModal">
				<div class="coa-edit-modal-backdrop" id="accountsDeleteBackdrop"></div>
				<div class="coa-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="accountsDeleteTitle">
					<div class="coa-edit-modal-header">
						<h3 id="accountsDeleteTitle">Delete accounts</h3>
						<button type="button" class="coa-edit-modal-close" id="accountsDeleteCloseBtn">&times;</button>
					</div>

					<div class="coa-edit-modal-body">
						<p id="accountsDeleteMessage">Are you sure you want to delete the selected accounts?</p>
					</div>

					<div class="coa-edit-modal-footer">
						<button type="button" class="coa-edit-modal-secondary-btn" id="accountsDeleteCancelBtn">Cancel</button>
						<button type="button" class="coa-edit-modal-primary-btn" id="accountsDeleteConfirmBtn">Delete</button>
					</div>
				</div>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);

	const accountsTable = document.getElementById("accountsTable");
	const formModal = document.getElementById("accountFormModal");
	const formId = document.getElementById("accountFormId");
	const formSaveBtn = document.getElementById("accountFormSaveBtn");
	const selectBtn = document.getElementById("selectAccountsBtn");
	const deleteSelectedBtn = document.getElementById("deleteSelectedAccountsBtn");
	const deleteModal = document.getElementById("accountsDeleteModal");
	const deleteConfirmBtn = document.getElementById("accountsDeleteConfirmBtn");

	const closeFormModal = () => {
		formModal.classList.remove("is-active");
	};

	const closeDeleteModal = () => {
		deleteModal.classList.remove("is-active");
	};

	const exitSelectionMode = () => {
		accountsTable.classList.remove("is-selecting");
		selectBtn.classList.remove("is-active");
		selectBtn.textContent = "Select";
		deleteSelectedBtn.classList.remove("is-visible");
		accountsTable.querySelectorAll('.coa-account-checkbox').forEach((checkbox) => {
			checkbox.checked = false;
		});
	};

	document.getElementById("accountFormCloseBtn").addEventListener("click", closeFormModal);
	document.getElementById("accountFormCancelBtn").addEventListener("click", closeFormModal);
	document.getElementById("accountFormBackdrop").addEventListener("click", closeFormModal);

	formSaveBtn.addEventListener("click", async (e) => {
		const account = {
			BusinessID: getBusinessId(),
			AccountCode: document.getElementById("accountFormCode").value,
			AccountName: document.getElementById("accountFormName").value,
			AccountType: document.getElementById("accountFormType").value,
			NormalBalance: document.getElementById("accountFormNormalBalance").value
		};
		const accountID = formId.value;

		formSaveBtn.disabled = true;
		try {
			const contactForAccount = accountID
				? await ipcRenderer.invoke('edit-account', { AccountID: accountID, ...account })
				: await ipcRenderer.invoke('add-account', account);

			if (!contactForAccount.didFail) {
				alert(accountID ? "Successfully Updated Account!" : "Successfully Added Account!");
				closeFormModal();
				control.fetchAccounts();
			} else {
				alert(contactForAccount.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		} finally {
			formSaveBtn.disabled = false;
		}
	});

	document.getElementById("addAccountBtn").addEventListener("click", (e) => control.openAccountModal());

	document.getElementById("accountsDeleteCloseBtn").addEventListener("click", closeDeleteModal);
	document.getElementById("accountsDeleteCancelBtn").addEventListener("click", closeDeleteModal);
	document.getElementById("accountsDeleteBackdrop").addEventListener("click", closeDeleteModal);

	deleteConfirmBtn.addEventListener("click", async (e) => {
		deleteConfirmBtn.disabled = true;
		try {
			const contactForDelete = await ipcRenderer.invoke('delete-accounts', {
				BusinessID: getBusinessId(),
				AccountIDs: control.selectedAccountIDs
			});

			if (!contactForDelete.didFail) {
				alert("Successfully Deleted Account(s)!");
				closeDeleteModal();
				exitSelectionMode();
				control.fetchAccounts();
			} else {
				alert(contactForDelete.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		} finally {
			deleteConfirmBtn.disabled = false;
		}
	});

	selectBtn.addEventListener("click", (e) => {
		if (accountsTable.classList.contains("is-selecting")) {
			exitSelectionMode();
			return;
		}

		accountsTable.classList.add("is-selecting");
		selectBtn.classList.add("is-active");
		selectBtn.textContent = "Done";
		deleteSelectedBtn.classList.add("is-visible");
	});

	deleteSelectedBtn.addEventListener("click", (e) => {
		const selected = accountsTable.querySelectorAll('.coa-account-checkbox:checked');
		if (selected.length === 0) {
			alert("Select at least one account to delete.");
			return;
		}

		control.selectedAccountIDs = Array.from(selected).map((checkbox) => Number(checkbox.value));
		document.getElementById("accountsDeleteMessage").textContent =
			`Are you sure you want to delete ${control.selectedAccountIDs.length} selected account(s)?`;
		deleteModal.classList.add("is-active");
	});

	const classificationButtons = document.querySelectorAll(`#${control.name} .coa-filters button[data-classification]`);
	classificationButtons.forEach((button) => {
		button.addEventListener('click', (e) => {
			classificationButtons.forEach((other) => other.classList.remove('is-active'));
			button.classList.add('is-active');
			control.activeClassification = button.dataset.classification;
			control.renderAccountRows(control.accounts);
		});
	});
};

control.openAccountModal = (account) => {
	const formModal = document.getElementById("accountFormModal");
	const isEdit = Boolean(account);

	document.getElementById("accountFormId").value = isEdit ? account.AccountID : "";
	document.getElementById("accountFormCode").value = isEdit ? account.AccountCode : "";
	document.getElementById("accountFormName").value = isEdit ? account.AccountName : "";
	document.getElementById("accountFormType").value = isEdit ? account.AccountType : 'Asset';
	document.getElementById("accountFormNormalBalance").value = isEdit ? account.NormalBalance : 'Debit';
	document.getElementById("accountFormTitle").textContent = isEdit ? "Edit account" : "Add account";
	document.getElementById("accountFormSaveBtn").textContent = isEdit ? "Save changes" : "Add account";

	formModal.classList.add("is-active");
	document.getElementById("accountFormCode").focus();
};

control.openEditAccount = (account) => control.openAccountModal(account);

control.renderAccountRows = (accounts) => {
	const accountsTable = document.getElementById("accountsTable");
	if (!accounts) return;

	let displayedAccounts = accounts;
	if (control.activeClassification) {
		displayedAccounts = accounts.filter(account => account.AccountType === control.activeClassification);
	}

	accountsTable.innerHTML = "";
	for (const account of displayedAccounts) {
		const tr = document.createElement('tr');
		const tabular_nums_ = document.createElement('td');
		const checkbox = document.createElement('input');
		const title_ = document.createElement('td');
		const class_ = document.createElement('td');
		const normal_ = document.createElement('td');

		checkbox.type = 'checkbox';
		checkbox.className = 'coa-account-checkbox';
		checkbox.value = account.AccountID;

		tabular_nums_.className = 'col-no tabular-nums';
		title_.className = 'col-title';
		class_.className = 'col-class';
		normal_.className = 'col-normal';

		tabular_nums_.append(checkbox, document.createTextNode(account.AccountCode));
		title_.textContent = account.AccountName;
		class_.textContent = account.AccountType;
		normal_.textContent = account.NormalBalance;

		tr.className = 'is-clickable';
		tr.addEventListener('click', (e) => {
			if (e.target === checkbox) return;
			if (accountsTable.classList.contains('is-selecting')) return;
			control.openAccountModal(account);
		});

		tr.append(tabular_nums_, title_, class_, normal_);
		accountsTable.appendChild(tr);
	}
};

control.fetchAccounts = async () => {
	if (getBusinessId() < 0) return;

	const getAllAccounts = await ipcRenderer.invoke('get-all-accounts', getBusinessId());
	if (getAllAccounts.didFail) return getAllAccounts;

	control.accounts = getAllAccounts.message;
	control.renderAccountRows(control.accounts);
};

export default control;
