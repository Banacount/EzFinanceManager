import db_pkg from './src/data/database.cjs';
import { app, BrowserWindow, ipcMain } from 'electron/main';
import path from 'path';
import { createJournalEntry, voidJournalEntry, createBusiness, editAccount, deleteBusiness, createAccount, deleteAccounts } from './src/logic/writesToDb.js';
import { getAllBusiness, getAccounts, getJournalEntries, getPostedJournalLines } from './src/logic/readsFromDb.js';

const { initializeDatabase, db } = db_pkg;
initializeDatabase();

// This piece of code below is just for testing
// Prepare id's needed for the test
const business = db.prepare('SELECT BusinessID FROM Business LIMIT 1').get();
const cashAccount = db.prepare('SELECT AccountID FROM Accounts WHERE AccountCode = ?').get('110'); // Cash (Asset, Debit)
const capitalAccount = db.prepare('SELECT AccountID FROM Accounts WHERE AccountCode = ?').get('310'); // Owner's Capital (Equity, Credit)
const rentAccount = db.prepare('SELECT AccountID FROM Accounts WHERE AccountCode = ?').get('525'); // Rent Expense (Expense, Debit)

// Invalid data test
console.log("Invalid data request:");
try {
  const unbalancedPayload = {
    businessID: business.BusinessID,
    entryDate: '2026-01-06',
    referenceNo: 'TXN-2026-002',
    description: 'Paying rent with unequal lines',
    createdBy: 'JohnRushell',
    lines: [
      { accountID: rentAccount.AccountID, debit: 1500000, credit: 0 },    // Debit Rent: 15,000.00
      { accountID: cashAccount.AccountID, debit: 0, credit: 1000000 }       // Credit Cash: 10,000.00 (MISMATCH!)
    ]
  };

  createJournalEntry(unbalancedPayload);
} catch (error) {
  console.log("SUCCESSFULLY BLOCKED BY LOGIC LAYER:");
  console.error(`-> ${error.message}`);
}

// Valid data test
console.log("Valid data request:")
try {
  const validPayload = {
    businessID: business.BusinessID,
    entryDate: '2026-01-05',
    referenceNo: 'TXN-2026-001',
    description: 'Initial cash investment by owner',
    createdBy: 'JohnRushell',
    lines: [
      { journalNote: 'Main office equipment', accountID: cashAccount.AccountID, debit: 5000000, credit: 0 },      // Debit Cash: 50,000.00 (in centavos)
      { journalNote: 'Cash', accountID: capitalAccount.AccountID, debit: 0, credit: 5000000 }                     // Credit Capital: 50,000.00
    ]
  };

  const result = createJournalEntry(validPayload);
  console.log("SUCCESS:", result);
} catch (error) {
  console.error("FAILED unexpectedly:", error.message);
}

app.whenReady().then(() => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile(path.join(import.meta.dirname, 'src/client/index.html'));
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC HANDLERS
ipcMain.handle('get-all-business', () => {
  try {
    const get = getAllBusiness();
    return { didFail: false, message: get };
  } catch (err) {
    return { didFail: true, message: err };
  }
});

ipcMain.handle('get-all-accounts', (event, businessID) => {
  try {
    if (!businessID) throw new Error("The Business ID is blank.");

    const get = getAccounts(businessID);
    return { didFail: false, message: get };
  } catch (err) {
    return { didFail: true, message: err };
  }
});

ipcMain.handle('get-journal-entries', (event, businessID) => {
  try {
    if (!businessID) throw new Error("The Business ID is blank.");

    const get = getJournalEntries(businessID);
    return { didFail: false, message: get };
  } catch (err) {
    return { didFail: true, message: err.message };
  }
});

ipcMain.handle('set-window-title', (event, businessName) => {
  try {
    const mainWindow = BrowserWindow.getAllWindows()[0];
    if (mainWindow) {
      mainWindow.setTitle(`EzFinanceManager - ${businessName}`);
    }
    return { didFail: false, message: businessName };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('add-business', (event, business) => {
  try {
    const businessPayload = {
      businessName: business.BusinessName,
      ownerName: business.OwnerName,
      periodStart: business.PeriodStart,
      periodEnd: business.PeriodEnd
    };

    const result = createBusiness(businessPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('edit-account', (event, account) => {
  try {
    const accountPayload = {
      accountID: Number(account.AccountID),
      businessID: Number(account.BusinessID),
      accountCode: account.AccountCode,
      accountName: account.AccountName,
      accountType: account.AccountType,
      normalBalance: account.NormalBalance
    };

    const result = editAccount(accountPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('delete-business', (event, business) => {
  try {
    const businessPayload = {
      businessID: Number(business.BusinessID)
    };

    const result = deleteBusiness(businessPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('add-account', (event, account) => {
  try {
    const accountPayload = {
      businessID: Number(account.BusinessID),
      accountCode: account.AccountCode,
      accountName: account.AccountName,
      accountType: account.AccountType,
      normalBalance: account.NormalBalance
    };

    const result = createAccount(accountPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('delete-accounts', (event, selection) => {
  try {
    const selectionPayload = {
      businessID: Number(selection.BusinessID),
      accountIDs: selection.AccountIDs.map(id => Number(id))
    };

    const result = deleteAccounts(selectionPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('add-journal-entry', (event, entry) => {
  try {
    if (!entry.ReferenceNo) throw new Error("No reference number.");
    if (!entry.Description) throw new Error("No description.");

    const entryPayload = {
      businessID: Number(entry.BusinessID),
      entryDate: entry.EntryDate,
      referenceNo: entry.ReferenceNo,
      description: entry.Description,
      createdBy: entry.CreatedBy,
      lines: entry.Lines.map((line) => ({
        journalNote: line.JournalNote,
        accountID: Number(line.AccountID),
        debit: Number(line.Debit),
        credit: Number(line.Credit)
      }))
    };

    const result = createJournalEntry(entryPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('void-journal-entry', (event, entry) => {
  try {
    const voidPayload = {
      businessID: Number(entry.BusinessID),
      entryID: Number(entry.EntryID),
      voidedBy: entry.VoidedBy || 'System'
    };

    const result = voidJournalEntry(voidPayload);
    return { didFail: false, message: result };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

ipcMain.handle('get-posted-journal-lines', (event, businessID) => {
  try {
    if (!businessID) throw new Error("The Business ID is blank.");

    const get = getPostedJournalLines(businessID);
    return { didFail: false, message: get };
  } catch (error) {
    return { didFail: true, message: error.message };
  }
});

