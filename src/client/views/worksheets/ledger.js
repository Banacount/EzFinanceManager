import { getBusinessName } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { displayBalance, fetchPostedJournalLines, formatAmount, groupAccountLines, signedBalance } from './reportData.js';

const control = {};

control.name = 'ledger';
control.lines = [];
control.activeClassification = '';
control.activeSearch = '';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>General Ledger</h2>
					<p class="coa-subtitle">Account postings · Jan 1, 2026 to Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<input type="search" id="searchLedgerInput" placeholder="Search account title">
					<button type="button" class="coa-secondary-btn" id="exportLedgerBtn">Export ledger</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active" data-classification="">All</button>
				<button type="button" data-classification="Asset">Assets</button>
				<button type="button" data-classification="Liability">Liabilities</button>
				<button type="button" data-classification="Equity">Equity</button>
				<button type="button" data-classification="Income">Income</button>
				<button type="button" data-classification="Expenses">Expenses</button>
			</div>

			<div id="ledgerReport"></div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);

	const classificationButtons = document.querySelectorAll(`#${control.name} .coa-filters button[data-classification]`);
	classificationButtons.forEach((button) => {
		button.addEventListener('click', (e) => {
			classificationButtons.forEach((other) => other.classList.remove('is-active'));
			button.classList.add('is-active');
			control.activeClassification = button.dataset.classification;
			control.renderLedger();
		});
	});

	document.getElementById("searchLedgerInput").addEventListener("input", (e) => {
		control.activeSearch = e.target.value.trim().toLowerCase();
		control.renderLedger();
	});

	document.getElementById("exportLedgerBtn").addEventListener("click", (e) => control.exportLedger());
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · Jan 1, 2026 to Jan 31, 2026`;
	}
};

control.visibleAccounts = () => {
	let accounts = groupAccountLines(control.lines);

	if (control.activeClassification) {
		const accountType = control.activeClassification === 'Equity' ? 'Owners Equity' : control.activeClassification;
		accounts = accounts.filter(account => account.accountType === accountType);
	}

	if (control.activeSearch) {
		accounts = accounts.filter(account =>
			account.accountCode.toLowerCase().includes(control.activeSearch) ||
			account.accountName.toLowerCase().includes(control.activeSearch)
		);
	}

	return accounts;
};

control.exportLedger = () => {
	const accounts = control.visibleAccounts();
	if (accounts.length === 0) {
		alert("No ledger entries to export.");
		return;
	}

	const rows = [['Date', 'Account code', 'Account title', 'Description', 'Debit', 'Credit', 'Balance']];

	for (const account of accounts) {
		let running = 0;
		for (const line of account.lines) {
			running += line.Debit - line.Credit;
			rows.push([
				line.EntryDate,
				account.accountCode,
				account.accountName,
				line.Description,
				(line.Debit / 100).toFixed(2),
				line.Credit > 0 ? (line.Credit / 100).toFixed(2) : "",
				(displayBalance(account, running) / 100).toFixed(2)
			]);
		}
	}

	const csv = rows.map(row => row.map(value => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
	const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	const businessName = (getBusinessName() || 'business').replace(/[^a-z0-9]+/gi, '-').toLowerCase();

	link.href = url;
	link.download = `ledger-${businessName}.csv`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

control.fetchLedgerLines = async () => {
	const lines = await fetchPostedJournalLines();
	if (!lines) return;

	control.lines = lines;
	control.renderLedger();
};

control.renderLedger = () => {
	const report = document.getElementById('ledgerReport');
	report.innerHTML = "";
	control.updateSubtitle();

	const accounts = control.visibleAccounts();
	if (accounts.length === 0) {
		const empty_ = document.createElement('p');
		empty_.className = 'coa-subtitle';
		empty_.textContent = control.lines.length > 0 ? "No accounts match the current filters." : "No posted journal entries yet.";
		report.appendChild(empty_);
		return;
	}

	for (const account of accounts) {
		const block = document.createElement('div');
		const title = document.createElement('h3');
		const tableWrap = document.createElement('div');
		const table = document.createElement('table');
		const thead = document.createElement('thead');
		const headRow = document.createElement('tr');
		const tbody = document.createElement('tbody');

		block.className = 'ledger-block';
		tableWrap.className = 'coa-table-wrap';
		table.className = 'coa-table';
		title.textContent = `${account.accountCode} — ${account.accountName} (${account.accountType})`;

		for (const label of ['Date', 'Description', 'Debit', 'Credit', 'Balance']) {
			const th = document.createElement('th');
			if (label === 'Date') th.className = 'col-no';
			if (label === 'Description') th.className = 'col-title';
			if (label === 'Debit' || label === 'Credit' || label === 'Balance') th.className = 'text-right';
			th.textContent = label;
			headRow.appendChild(th);
		}

		let running = 0;
		for (const line of account.lines) {
			const tr = document.createElement('tr');
			const date_ = document.createElement('td');
			const description_ = document.createElement('td');
			const debit_ = document.createElement('td');
			const credit_ = document.createElement('td');
			const balance_ = document.createElement('td');

			running += line.Debit - line.Credit;
			const displayedBalance = displayBalance(account, running);

			date_.className = 'col-no mono-nums';
			description_.className = 'col-title';
			debit_.className = 'text-right mono-nums';
			credit_.className = 'text-right mono-nums';
			balance_.className = 'text-right mono-nums';

			date_.textContent = line.EntryDate;
			description_.textContent = line.Description;
			debit_.textContent = line.Debit > 0 ? formatAmount(line.Debit) : "";
			credit_.textContent = line.Credit > 0 ? formatAmount(line.Credit) : "";
			balance_.textContent = formatAmount(displayedBalance);

			tr.append(date_, description_, debit_, credit_, balance_);
			tbody.appendChild(tr);
		}

		const footing = document.createElement('tr');
		const footingLabel = document.createElement('td');
		const footingBalance = document.createElement('td');

		footingLabel.className = 'col-title';
		footingLabel.textContent = 'Ending balance';
		footingLabel.colSpan = 3;
		footingBalance.className = 'text-right mono-nums';
		footingBalance.textContent = formatAmount(signedBalance(account));
		footing.append(footingLabel, footingBalance);
		tbody.appendChild(footing);

		thead.appendChild(headRow);
		table.append(thead, tbody);
		tableWrap.appendChild(table);
		block.append(title, tableWrap);
		report.appendChild(block);
	}
};

export default control;
