import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'income-statement';

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
					<tbody>
						<tr class="section-row">
							<td colspan="2">Revenue</td>
						</tr>
						<tr>
							<td class="col-title">Service fee</td>
							<td class="text-right mono-nums">62,500.00</td>
						</tr>
						<tr class="section-row">
							<td colspan="2">Expenses</td>
						</tr>
						<tr>
							<td class="col-title">Salaries expense</td>
							<td class="text-right mono-nums">18,500.00</td>
						</tr>
						<tr>
							<td class="col-title">Rent expense</td>
							<td class="text-right mono-nums">12,000.00</td>
						</tr>
						<tr>
							<td class="col-title">Depreciation expense</td>
							<td class="text-right mono-nums">1,350.00</td>
						</tr>
						<tr>
							<td class="col-title">Total expenses</td>
							<td class="text-right mono-nums">31,850.00</td>
						</tr>
						<tr class="total-row">
							<td class="col-title">Net Income</td>
							<td class="text-right mono-nums">30,650.00</td>
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
