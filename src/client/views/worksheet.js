import { initWorkspaceNav, renderWorkspaceLayout } from './workspaceHeader.js';

const control = {};

control.name = 'worksheet';

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
					<button type="button" class="coa-secondary-btn">Export CSV</button>
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
					<tbody>
						<tr>
							<td class="col-title">Cash</td>
							<td class="text-right mono-nums">139,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">139,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">139,000.00 Dr</td>
						</tr>
						<tr>
							<td class="col-title">Accounts receivable</td>
							<td class="text-right mono-nums">14,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">14,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">14,000.00 Dr</td>
						</tr>
						<tr>
							<td class="col-title">Prepaid rent</td>
							<td class="text-right mono-nums">36,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00</td>
							<td class="text-right mono-nums">24,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">24,000.00 Dr</td>
						</tr>
						<tr>
							<td class="col-title">Equipment</td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00 Dr</td>
						</tr>
						<tr>
							<td class="col-title"><span>Accumulated depreciation-equipment</span><span class="contra-tag">contra</span></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00 Cr</td>
						</tr>
						<tr>
							<td class="col-title">Accounts payable</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">65,000.00 Cr</td>
						</tr>
						<tr>
							<td class="col-title">Owner’s capital</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">150,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">150,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">150,000.00 Cr</td>
						</tr>
						<tr>
							<td class="col-title"><span>Owner’s drawings</span><span class="contra-tag">contra</span></td>
							<td class="text-right mono-nums">5,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">5,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">5,000.00 Dr</td>
						</tr>
						<tr>
							<td class="col-title">Service fee</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">62,500.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">62,500.00</td>
							<td class="text-right mono-nums">62,500.00 Cr</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-title">Salaries expense</td>
							<td class="text-right mono-nums">18,500.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">18,500.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">18,500.00 Dr</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-title">Rent expense</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00 Dr</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-title">Depreciation expense</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00 Dr</td>
							<td class="text-right mono-nums"></td>
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
