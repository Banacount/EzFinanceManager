import db_pkg from '../data/database.cjs';
const { db } = db_pkg;

export function getAllBusiness() {
  const stmt = db.prepare(`
    SELECT * FROM Business 
  `);
  
  return stmt.all();
}

export function getAccounts(businessID) {
  const stmt = db.prepare(`
    SELECT * FROM Accounts 
    WHERE BusinessID = ? AND IsActive = 1
    ORDER BY AccountCode ASC
  `);
  
  // .all() returns an array of matching rows
  return stmt.all(businessID);
}

export function getJournalEntries(businessID) {
  const stmt = db.prepare(`
    SELECT * FROM JournalEntries 
    WHERE BusinessID = ?
    ORDER BY EntryDate ASC, EntryID ASC
  `);

  const entries = stmt.all(businessID);

  const stmtLines = db.prepare(`
    SELECT 
      JournalLines.*,
      Accounts.AccountCode,
      Accounts.AccountName,
      Accounts.AccountType
    FROM JournalLines
    INNER JOIN Accounts ON JournalLines.AccountID = Accounts.AccountID
    WHERE JournalLines.EntryID = ?
    ORDER BY JournalLines.LineID ASC
  `);

  for (const entry of entries) {
    entry.lines = stmtLines.all(entry.EntryID);
  }

  return entries;
}

export function getPostedJournalLines(businessID) {
  const stmt = db.prepare(`
    SELECT 
      JournalLines.*,
      JournalEntries.EntryDate,
      JournalEntries.ReferenceNo,
      JournalEntries.Description,
      Accounts.AccountCode,
      Accounts.AccountName,
      Accounts.AccountType,
      Accounts.NormalBalance
    FROM JournalLines
    INNER JOIN JournalEntries ON JournalLines.EntryID = JournalEntries.EntryID
    INNER JOIN Accounts ON JournalLines.AccountID = Accounts.AccountID
    WHERE JournalEntries.BusinessID = ? AND JournalEntries.Status = 'POSTED'
    ORDER BY JournalEntries.EntryDate ASC, JournalEntries.EntryID ASC, JournalLines.LineID ASC
  `);

  return stmt.all(businessID);
}
