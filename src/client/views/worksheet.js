import { getBusinessName } from '../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from './workspaceHeader.js';
import { balanceBySide, fetchPostedAdjustmentLines, fetchPostedJournalLines, formatAmount, groupAccountLines } from './worksheets/reportData.js';

const control = {};

control.name = 'worksheet';
control.rows = [];

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Accounting Worksheet</h2>
					<p class="coa-subtitle">Juan’s Bakery · For the month ended Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn" id="exportWorksheetBtn">Export CSV</button>
				</div>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table" style="min-width: 60rem;">
					<thead>
						<tr>
							<th>Account title</th>
							<th class="text-right">UJBT Dr</th>
							<th class="text-right">UJBT Cr</th>
							<th class="text-right">Adj Dr</th>
							<th class="text-right">Adj Cr</th>
							<th class="text-right">AJTB Dr</th>
							<th class="text-right">AJTB Cr</th>
							<th class="text-right">IS Dr/Cr</th>
							<th class="text-right">BS Dr/Cr</th>
						</tr>
					</thead>
					<tbody id="worksheetRows"></tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
	document.getElementById("exportWorksheetBtn").addEventListener("click", () => control.exportWorksheet());
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · For the month ended Jan 31, 2026`;
	}
};

control.fetchWorksheetLines = async () => {
	const [journalLines, adjustmentLines] = await Promise.all([
		fetchPostedJournalLines(),
		fetchPostedAdjustmentLines()
	]);
	if (!journalLines || !adjustmentLines) return;

	control.buildWorksheetRows(journalLines, adjustmentLines);
	control.renderWorksheet();
};

control.buildWorksheetRows = (journalLines, adjustmentLines) => {
	const journalAccounts = groupAccountLines(journalLines);
	const adjustmentAccounts = groupAccountLines(adjustmentLines);
	const combined = new Map();

	const addAccount = (account, source) => {
		if (!combined.has(account.accountCode)) {
			combined.set(account.accountCode, {
				accountCode: account.accountCode,
				accountName: account.accountName,
				accountType: account.accountType,
				normalBalance: account.normalBalance,
				ujbt: { debit: 0, credit: 0 },
				adjustment: { debit: 0, credit: 0 }
			});
		}

		const row = combined.get(account.accountCode);
		const balance = balanceBySide(account);
		row[source] = {
			debit: balance >= 0 ? balance : 0,
			credit: balance < 0 ? -balance : 0
		};
	};

	for (const account of journalAccounts) addAccount(account, 'ujbt');
	for (const account of adjustmentAccounts) addAccount(account, 'adjustment');

	control.rows = Array.from(combined.values()).map((row) => {
		const ajtbDebit = row.ujbt.debit + row.adjustment.debit;
		const ajtbCredit = row.ujbt.credit + row.adjustment.credit;
		const adjustedBalance = ajtbDebit - ajtbCredit;
		const isIncomeStatementAccount = ['Income', 'Expenses'].includes(row.accountType);
		const statementAmount = Math.abs(adjustedBalance);
		const suffix = row.normalBalance === 'Debit' ? 'Dr' : 'Cr';

		return {
			...row,
			ajtbDebit,
			ajtbCredit,
			incomeStatementAmount: isIncomeStatementAccount && statementAmount > 0 ? `${formatAmount(statementAmount)} ${suffix}` : "",
			balanceSheetAmount: !isIncomeStatementAccount && statementAmount > 0 ? `${formatAmount(statementAmount)} ${suffix}` : ""
		};
	});
};

control.renderWorksheet = () => {
	const tableBody = document.getElementById("worksheetRows");
	tableBody.innerHTML = "";
	control.updateSubtitle();

	if (control.rows.length === 0) {
		const tr = document.createElement('tr');
		const empty_ = document.createElement('td');
		empty_.colSpan = 9;
		empty_.textContent = "No posted journal or adjusting entries yet.";
		tr.appendChild(empty_);
		tableBody.appendChild(tr);
		return;
	}

	const totals = {
		ujbtDebit: 0,
		ujbtCredit: 0,
		adjustmentDebit: 0,
		adjustmentCredit: 0,
		ajtbDebit: 0,
		ajtbCredit: 0,
		incomeStatement: 0,
		balanceSheet: 0
	};

	for (const row of control.rows) {
		const tr = document.createElement('tr');
		const cells = [
			{ text: `${row.accountCode} · ${row.accountName}`, className: 'col-title' },
			{ text: row.ujbt.debit > 0 ? formatAmount(row.ujbt.debit) : "" },
			{ text: row.ujbt.credit > 0 ? formatAmount(row.ujbt.credit) : "" },
			{ text: row.adjustment.debit > 0 ? formatAmount(row.adjustment.debit) : "" },
			{ text: row.adjustment.credit > 0 ? formatAmount(row.adjustment.credit) : "" },
			{ text: row.ajtbDebit > 0 ? formatAmount(row.ajtbDebit) : "" },
			{ text: row.ajtbCredit > 0 ? formatAmount(row.ajtbCredit) : "" },
			{ text: row.incomeStatementAmount },
			{ text: row.balanceSheetAmount }
		];

		totals.ujbtDebit += row.ujbt.debit;
		totals.ujbtCredit += row.ujbt.credit;
		totals.adjustmentDebit += row.adjustment.debit;
		totals.adjustmentCredit += row.adjustment.credit;
		totals.ajtbDebit += row.ajtbDebit;
		totals.ajtbCredit += row.ajtbCredit;
		if (row.incomeStatementAmount) totals.incomeStatement += Math.abs(row.ajtbDebit - row.ajtbCredit);
		if (row.balanceSheetAmount) totals.balanceSheet += Math.abs(row.ajtbDebit - row.ajtbCredit);

		cells.forEach((cellConfig, index) => {
			const td = document.createElement('td');
			if (cellConfig.className) td.className = cellConfig.className;
			if (index > 0) td.className = `${td.className} text-right mono-nums`.trim();
			td.textContent = cellConfig.text;
			tr.appendChild(td);
		});

		tableBody.appendChild(tr);
	}

	const totalRow = document.createElement('tr');
	totalRow.className = 'total-row';
	const totalValues = [
		'Total',
		formatAmount(totals.ujbtDebit),
		formatAmount(totals.ujbtCredit),
		formatAmount(totals.adjustmentDebit),
		formatAmount(totals.adjustmentCredit),
		formatAmount(totals.ajtbDebit),
		formatAmount(totals.ajtbCredit),
		formatAmount(totals.incomeStatement),
		formatAmount(totals.balanceSheet)
	];

	totalValues.forEach((value, index) => {
		const td = document.createElement('td');
		if (index === 0) td.className = 'col-title';
		else td.className = 'text-right mono-nums';
		td.textContent = value;
		totalRow.appendChild(td);
	});

	tableBody.appendChild(totalRow);
};

control.exportWorksheet = () => {
	if (control.rows.length === 0) {
		alert("No worksheet data to export.");
		return;
	}

	const rows = [[
		'Account code', 'Account title', 'UJBT Dr', 'UJBT Cr', 'Adj Dr', 'Adj Cr',
		'AJTB Dr', 'AJTB Cr', 'IS Dr/Cr', 'BS Dr/Cr'
	]];

	for (const row of control.rows) {
		rows.push([
			row.accountCode,
			row.accountName,
			(row.ujbt.debit / 100).toFixed(2),
			(row.ujbt.credit / 100).toFixed(2),
			(row.adjustment.debit / 100).toFixed(2),
			(row.adjustment.credit / 100).toFixed(2),
			(row.ajtbDebit / 100).toFixed(2),
			(row.ajtbCredit / 100).toFixed(2),
			row.incomeStatementAmount.replace(/,/g, ''),
			row.balanceSheetAmount.replace(/,/g, '')
		]);
	}

	const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	const businessName = (getBusinessName() || 'business').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

	link.href = url;
	link.download = `worksheet-${businessName}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export default control;
