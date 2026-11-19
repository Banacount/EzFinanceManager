import { initWorkspaceNav, renderWorkspaceLayout } from '../workspaceHeader.js';

const control = {};

control.name = 'aje';

control.render = () => {
	return renderWorkspaceLayout(
		control.name,
		`
			<div class="coa-header">
				<div>
					<h2>Adjusting Journal Entries (AJE)</h2>
					<p class="coa-subtitle">Period-end adjustments · As of Jan 31, 2026</p>
				</div>
				<div class="coa-actions">
					<input type="search" placeholder="Search adjusting entry">
					<button type="button" class="coa-primary-btn">Add AJE +</button>
				</div>
			</div>

			<div class="coa-filters">
				<button type="button" class="is-active">All</button>
				<button type="button">Deferrals</button>
				<button type="button">Accruals</button>
				<button type="button">Depreciation</button>
			</div>

			<div class="coa-table-wrap">
				<table class="coa-table">
					<thead>
						<tr>
							<th class="col-no">Date</th>
							<th class="col-title">Particulars</th>
							<th>Type</th>
							<th class="text-right">Debit</th>
							<th class="text-right">Credit</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Rent expense</td>
							<td>Deferral</td>
							<td class="text-right mono-nums">12,000.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit">Prepaid rent</td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">12,000.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Recognize expired January storefront rent</td>
						</tr>
						<tr>
							<td class="col-no mono-nums">2026-01-31</td>
							<td class="col-title">Depreciation expense</td>
							<td>Depreciation</td>
							<td class="text-right mono-nums">1,350.00</td>
							<td class="text-right mono-nums"></td>
						</tr>
						<tr>
							<td class="col-no"></td>
							<td class="col-title indent-credit"><span>Accumulated depreciation-equipment</span><span class="contra-tag">contra</span></td>
							<td></td>
							<td class="text-right mono-nums"></td>
							<td class="text-right mono-nums">1,350.00</td>
						</tr>
						<tr class="entry-note">
							<td></td>
							<td colspan="4">Monthly straight-line depreciation on baking equipment</td>
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
