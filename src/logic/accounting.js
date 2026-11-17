import db from '../data/database.js';
import { z } from 'zod';

// Zod schema for validating a single line item
const JournalLineSchema = z.object({
  journalNote: z.string().optional(),
  accountID: z.number().int().positive("Invalid Account ID"),
  debit: z.number().nonnegative("Debit amount cannot be negative"),
  credit: z.number().nonnegative("Credit amount cannot be negative")
}).refine(data => !(data.debit > 0 && data.credit > 0), {
  message: "A single line item cannot have both a debit and a credit amount."
});

// Zod schema for validating an entire transaction submission
const TransactionPayloadSchema = z.object({
  businessID: z.number().int().positive(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  referenceNo: z.string().min(1, "Reference number is required"),
  description: z.string().min(1, "Description is required"),
  createdBy: z.string().min(1, "Creator username is required"),
  lines: z.array(JournalLineSchema).min(2, "An entry must have at least two account lines")
});

/**
 * Validates, processes, and saves a business transaction with double-entry checking.
 * Wraps the operation in an SQLite transaction to ensure ACID compliance.
 */
export function createJournalEntry(payload) {
  // Validate payload structure using Zod
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
      INSERT INTO JournalLines (EntryID, AccountID, Debit, Credit)
      VALUES (?, ?, ?, ?)
    `);

    for (const line of lines) {
      stmtLine.run(entryID, line.accountID, line.debit, line.credit);
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

/**
 * Computes the Trial Balance for a given business ID.
 * Returns account balances, categorizing them into Debit or Credit columns.
 */
