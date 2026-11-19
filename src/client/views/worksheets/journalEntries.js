import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'journal-entries';

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
					<input type="search" placeholder="Search date or description">
					<button type="button" class="coa-primary-btn">Add entry +</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active">All</button>
				<button type="button">Cash</button>
				<button type="button">On Account</button>
				<button type="button">Expenses</button>
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
					<tbody>
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
						<tr>
							<td class="col-no mono-nums">2026-01-04</td>
							<td class="col-title">Equipment</td>
							<td class="tabular-nums">190</td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Accounts payable</td>
							<td class="tabular-nums">210</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Purchased baking equipment on account</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-06</td>
							<td class="col-title">Prepaid rent</td>
							<td class="tabular-nums">155</td>
							<td class="text-right mono-nums">36,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Cash</td>
							<td class="tabular-nums">110</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">36,000.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Paid 3-month advance storefront rent</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-12</td>
							<td class="col-title">Cash</td>
							<td class="tabular-nums">110</td>
							<td class="text-right mono-nums">48,500.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Service fee</td>
							<td class="tabular-nums">410</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">48,500.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Cash catering &amp; pastry service fees earned</td>
						</tr>
					</tbody>
				</table>
			</div>
		`,
	);
};

control.init = () => {
	initWorkspaceNav(control.name);
};

export default control;
