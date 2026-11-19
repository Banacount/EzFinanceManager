import { z } from 'zod';

// Zod schema for validating a single line item
export const JournalLineSchema = z.object({
  journalNote: z.string().optional(),
  accountID: z.number().int().positive("Invalid Account ID"),
  debit: z.number().nonnegative("Debit amount cannot be negative"),
  credit: z.number().nonnegative("Credit amount cannot be negative")
}).refine(data => !(data.debit > 0 && data.credit > 0), {
  message: "A single line item cannot have both a debit and a credit amount."
});

// Zod schema for validating an entire transaction submission
export const TransactionPayloadSchema = z.object({
  businessID: z.number().int().positive(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format"),
  referenceNo: z.string().min(1, "Reference number is required"),
  description: z.string().min(1, "Description is required"),
  createdBy: z.string().min(1, "Creator username is required"),
  lines: z.array(JournalLineSchema).min(2, "An entry must have at least two account lines")
});

export const BusinessSchema = z.object({
  businessName: z.string().trim().min(1, "Business name is required"),
  ownerName: z.string().trim().min(1, "Owner name is required"),
  periodStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be YYYY-MM-DD"),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD")
}).refine(data => data.periodEnd >= data.periodStart, {
  message: "End date must be on or after the start date.",
  path: ['periodEnd']
});

export const AccountEditSchema = z.object({
  accountID: z.number().int().positive("Invalid Account ID"),
  businessID: z.number().int().positive("Invalid Business ID"),
  accountCode: z.string().min(1, "Account code is required"),
  accountName: z.string().min(1, "Account name is required"),
  accountType: z.enum(['Asset', 'Liability', 'Owners Equity', 'Income', 'Expenses']),
  normalBalance: z.enum(['Debit', 'Credit']),
  editedBy: z.string().min(1, "Editor username is required").default('System')
});

export const BusinessDeleteSchema = z.object({
  businessID: z.number().int().positive("Invalid Business ID"),
  deletedBy: z.string().min(1, "Deleter username is required").default('System')
});
