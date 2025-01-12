import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdir, writeFile, access } from 'fs/promises';
import sqlite3 from 'better-sqlite3';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, '../../data/avalon.db');

// Initialize database
const initDb = async () => {
  try {
    // Ensure data directory exists
    await mkdir(dirname(DB_PATH), { recursive: true });
    
    // Check if database exists
    try {
      await access(DB_PATH);
    } catch {
      // Create empty file if it doesn't exist
      await writeFile(DB_PATH, '');
    }
    
    const db = new sqlite3(DB_PATH);

    // Initialize database tables
    db.exec(`
      CREATE TABLE IF NOT EXISTS complaints (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        unit TEXT NOT NULL,
        description TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        phone_number TEXT,
        is_emergency BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'pending'
      );
    `);

    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

let db;
try {
  db = await initDb();
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

export function logComplaint(complaint) {
    try {
      // Convert boolean value to integer for database storage
      complaint.isEmergency = complaint.isEmergency ? 1 : 0;
  
      // Ensure `unit` is a valid string value
      complaint.unit = complaint.unit || 'unknown';
  
      const stmt = db.prepare(`
        INSERT INTO complaints (unit, description, phone_number, is_emergency)
        VALUES (@unit, @description, @phoneNumber, @isEmergency)
      `);
    
      const result = stmt.run(complaint);
      console.log("Database insertion successful:", result);
      return result;
    } catch (error) {
      console.error("Database insertion error:", error);
    }
  }
  
export function getComplaintsByDate(date) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  const stmt = db.prepare(`
    SELECT * FROM complaints 
    WHERE timestamp BETWEEN ? AND ?
    ORDER BY timestamp DESC
  `);
  
  return stmt.all(startOfDay.toISOString(), endOfDay.toISOString());
}

export function getAllComplaints() {
  return db.prepare('SELECT * FROM complaints ORDER BY timestamp DESC').all();
}

export default db;
