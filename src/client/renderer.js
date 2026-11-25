import { default as mainMenu } from './views/mainMenu.js'
import { default as notFound } from './views/notFound.js'
import { default as businessMenu } from './views/businessMenu.js'
import { default as worksheet } from './views/worksheet.js';

// Worksheets
import { default as chartOfAccounts } from './views/worksheets/chartOfAccounts.js';
import { default as journalEntries } from './views/worksheets/journalEntries.js';
import { default as ledger } from './views/worksheets/ledger.js';
import { default as ujbt } from './views/worksheets/ujbt.js';
import { default as aje } from './views/worksheets/aje.js';
import { default as ajtb } from './views/worksheets/ajtb.js';
import { default as incomeStatement } from './views/worksheets/incomeStatement.js';
import { default as balanceSheet } from './views/worksheets/balanceSheet.js';
import { default as closingEntries } from './views/worksheets/closingEntries.js';
import { default as pcbt } from './views/worksheets/pcbt.js';

const CURRENT_BUSINESS_ID = "current_business_id";
const CURRENT_BUSINESS_NAME = "current_business_name";

const pages = [
	notFound,
	mainMenu,
	businessMenu,
	chartOfAccounts,
	journalEntries,
	ledger,
	ujbt,
	aje,
	ajtb,
	incomeStatement,
	balanceSheet,
	closingEntries,
	pcbt,
	worksheet,
];

const app = document.getElementById("appContainer");
let sumAllDom = '';

export function loadPage (name) {
	let pageExists = false;

	for (const page of pages) {
		if (page.name == name) {
			const pageElement = document.getElementById(page.name);
			pageElement.style.display = 'block';
			pageExists = true;
			continue;
		}

		const pageElement = document.getElementById(page.name);
		pageElement.style.display = 'none';
	}

	if (!pageExists) {
		const pageElement = document.getElementById('not-found');
		pageElement.style.display = 'block';
	}
}

export function setBusinessId (number, businessName) {
	localStorage.setItem(CURRENT_BUSINESS_ID, number)
	if (businessName !== undefined) {
		localStorage.setItem(CURRENT_BUSINESS_NAME, businessName)
	}
}
export function getBusinessId () {
	return localStorage.getItem(CURRENT_BUSINESS_ID);
}
export function getBusinessName () {
	return localStorage.getItem(CURRENT_BUSINESS_NAME) || '';
}

// Global variables
localStorage.setItem(CURRENT_BUSINESS_ID, -1);
localStorage.setItem(CURRENT_BUSINESS_NAME, '');

// sum app all dom elements
for (const page of pages) {
	sumAllDom = sumAllDom + `<div id=${page.name}>${page.render()}</div>`;
}

// put into the app container
app.innerHTML = sumAllDom;

// initialize hooks and code blocks
for (const page of pages) {
	page.init();
}

loadPage("main-menu");
