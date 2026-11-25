# Project Progress

- [x] Main menu.
- [x] Opening, adding, deleting a business.
- [x] Workspace header and menu.
- [x] Work: chart of accounts
- [x] Work: journal entries
- [x] Work: ledger
- [x] Work: ujbt
- [x] Work: aje
- [x] Work: ajtb
- [x] Work: income statement
- [x] Work: balance sheet
- [x] Work: closing entries
- [x] Work: pcbt
- [x] Work: worksheet
- [ ] Settings menu controls.

---

### Project Overview

Your group is tasked with designing and developing a computerized accounting application that will help a
small business record, organize, process, and generate basic accounting reports.

The application must allow users to enter business transactions and automatically generate the following
accounting outputs:

* General Journal
* General Ledger
* Unadjusted Trial Balance
* Adjusting Journal Entries
* Adjusted Trial Balance
* Income Statement

The application must also provide a feature for recording adjusting entries while preserving the original
transaction records. Users should be able to view the accounting records before and after adjustments.

The main objective is to demonstrate how programming can be used to automate basic accounting
processes while ensuring the accuracy, consistency, and reliability of accounting information.

---
### Plan

Development Steps:
* Application Rules and Features (Google Docs) - __Rivera__
* Database design (Entities and Attributes) - __Gabriza & Catanus__
* Database implementation (SQLite) - __Valmoria__
* User interface planning (Can be Figma or Canva) - __Taguran & Abejuela & Tumampoc__
* Data handlers development and Testing (Users) - __Soledio & Hallazgo__
* Migrating user interface plan to client (HTML, CSS) - __Valmoria__
* Finalized testing and debugging (Javascript) - __Valmoria__

---
### Running the program
Install all packages
`npm i`

Run the program
`npx electron {name_of_js_file or .}`

### Compiling the program
Rebuild electron app
```
npx @electron/rebuild
```

Linux. Built to `dist/` directory
```
npm run dist:linux
```

Windows. Built to `dist/` directory
```
npm run dist:win
```

