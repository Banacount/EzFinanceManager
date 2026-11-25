import { getBusinessId } from '../../renderer.js';
const { ipcRenderer } = require('electron');

export function formatAmount(amount) {
	const absoluteAmount = Math.abs(amount / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	return amount < 0 ? `(${absoluteAmount})` : absoluteAmount;
}

export async function fetchAccounts() {
	if (getBusinessId() < 0) return null;

	const getAccounts = await ipcRenderer.invoke('get-accounts', getBusinessId());
	if (getAccounts.didFail) return null;

	return getAccounts.message;
}

export function printReport() {
	document.body.classList.add("printing-report");
	window.addEventListener("afterprint", () => document.body.classList.remove("printing-report"), { once: true });
	window.print();
}

export async function fetchPostedJournalLines() {
	if (getBusinessId() < 0) return null;

	const getLines = await ipcRenderer.invoke('get-posted-journal-lines', getBusinessId());
	if (getLines.didFail) return null;

	return getLines.message;
}

export function groupAccountLines(lines) {
	const accounts = new Map();

	for (const line of lines) {
		if (!accounts.has(line.AccountCode)) {
			accounts.set(line.AccountCode, {
				accountCode: line.AccountCode,
				accountName: line.AccountName,
				accountType: line.AccountType,
				normalBalance: line.NormalBalance,
				lines: [],
				debit: 0,
				credit: 0
			});
		}

		const account = accounts.get(line.AccountCode);
		account.lines.push(line);
		account.debit += line.Debit;
		account.credit += line.Credit;
	}

	return Array.from(accounts.values()).sort((a, b) => a.accountCode.localeCompare(b.accountCode));
}

const expectedNormalBalance = (account) => ['Asset', 'Expenses'].includes(account.accountType) ? 'Debit' : 'Credit';

export function balanceBySide(account) {
	return account.debit - account.credit;
}

export function displayBalance(account, sideBalance) {
	const normalSideBalance = account.normalBalance === 'Credit' ? -sideBalance : sideBalance;
	return account.normalBalance === expectedNormalBalance(account) ? normalSideBalance : -normalSideBalance;
}

export function signedBalance(account) {
	return displayBalance(account, balanceBySide(account));
}

export async function fetchPostedAdjustmentLines() {
	if (getBusinessId() < 0) return null;

	const getLines = await ipcRenderer.invoke('get-posted-adjustment-lines', getBusinessId());
	if (getLines.didFail) return null;

	return getLines.message;
}

export async function fetchAdjustmentEntries() {
	if (getBusinessId() < 0) return null;

	const getEntries = await ipcRenderer.invoke('get-adjustments', getBusinessId());
	if (getEntries.didFail) return null;

	return getEntries.message;
}

export async function fetchAdjustedLines() {
	const [journalLines, adjustmentLines] = await Promise.all([
		fetchPostedJournalLines(),
		fetchPostedAdjustmentLines()
	]);

	if (!journalLines || !adjustmentLines) return null;
	return [...journalLines, ...adjustmentLines];
}

export function buildClosingEntries(accounts) {
	const capitalAccount = accounts.find(account => account.accountType === 'Owners Equity' && account.normalBalance === 'Credit') ||
		accounts.find(account => account.accountType === 'Owners Equity');
	const revenues = accounts.filter(account => account.accountType === 'Income' && signedBalance(account) !== 0);
	const expenses = accounts.filter(account => account.accountType === 'Expenses' && signedBalance(account) !== 0);
	const drawings = accounts.filter(account => account.accountType === 'Owners Equity' && account.normalBalance === 'Debit' && balanceBySide(account) !== 0);

	const totalRevenue = revenues.reduce((total, account) => total + signedBalance(account), 0);
	const totalExpenses = expenses.reduce((total, account) => total + signedBalance(account), 0);
	const totalDrawings = drawings.reduce((total, account) => total + balanceBySide(account), 0);
	const netIncome = totalRevenue - totalExpenses;
	const date = accounts.reduce((latest, account) => {
		for (const line of account.lines) {
			const lineDate = line.EntryDate || line.AdjustmentDate;
			if (lineDate > latest) latest = lineDate;
		}
		return latest;
	}, '2026-01-31');

	const entries = [];

	if (revenues.length > 0) {
		entries.push({
			date,
			step: 'Close Revenue',
			lines: [
				...revenues.map(account => ({ accountName: account.accountName, debit: signedBalance(account), credit: 0 })),
				{ accountName: 'Income summary', debit: 0, credit: totalRevenue }
			]
		});
	}

	if (expenses.length > 0) {
		entries.push({
			date,
			step: 'Close Expenses',
			lines: [
				{ accountName: 'Income summary', debit: totalExpenses, credit: 0 },
				...expenses.map(account => ({ accountName: account.accountName, debit: 0, credit: signedBalance(account) }))
			]
		});
	}

	if (netIncome !== 0 && capitalAccount) {
		entries.push({
			date,
			step: 'Close Net Income',
			lines: netIncome > 0 ? [
				{ accountName: 'Income summary', debit: netIncome, credit: 0 },
				{ accountName: capitalAccount.accountName, debit: 0, credit: netIncome }
			] : [
				{ accountName: capitalAccount.accountName, debit: -netIncome, credit: 0 },
				{ accountName: 'Income summary', debit: 0, credit: -netIncome }
			]
		});
	}

	if (totalDrawings > 0 && capitalAccount) {
		entries.push({
			date,
			step: 'Close Drawings',
			lines: [
				{ accountName: capitalAccount.accountName, debit: totalDrawings, credit: 0 },
				...drawings.map(account => ({ accountName: account.accountName, debit: 0, credit: balanceBySide(account) }))
			]
		});
	}

	return entries;
}

export function applyClosingEntries(accounts, closingEntries) {
	const postClosing = accounts.map(account => ({
		...account,
		lines: [...account.lines],
		debit: account.debit,
		credit: account.credit
	}));

	for (const entry of closingEntries) {
		for (const line of entry.lines) {
			const account = postClosing.find(candidate => candidate.accountName === line.accountName);
			if (!account) continue;
			account.debit += line.debit;
			account.credit += line.credit;
		}
	}

	return postClosing.filter(account => balanceBySide(account) !== 0);
}
