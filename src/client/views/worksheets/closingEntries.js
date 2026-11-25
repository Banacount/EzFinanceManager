import { getBusinessName } from '../../renderer.js';
import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';
import { buildClosingEntries, fetchAdjustedLines, formatAmount, groupAccountLines } from './reportData.js';

const control = {};

control.name = 'closing-entries';
control.entries = [];

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Closing Entries</h2>
					<p class="coa-subtitle">Juan’s Bakery · Period end Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-primary-btn" id="generateClosingBtn">Generate closing +</button>
				</div>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">Date</th>
							<th class="col-title">Particulars</th>
							<th>Step</th>
							<th class="text-right">Debit</th>
							<th class="text-right">Credit</th>
						</tr>
					</thead>
					<tbody id="closingEntriesRows"></tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
	document.getElementById("generateClosingBtn").addEventListener("click", () => control.fetchClosingEntries());
};

control.updateSubtitle = () => {
	const subtitle = document.querySelector(`#${control.name} .coa-subtitle`);
	if (subtitle) {
		subtitle.textContent = `${getBusinessName() || 'Business'} · Period end Jan 31, 2026`;
	}
};

control.fetchClosingEntries = async () => {
	const lines = await fetchAdjustedLines();
	if (!lines) return;

	control.entries = buildClosingEntries(groupAccountLines(lines));
	control.renderClosingEntries();
};

control.renderClosingEntries = () => {
	const tableBody = document.getElementById("closingEntriesRows");
	tableBody.innerHTML = "";
	control.updateSubtitle();

	if (control.entries.length === 0) {
		const tr = document.createElement('tr');
		const empty_ = document.createElement('td');
		empty_.colSpan = 5;
		empty_.textContent = "No temporary accounts to close.";
		tr.appendChild(empty_);
		tableBody.appendChild(tr);
		return;
	}

	for (const entry of control.entries) {
		entry.lines.forEach((line, index) => {
			const tr = document.createElement('tr');
			const date_ = document.createElement('td');
			const particulars_ = document.createElement('td');
			const step_ = document.createElement('td');
			const debit_ = document.createElement('td');
			const credit_ = document.createElement('td');

			date_.className = 'col-no mono-nums';
			particulars_.className = 'col-title';
			if (index > 0) particulars_.classList.add('indent-credit');
			debit_.className = 'text-right mono-nums';
			credit_.className = 'text-right mono-nums';

			date_.textContent = index === 0 ? entry.date : "";
			particulars_.textContent = line.accountName;
			step_.textContent = index === 0 ? entry.step : "";
			debit_.textContent = line.debit > 0 ? formatAmount(line.debit) : "";
			credit_.textContent = line.credit > 0 ? formatAmount(line.credit) : "";

			tr.append(date_, particulars_, step_, debit_, credit_);
			tableBody.appendChild(tr);
		});
	}
};

export default control;
