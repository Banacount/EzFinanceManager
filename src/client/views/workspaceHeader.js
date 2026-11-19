import { loadPage } from "../renderer.js";

const SUBNAV_ITEMS = [
	{ name: 'chart-of-accounts', label: 'Charts of Accounts' },
	{ name: 'journal-entries', label: 'Journal Entries' },
	{ name: 'ledger', label: 'Ledger' },
	{ name: 'ujbt', label: 'UJBT' },
	{ name: 'aje', label: 'AJE' },
	{ name: 'ajtb', label: 'AJTB' },
	{ name: 'income-statement', label: 'Income Statement' },
	{ name: 'balance-sheet', label: 'Balance sheet' },
	{ name: 'closing-entries', label: 'Closing entries' },
	{ name: 'pcbt', label: 'PCBT' },
	{ name: 'worksheet', label: 'Worksheet' },
];

export function renderWorkspaceLayout(activePageName, contentHtml) {
	const tabsHtml = SUBNAV_ITEMS.map((item) => {
		const isActive = item.name === activePageName;
		const cls = `subnav-tab-btn${isActive ? ' is-active' : ''}${isActive && item.name !== 'chart-of-accounts' ? ' has-indicator' : ''}`;
		return `<button type="button" class="${cls}" data-page="${item.name}">${item.label}</button>`;
	}).join('');

	return `
		<div class="workspace-container">
			<header>
				<div class="titlebar">
					<h1>EZFinanceManager - Juan’s Bakery</h1>
				</div>

				<div class="menubar">
					<button type="button" class="menu-trigger-btn" data-page="main-menu">Menu</button>
					<button type="button" class="menu-trigger-btn" data-page="business-menu">Go back</button>
				</div>

				<nav class="subnav">
					${tabsHtml}
				</nav>
			</header>

			<main class="content">
				${contentHtml}
			</main>
		</div>
	`;
}

export function initWorkspaceNav(pageName) {
	const root = document.getElementById(pageName);
	if (!root) return;
	root.querySelectorAll('[data-page]').forEach((btn) => {
		btn.addEventListener('click', () => {
			loadPage(btn.dataset.page);
		});
	});
}
