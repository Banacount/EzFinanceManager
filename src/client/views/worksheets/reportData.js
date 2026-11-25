import { getBusinessId } from '../../renderer.js';
const { ipcRenderer } = require('electron');

export function formatAmount(amount) {
	const absoluteAmount = Math.abs(amount / 100).toLocaleString('en-US', {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2
	});

	return amount < 0 ? `(${absoluteAmount})` : absoluteAmount;
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
