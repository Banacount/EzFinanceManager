import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'closing-entries';

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
					<button type="button" class="coa-primary-btn">Generate closing +</button>
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
					<tbody>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Service fee</td>
							<td>Close Revenue</td>
							<td class="text-right mono-nums">62,500.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Income summary</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">62,500.00</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Income summary</td>
							<td>Close Expenses</td>
							<td class="text-right mono-nums">31,850.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Salaries expense</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">18,500.00</td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Rent expense</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00</td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Depreciation expense</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Income summary</td>
							<td>Close Net Income</td>
							<td class="text-right mono-nums">30,650.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Owner’s capital</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">30,650.00</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Owner’s capital</td>
							<td>Close Drawings</td>
							<td class="text-right mono-nums">5,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit"><span>Owner’s drawings</span><span class="contra-tag">contra</span></td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">5,000.00</td>
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
