import { getBusinessName } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { balanceBySide, fetchPostedJournalLines, formatAmount, groupAccountLines } from './reportData.js';

const control = {};

control.name = 'ujbt';
control.lines = [];

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Unadjusted Trial Balance (UJBT)</h2>
					<p class="coa-subtitle">Trial balance · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn" id="printUjbtBtn">Print UJBT</button>
				</div>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">No.</th>
							<th class="col-title">Account title</th>
							<th class="text-right">Debit</th>
							<th class="text-right">Credit</th>
						</tr>
					</thead>
					<tbody id="trialBalanceRows"></tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
	document.getElementById("printUjbtBtn").addEventListener("click", (e) => {
		document.body.classList.add("printing-ujbt");
		window.addEventListener("afterprint", () => document.body.classList.remove("printing-ujbt"), { once: true });
		window.print();
	});
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · As of Jan 31, 2026`;
	}
};

control.fetchTrialBalanceLines = async () => {
	const lines = await fetchPostedJournalLines();
	if (!lines) return;

	control.lines = lines;
	control.renderTrialBalance();
};

control.renderTrialBalance = () => {
	const tableBody = document.getElementById("trialBalanceRows");
	tableBody.innerHTML = "";
	control.updateSubtitle();

	const accounts = groupAccountLines(control.lines);
	if (accounts.length === 0) {
		const tr = document.createElement('tr');
		const empty_ = document.createElement('td');
		empty_.colSpan = 4;
		empty_.textContent = "No posted journal entries yet.";
		tr.appendChild(empty_);
		tableBody.appendChild(tr);
		return;
	}

	let totalDebit = 0;
	let totalCredit = 0;

	for (const account of accounts) {
		const tr = document.createElement('tr');
		const no_ = document.createElement('td');
		const title_ = document.createElement('td');
		const debit_ = document.createElement('td');
		const credit_ = document.createElement('td');

		const balance = balanceBySide(account);
		const debitBalance = balance >= 0 ? balance : 0;
		const creditBalance = balance < 0 ? -balance : 0;

		totalDebit += debitBalance;
		totalCredit += creditBalance;

		no_.className = 'col-no tabular-nums';
		title_.className = 'col-title';
		debit_.className = 'text-right mono-nums';
		credit_.className = 'text-right mono-nums';

		no_.textContent = account.accountCode;
		title_.textContent = account.accountName;
		debit_.textContent = debitBalance > 0 ? formatAmount(debitBalance) : "";
		credit_.textContent = creditBalance > 0 ? formatAmount(creditBalance) : "";

		tr.append(no_, title_, debit_, credit_);
		tableBody.appendChild(tr);
	}

	const totalRow = document.createElement('tr');
	const totalSpacer = document.createElement('td');
	const totalTitle = document.createElement('td');
	const totalDebit_ = document.createElement('td');
	const totalCredit_ = document.createElement('td');

	totalRow.className = 'total-row';
	totalTitle.className = 'col-title';
	totalDebit_.className = 'text-right mono-nums';
	totalCredit_.className = 'text-right mono-nums';
	totalTitle.textContent = 'Total';
	totalDebit_.textContent = formatAmount(totalDebit);
	totalCredit_.textContent = formatAmount(totalCredit);

	totalRow.append(totalSpacer, totalTitle, totalDebit_, totalCredit_);
	tableBody.appendChild(totalRow);
};

export default control;
