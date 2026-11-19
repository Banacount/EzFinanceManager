import db_pkg from '../data/database.cjs';
import { TransactionPayloadSchema, BusinessSchema } from './schemas.js';

const { db } = db_pkg;

/**
 * Validates, processes, and saves a business transaction with double-entry checking.
 * Wraps the operation in an SQLite transaction to ensure ACID compliance.
 */
export function createJournalEntry(payload) {
  const validationResult = TransactionPayloadSchema.safeParse(payload);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.errors.map(err => err.message).join(', ');
    throw new Error(`Validation Error: ${errorMessages}`);
  }

  const { businessID, entryDate, referenceNo, description, createdBy, lines } = validationResult.data;

  // Compute and verify double-entry balance rule (Total Debits == Total Credits)
  let totalDebits = 0;
  let totalCredits = 0;

  for (const line of lines) {
    totalDebits += line.debit;
    totalCredits += line.credit;
  }

  // Use a small tolerance check or strict equality (since values are stored cleanly)
  if (totalDebits !== totalCredits) {
    throw new Error(`Unbalanced Entry Error: Total debits (${totalDebits}) must equal total credits (${totalCredits}).`);
  }

  // Perform database operations inside a safe SQLite transaction
  const insertTransaction = db.transaction(() => {
    // Insert Header into JournalEntries
    const stmtHeader = db.prepare(`
      INSERT INTO JournalEntries (BusinessID, EntryDate, ReferenceNo, Description, EntryType, Status, CreatedAt, CreatedBy)
      VALUES (?, ?, ?, ?, 'REGULAR', 'POSTED', datetime('now'), ?)
    `);
    
    const headerResult = stmtHeader.run(businessID, entryDate, referenceNo, description, createdBy);
    const entryID = headerResult.lastInsertRowid;

    // Insert Line Items into JournalLines
    const stmtLine = db.prepare(`
      INSERT INTO JournalLines (EntryID, JournalNote, AccountID, Debit, Credit)
      VALUES (?, ?, ?, ?, ?)
    `);

    for (const line of lines) {
      stmtLine.run(entryID, line.journalNote, line.accountID, line.debit, line.credit);
    }

    // Log action to Audit Trail
    const stmtAudit = db.prepare(`
      INSERT INTO AuditTrail (TableName, RecordID, Action, OldValue, NewValue, ActionDate, UserName)
      VALUES ('JournalEntries', ?, 'INSERT', NULL, ?, datetime('now'), ?)
    `);
    stmtAudit.run(entryID, JSON.stringify({ referenceNo, description, totalDebits }), createdBy);

    return entryID;
  });

  try {
    const entryID = insertTransaction();
    return { success: true, entryID, message: "Transaction successfully recorded and posted." };
  } catch (error) {
    // If it's a unique constraint violation on ReferenceNo
    if (error.message.includes('UNIQUE constraint failed')) {
      throw new Error(`Reference number '${referenceNo}' already exists. Reference numbers must be unique.`);
    }
    throw error;
  }
}

export function createBusiness(payload) {
  const validation = BusinessSchema.safeParse(payload);
  if (!validation.success) {
    throw new Error(`Validation failed: ${validation.error.issues.map(i => i.message).join(', ')}`);
  }

  const { businessName, ownerName, periodStart, periodEnd } = validation.data;

  const insertBusinessTx = db.transaction(() => {
    // Insert the business record
    const insertResult = db.prepare(`
      INSERT INTO Business (BusinessName, OwnerName, PeriodStart, PeriodEnd)
      VALUES (?, ?, ?, ?)
    `).run(businessName, ownerName, periodStart, periodEnd);

    const businessID = insertResult.lastInsertRowid;

    const defaultAccounts = [
      { code: '110', name: 'Cash', type: 'Asset', normal: 'Debit' },
      { code: '120', name: 'Accounts Receivable', type: 'Asset', normal: 'Debit' },
      { code: '150', name: 'Equipment', type: 'Asset', normal: 'Debit' },
      { code: '210', name: 'Accounts Payable', type: 'Liability', normal: 'Credit' },
      { code: '310', name: "Owner's Capital", type: 'Owners Equity', normal: 'Credit' },
      { code: '410', name: 'Service Revenue', type: 'Income', normal: 'Credit' },
      { code: '510', name: 'Salaries Expense', type: 'Expenses', normal: 'Debit' },
      { code: '525', name: 'Rent Expense', type: 'Expenses', normal: 'Debit' }
    ];

    // Seed the accounts tied to this specific BusinessID
    const insertAccount = db.prepare(`
      INSERT INTO Accounts (BusinessID, AccountCode, AccountName, AccountType, NormalBalance, IsActive)
      VALUES (?, ?, ?, ?, ?, 1)
    `);

    for (const acc of defaultAccounts) {
      insertAccount.run(businessID, acc.code, acc.name, acc.type, acc.normal);
    }

    return businessID;
  });

  // Execute the transaction
  try {
    const newBusinessID = insertBusinessTx();
    return { success: true, businessID: newBusinessID, message: "Business created and accounts seeded successfully." };
  } catch (error) {
    throw new Error(`Failed to create business: ${error.message}`);
  }
}

/**
 * Computes the Trial Balance for a given business ID.
 * Returns account balances, categorizing them into Debit or Credit columns.
 */
