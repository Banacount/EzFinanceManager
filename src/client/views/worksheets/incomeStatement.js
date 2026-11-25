import { getBusinessName } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { fetchAdjustedLines, formatAmount, groupAccountLines, printReport, signedBalance } from './reportData.js';

const control = {};

control.name = 'income-statement';
control.lines = [];

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Income Statement</h2>
					<p class="coa-subtitle">Juan’s Bakery · For the month ended Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn" id="printIncomeStatementBtn">Export PDF</button>
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
					<tbody id="incomeStatementRows"></tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
	document.getElementById("printIncomeStatementBtn").addEventListener("click", () => printReport());
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · For the month ended Jan 31, 2026`;
	}
};

control.fetchIncomeStatementLines = async () => {
	const lines = await fetchAdjustedLines();
	if (!lines) return;

	control.lines = lines;
	control.renderIncomeStatement();
};

control.renderIncomeStatement = () => {
	const tableBody = document.getElementById("incomeStatementRows");
	tableBody.innerHTML = "";
	control.updateSubtitle();

	const accounts = groupAccountLines(control.lines).map((account) => ({
		...account,
		balance: signedBalance(account)
	}));
	const revenues = accounts.filter(account => account.accountType === 'Income');
	const expenses = accounts.filter(account => account.accountType === 'Expenses');

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

	const totalRevenue = revenues.reduce((total, account) => total + account.balance, 0);
	const totalExpenses = expenses.reduce((total, account) => total + account.balance, 0);

	addSection('Revenue');
	for (const account of revenues) {
		addRow(account.accountName, account.balance);
	}

	addSection('Expenses');
	for (const account of expenses) {
		addRow(account.accountName, account.balance);
	}
	addRow('Total expenses', totalExpenses);
	addRow('Net Income', totalRevenue - totalExpenses, 'total-row');
};

export default control;
