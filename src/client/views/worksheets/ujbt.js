import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'ujbt';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Unadjusted Trial Balance (UJBT)</h2>
					<p class="coa-subtitle">Juan’s Bakery · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<button type="button" class="coa-secondary-btn">Print UJBT</button>
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
							<td class="text-right mono-nums">36,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">190</td>
							<td class="col-title">Equipment</td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
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
							<td class="text-right mono-nums">150,000.00</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">320</td>
							<td class="col-title"><span>Owner’s drawings</span><span class="contra-tag">contra</span></td>
							<td class="text-right mono-nums">5,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">410</td>
							<td class="col-title">Service fee</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">62,500.00</td>
						</tr>
						<tr>
							<td class="col-no tabular-nums">520</td>
							<td class="col-title">Salaries expense</td>
							<td class="text-right mono-nums">18,500.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr class="total-row">
							<td class="col-no"></td>
							<td class="col-title">Total</td>
							<td class="text-right mono-nums">277,500.00</td>
							<td class="text-right mono-nums">277,500.00</td>
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
