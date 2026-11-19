import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'pcbt';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Post-Closing Trial Balance (PCBT)</h2>
					<p class="coa-subtitle">Juan’s Bakery · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn">Print PCBT</button>
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
					<tbody>
						<tr>
							<td class="col-no tabular-nums">110</td>
							<td class="col-title">Cash</td>
							<td class="text-right mono-nums">139,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">120</td>
							<td class="col-title">Accounts receivable</td>
							<td class="text-right mono-nums">14,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">155</td>
							<td class="col-title">Prepaid rent</td>
							<td class="text-right mono-nums">24,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">190</td>
							<td class="col-title">Equipment</td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">195</td>
							<td class="col-title"><span>Accumulated depreciation-equipment</span><span class="contra-tag">contra</span></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">210</td>
							<td class="col-title">Accounts payable</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">310</td>
							<td class="col-title">Owner’s capital</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">175,650.00</td>
						</tr>
						<tr class="total-row">
							<td class="col-no"></td>
							<td class="col-title">Total</td>
							<td class="text-right mono-nums">242,000.00</td>
							<td class="text-right mono-nums">242,000.00</td>
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
