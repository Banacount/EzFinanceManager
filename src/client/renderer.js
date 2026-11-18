import { default as mainMenu } from './views/mainMenu.js'
import { default as notFound } from './views/notFound.js'
import { default as businessMenu } from './views/businessMenu.js'

const pages = [notFound, mainMenu, businessMenu]
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
