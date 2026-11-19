import { getBusinessId } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
const { ipcRenderer } = require('electron');

const control = {};

control.name = 'chart-of-accounts';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<h2>Chart of Accounts</h2>
				<div class="coa-actions">
					<input type="search" placeholder="Search number or title">
					<button type="button" class="coa-primary-btn">Add account +</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active">All</button>
				<button type="button">Assets</button>
				<button type="button">Liabilities</button>
				<button type="button">Equity</button>
				<button type="button">Income</button>
				<button type="button">Expenses</button>
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

			<div class="coa-edit-modal" id="accountEditModal">
				<div class="coa-edit-modal-backdrop" id="accountEditBackdrop"></div>
				<div class="coa-edit-modal-panel" role="dialog" aria-modal="true" aria-labelledby="accountEditTitle">
					<div class="coa-edit-modal-header">
						<h3 id="accountEditTitle">Edit account</h3>
						<button type="button" class="coa-edit-modal-close" id="accountEditCloseBtn">&times;</button>
					</div>

					<div class="coa-edit-modal-body">
						<input type="hidden" id="editAccountId">
						<div class="coa-edit-modal-field">
							<label for="editAccountCode">Account code</label>
							<input type="text" id="editAccountCode">
						</div>
						<div class="coa-edit-modal-field">
							<label for="editAccountName">Account title</label>
							<input type="text" id="editAccountName">
						</div>
						<div class="coa-edit-modal-field">
							<label for="editAccountType">Classification</label>
							<select id="editAccountType">
								<option value="Asset">Asset</option>
								<option value="Liability">Liability</option>
								<option value="Owners Equity">Owners Equity</option>
								<option value="Income">Income</option>
								<option value="Expenses">Expenses</option>
							</select>
						</div>
						<div class="coa-edit-modal-field">
							<label for="editNormalBalance">Normal balance</label>
							<select id="editNormalBalance">
								<option value="Debit">Debit</option>
								<option value="Credit">Credit</option>
							</select>
						</div>
					</div>

					<div class="coa-edit-modal-footer">
						<button type="button" class="coa-edit-modal-secondary-btn" id="accountEditCancelBtn">Cancel</button>
						<button type="button" class="coa-edit-modal-primary-btn" id="accountEditSaveBtn">Save changes</button>
					</div>
				</div>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);

	const editModal = document.getElementById("accountEditModal");

	const closeEditModal = () => {
		editModal.classList.remove("is-active");
	};

	document.getElementById("accountEditCloseBtn").addEventListener("click", closeEditModal);
	document.getElementById("accountEditCancelBtn").addEventListener("click", closeEditModal);
	document.getElementById("accountEditBackdrop").addEventListener("click", closeEditModal);

	document.getElementById("accountEditSaveBtn").addEventListener("click", async (e) => {
		try {
			const account = {
				AccountID: document.getElementById("editAccountId").value,
				BusinessID: getBusinessId(),
				AccountCode: document.getElementById("editAccountCode").value,
				AccountName: document.getElementById("editAccountName").value,
				AccountType: document.getElementById("editAccountType").value,
				NormalBalance: document.getElementById("editNormalBalance").value
			};

			const contactForEdit = await ipcRenderer.invoke('edit-account', account);
			if (!contactForEdit.didFail) {
				alert("Successfully Updated Account!");
				closeEditModal();
				control.fetchAccounts();
			} else {
				alert(contactForEdit.message);
			}
		} catch (err) {
			console.log("Client error: ", err);
		}
	});
};

control.openEditAccount = (account) => {
	const editModal = document.getElementById("accountEditModal");

	document.getElementById("editAccountId").value = account.AccountID;
	document.getElementById("editAccountCode").value = account.AccountCode;
	document.getElementById("editAccountName").value = account.AccountName;
	document.getElementById("editAccountType").value = account.AccountType;
	document.getElementById("editNormalBalance").value = account.NormalBalance;

	editModal.classList.add("is-active");
	document.getElementById("editAccountCode").focus();
};

control.fetchAccounts = async () => {
	const accountsTable = document.getElementById("accountsTable");
	if (getBusinessId() < 0) return;

	const getAllAccounts = await ipcRenderer.invoke('get-all-accounts', getBusinessId());
	if (getAllAccounts.didFail) return getAllAccounts;
	
	accountsTable.innerHTML = "";
	for (const account of getAllAccounts.message) {
		const tr = document.createElement('tr');
		const tabular_nums_ = document.createElement('td');
		const title_ = document.createElement('td');
		const class_ = document.createElement('td');
		const normal_ = document.createElement('td');

		tabular_nums_.className = 'col-no tabular-nums';
		title_.className = 'col-title';
		class_.className = 'col-class';
		normal_.className = 'col-normal';

		tabular_nums_.textContent  = account.AccountCode;
		title_.textContent = account.AccountName;
		class_.textContent = account.AccountType;
		normal_.textContent = account.NormalBalance;

		tr.className = 'is-clickable';
		tr.addEventListener('click', (e) => control.openEditAccount(account));

		tr.append(tabular_nums_, title_, class_, normal_);
		accountsTable.appendChild(tr);
	}
};

export default control;
