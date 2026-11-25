import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { fetchPostedJournalLines, formatAmount, groupAccountLines, signedBalance } from './reportData.js';

const control = {};

control.name = 'balance-sheet';
control.lines = [];

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Balance Sheet</h2>
					<p class="coa-subtitle">Juan’s Bakery · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn">Export PDF</button>
				</div>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-title">Account title</th>
							<th class="text-right">Amount</th>
						</tr>
					</thead>
					<tbody id="balanceSheetRows"></tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
};

control.fetchBalanceSheetLines = async () => {
	const lines = await fetchPostedJournalLines();
	if (!lines) return;

	control.lines = lines;
	control.renderBalanceSheet();
};

control.renderBalanceSheet = () => {
	const tableBody = document.getElementById("balanceSheetRows");
	tableBody.innerHTML = "";

	const accounts = groupAccountLines(control.lines).map((account) => ({
		...account,
		balance: signedBalance(account)
	}));

	const assets = accounts.filter(account => account.accountType === 'Asset');
	const liabilities = accounts.filter(account => account.accountType === 'Liability');
	const ownerEquity = accounts.filter(account => account.accountType === 'Owners Equity');
	const revenues = accounts.filter(account => account.accountType === 'Income');
	const expenses = accounts.filter(account => account.accountType === 'Expenses');

	const netIncome = revenues.reduce((total, account) => total + account.balance, 0) -
		expenses.reduce((total, account) => total + account.balance, 0);
	const totalAssets = assets.reduce((total, account) => total + account.balance, 0);
	const totalLiabilities = liabilities.reduce((total, account) => total + account.balance, 0);
	const totalEquity = ownerEquity.reduce((total, account) => total + account.balance, 0) + netIncome;

	const addSection = (label) => {
		const tr = document.createElement('tr');
		const cell = document.createElement('td');
		tr.className = 'section-row';
		cell.colSpan = 2;
		cell.textContent = label;
		tr.appendChild(cell);
		tableBody.appendChild(tr);
	};

	const addRow = (label, amount, className) => {
		const tr = document.createElement('tr');
		const title_ = document.createElement('td');
		const amount_ = document.createElement('td');
		if (className) tr.className = className;
		title_.className = 'col-title';
		amount_.className = 'text-right mono-nums';
		title_.textContent = label;
		amount_.textContent = formatAmount(amount);
		tr.append(title_, amount_);
		tableBody.appendChild(tr);
	};

	addSection('Assets');
	for (const account of assets) {
		addRow(account.accountName, account.balance);
	}
	addRow('Total Assets', totalAssets, 'total-row');

	addSection('Liabilities');
	for (const account of liabilities) {
		addRow(account.accountName, account.balance);
	}

	addSection('Owner’s Equity');
	for (const account of ownerEquity) {
		addRow(account.accountName, account.balance);
	}
	addRow('Net income', netIncome);
	addRow('Total Liabilities & Owner’s Equity', totalLiabilities + totalEquity, 'total-row');
};

export default control;
