import { initializeDatabase } from './src/data/database.js';
import { app, BrowserWindow } from 'electron/main';
import path from 'path';
import { createJournalEntry } from './src/logic/accounting.js';
import db from './src/data/database.js';

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
