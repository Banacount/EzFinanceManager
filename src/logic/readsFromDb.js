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
