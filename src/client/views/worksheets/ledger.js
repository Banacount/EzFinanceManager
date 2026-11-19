import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'ledger';

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
					<input type="search" placeholder="Search account title">
					<button type="button" class="coa-secondary-btn">Export ledger</button>
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

			<div class="ledger-block">
				<h3>110 — Cash (Asset)</h3>
				<div class="coa-table-wrap">
					<table class="coa-table">
						<thead>
							<tr>
								<th class="col-no">Date</th>
								<th class="col-title">Description</th>
								<th class="text-right">Debit</th>
								<th class="text-right">Credit</th>
								<th class="text-right">Balance</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="col-no mono-nums">2026-01-02</td>
								<td class="col-title">Initial owner investment into Juan’s Bakery</td>
								<td class="text-right mono-nums">150,000.00</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">150,000.00</td>
							</tr>
							<tr>
								<td class="col-no mono-nums">2026-01-06</td>
								<td class="col-title">Paid 3-month advance storefront rent</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">36,000.00</td>
								<td class="text-right mono-nums">114,000.00</td>
							</tr>
							<tr>
								<td class="col-no mono-nums">2026-01-12</td>
								<td class="col-title">Cash catering &amp; pastry service fees earned</td>
								<td class="text-right mono-nums">48,500.00</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">162,500.00</td>
							</tr>
							<tr>
								<td class="col-no mono-nums">2026-01-25</td>
								<td class="col-title">Paid baker &amp; counter staff salaries</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">18,500.00</td>
								<td class="text-right mono-nums">144,000.00</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>

			<div class="ledger-block">
				<h3>410 — Service fee (Income)</h3>
				<div class="coa-table-wrap">
					<table class="coa-table">
						<thead>
							<tr>
								<th class="col-no">Date</th>
								<th class="col-title">Description</th>
								<th class="text-right">Debit</th>
								<th class="text-right">Credit</th>
								<th class="text-right">Balance</th>
							</tr>
						</thead>
						<tbody>
							<tr>
								<td class="col-no mono-nums">2026-01-12</td>
								<td class="col-title">Cash catering &amp; pastry service fees earned</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">48,500.00</td>
								<td class="text-right mono-nums">48,500.00</td>
							</tr>
							<tr>
								<td class="col-no mono-nums">2026-01-18</td>
								<td class="col-title">Billed corporate client for bakery order</td>
								<td class="text-right mono-nums"></td>
								<td class="text-right mono-nums">14,000.00</td>
								<td class="text-right mono-nums">62,500.00</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
};

export default control;
