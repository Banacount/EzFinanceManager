import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'balance-sheet';

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
					<tbody>
						<tr class="section-row">
							<td colspan="2">Assets</td>
						</tr>
						<tr>
							<td class="col-title">Cash</td>
							<td class="text-right mono-nums">139,000.00</td>
						</tr>
						<tr>
							<td class="col-title">Accounts receivable</td>
							<td class="text-right mono-nums">14,000.00</td>
						</tr>
						<tr>
							<td class="col-title">Prepaid rent</td>
							<td class="text-right mono-nums">24,000.00</td>
						</tr>
						<tr>
							<td class="col-title">Equipment</td>
							<td class="text-right mono-nums">65,000.00</td>
						</tr>
						<tr>
							<td class="col-title"><span>Less: Accumulated depreciation-equipment</span><span class="contra-tag">contra</span></td>
							<td class="text-right mono-nums">(1,350.00)</td>
						</tr>
						<tr class="total-row">
							<td class="col-title">Total Assets</td>
							<td class="text-right mono-nums">240,650.00</td>
						</tr>
						<tr class="section-row">
							<td colspan="2">Liabilities</td>
						</tr>
						<tr>
							<td class="col-title">Accounts payable</td>
							<td class="text-right mono-nums">65,000.00</td>
						</tr>
						<tr class="section-row">
							<td colspan="2">Owner’s Equity</td>
						</tr>
						<tr>
							<td class="col-title">Owner’s capital (ending)</td>
							<td class="text-right mono-nums">175,650.00</td>
						</tr>
						<tr class="total-row">
							<td class="col-title">Total Liabilities &amp; Owner’s Equity</td>
							<td class="text-right mono-nums">240,650.00</td>
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
