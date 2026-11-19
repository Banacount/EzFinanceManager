const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

// Get root app path
const dbPath = process.type === 'browser' || (app && typeof app.getPath === 'function')
   ? path.join(app.getPath('userData'), 'accounting.db') 
   : 'accounting.db';

const db = new Database(dbPath, { verbose: console.log }); // Change verbose to console.log for debugging
db.pragma('foreign_keys = ON'); // Enable foreign key constraints in SQLite

// Create all the entities query
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS Business (
      BusinessID INTEGER PRIMARY KEY AUTOINCREMENT,
      BusinessName TEXT NOT NULL,
      OwnerName TEXT NOT NULL,
      PeriodStart TEXT NOT NULL,
      PeriodEnd TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS Accounts (
      AccountID INTEGER PRIMARY KEY AUTOINCREMENT,
      BusinessID INTEGER NOT NULL,
      AccountCode TEXT NOT NULL,
      AccountName TEXT NOT NULL,
      AccountType TEXT NOT NULL CHECK(AccountType IN ('Asset', 'Liability', 'Owners Equity', 'Income', 'Expenses')),
      NormalBalance TEXT NOT NULL CHECK(NormalBalance IN ('Debit', 'Credit')),
      IsActive INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID) ON DELETE RESTRICT, UNIQUE(BusinessID, AccountCode)
  );

  CREATE TABLE IF NOT EXISTS JournalEntries (
      EntryID INTEGER PRIMARY KEY AUTOINCREMENT,
      BusinessID INTEGER NOT NULL,
      EntryDate TEXT NOT NULL,
      ReferenceNo TEXT UNIQUE NOT NULL,
      Description TEXT NOT NULL,
      EntryType TEXT NOT NULL DEFAULT 'REGULAR',
      Status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(Status IN ('DRAFT', 'POSTED')),
      CreatedAt TEXT NOT NULL,
      CreatedBy TEXT NOT NULL,
      FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS JournalLines (
      LineID INTEGER PRIMARY KEY AUTOINCREMENT,
      EntryID INTEGER NOT NULL,
      JournalNote TEXT,
      AccountID INTEGER NOT NULL,
      Debit INTEGER NOT NULL DEFAULT 0 CHECK(Debit >= 0),
      Credit INTEGER NOT NULL DEFAULT 0 CHECK(Credit >= 0),
      FOREIGN KEY (EntryID) REFERENCES JournalEntries(EntryID) ON DELETE CASCADE,
      FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS Adjustments (
      AdjustmentID INTEGER PRIMARY KEY AUTOINCREMENT,
      BusinessID INTEGER NOT NULL,
      AdjustmentDate TEXT NOT NULL,
      ReferenceNo TEXT UNIQUE NOT NULL,
      AdjustmentType TEXT NOT NULL,
      Description TEXT NOT NULL,
      Status TEXT NOT NULL DEFAULT 'DRAFT' CHECK(Status IN ('DRAFT', 'POSTED')),
      CreatedAt TEXT NOT NULL,
      CreatedBy TEXT NOT NULL,
      FOREIGN KEY (BusinessID) REFERENCES Business(BusinessID) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS AdjustmentLines (
      LineID INTEGER PRIMARY KEY AUTOINCREMENT,
      AdjustmentID INTEGER NOT NULL,
      AccountID INTEGER NOT NULL,
      Debit INTEGER NOT NULL DEFAULT 0 CHECK(Debit >= 0),
      Credit INTEGER NOT NULL DEFAULT 0 CHECK(Credit >= 0),
      FOREIGN KEY (AdjustmentID) REFERENCES Adjustments(AdjustmentID) ON DELETE CASCADE,
      FOREIGN KEY (AccountID) REFERENCES Accounts(AccountID) ON DELETE RESTRICT
  );

  CREATE TABLE IF NOT EXISTS AuditTrail (
      AuditID INTEGER PRIMARY KEY AUTOINCREMENT,
      TableName TEXT NOT NULL,
      RecordID INTEGER NOT NULL,
      Action TEXT NOT NULL CHECK(Action IN ('INSERT', 'UPDATE', 'DELETE')),
      OldValue TEXT,
      NewValue TEXT,
      ActionDate TEXT NOT NULL,
      UserName TEXT NOT NULL
  );
`;

function initializeDatabase() {
  // Seed Default Business Profile & Chart of Accounts if empty
  db.exec(createTableQuery);
  seedDefaultData();
  console.log("Database initialized successfully at:", dbPath);
}

function seedDefaultData() {
  const businessCount = db.prepare('SELECT COUNT(*) as count FROM Business').get().count;
  
  if (businessCount === 0) {
    const insertBusiness = db.prepare(`
      INSERT INTO Business (BusinessName, OwnerName, PeriodStart, PeriodEnd) 
      VALUES (?, ?, ?, ?)
    `);
    const info = insertBusiness.run('EZFinanceManager Sample Business', 'Rivera', '2026-01-01', '2026-12-31');
    const defaultBusinessID = info.lastInsertRowid;

    // Pre-seeded Chart of Accounts from your team leader's outline
    const defaultAccounts = [
      // Assets (Normal Balance: Debit, except contra-assets)
      { code: '110', name: 'Cash', type: 'Asset', normal: 'Debit' },
      { code: '120', name: 'Accounts receivable', type: 'Asset', normal: 'Debit' },
      { code: '125', name: 'Allowance for bad debts', type: 'Asset', normal: 'Credit' }, // Contra-asset
      { code: '130', name: 'Notes receivable', type: 'Asset', normal: 'Debit' },
      { code: '140', name: 'Inventory', type: 'Asset', normal: 'Debit' },
      { code: '150', name: 'Prepaid supplies', type: 'Asset', normal: 'Debit' },
      { code: '155', name: 'Prepaid rent', type: 'Asset', normal: 'Debit' },
      { code: '160', name: 'Prepaid insurance', type: 'Asset', normal: 'Debit' },
      { code: '170', name: 'Land', type: 'Asset', normal: 'Debit' },
      { code: '180', name: 'Building', type: 'Asset', normal: 'Debit' },
      { code: '185', name: 'Accumulated depreciation - Bldg.', type: 'Asset', normal: 'Credit' }, // Contra-asset
      { code: '190', name: 'Equipment', type: 'Asset', normal: 'Debit' },
      { code: '195', name: 'Accumulated depreciation - Equipment', type: 'Asset', normal: 'Credit' }, // Contra-asset

      // Liabilities (Normal Balance: Credit)
      { code: '210', name: 'Accounts payable', type: 'Liability', normal: 'Credit' },
      { code: '220', name: 'Notes payable', type: 'Liability', normal: 'Credit' },
      { code: '230', name: 'Interest payable', type: 'Liability', normal: 'Credit' },
      { code: '240', name: 'Salaries payable', type: 'Liability', normal: 'Credit' },
      { code: '250', name: 'Utilities payable', type: 'Liability', normal: 'Credit' },
      { code: '260', name: 'Unearned income', type: 'Liability', normal: 'Credit' },

      // Equity (Normal Balance: Credit for Capital, Debit for Drawing)
      { code: '310', name: "Owner’s Capital", type: 'Owners Equity', normal: 'Credit' },
      { code: '320', name: "Owner’s drawing", type: 'Owners Equity', normal: 'Debit' }, // Contra-equity

      // Income (Normal Balance: Credit)
      { code: '410', name: 'Service fees', type: 'Income', normal: 'Credit' },
      { code: '420', name: 'Sales', type: 'Income', normal: 'Credit' },
      { code: '430', name: 'Interest income', type: 'Income', normal: 'Credit' },
      { code: '440', name: 'Gains', type: 'Income', normal: 'Credit' },

      // Expenses (Normal Balance: Debit)
      { code: '510', name: 'Cost of sales', type: 'Expenses', normal: 'Debit' },
      { code: '515', name: 'Freight-out', type: 'Expenses', normal: 'Debit' },
      { code: '520', name: 'Salaries expense', type: 'Expenses', normal: 'Debit' },
      { code: '525', name: 'Rent expense', type: 'Expenses', normal: 'Debit' },
      { code: '530', name: 'Utilities expense', type: 'Expenses', normal: 'Debit' },
      { code: '535', name: 'Supplies expense', type: 'Expenses', normal: 'Debit' },
      { code: '540', name: 'Bad debt expense', type: 'Expenses', normal: 'Debit' },
      { code: '545', name: 'Depreciation expense', type: 'Expenses', normal: 'Debit' },
      { code: '550', name: 'Advertising expense', type: 'Expenses', normal: 'Debit' },
      { code: '555', name: 'Insurance expense', type: 'Expenses', normal: 'Debit' },
      { code: '560', name: 'Taxes and licenses', type: 'Expenses', normal: 'Debit' },
      { code: '565', name: 'Transportation and travel expense', type: 'Expenses', normal: 'Debit' },
      { code: '570', name: 'Interest expense', type: 'Expenses', normal: 'Debit' },
      { code: '575', name: 'Miscellaneous expense', type: 'Expenses', normal: 'Debit' },
      { code: '580', name: 'Losses', type: 'Expenses', normal: 'Debit' }
    ];

    const insertAccount = db.prepare(`
      INSERT INTO Accounts (BusinessID, AccountCode, AccountName, AccountType, NormalBalance, IsActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    const insertMany = db.transaction((accounts) => {
      for (const acc of accounts) {
        insertAccount.run(defaultBusinessID, acc.code, acc.name, acc.type, acc.normal);
      }
    });

    insertMany(defaultAccounts);
    console.log("Default Chart of Accounts seeded successfully.");
  }
}

//export default db;
module.exports = {
  initializeDatabase,
  db
};
