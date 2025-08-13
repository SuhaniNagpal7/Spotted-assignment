import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';

const DB_PATH = process.env.DB_PATH || './wallet.db';

class Database {
  private db: sqlite3.Database;
  
  constructor() {
    this.db = new sqlite3.Database(DB_PATH);
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Users table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            password TEXT NOT NULL,
            wallet_balance REAL DEFAULT 10000.0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Bank accounts table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS bank_accounts (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            account_holder_name TEXT NOT NULL,
            account_number TEXT NOT NULL,
            ifsc_code TEXT NOT NULL,
            bank_name TEXT NOT NULL,
            account_type TEXT DEFAULT 'savings',
            verified BOOLEAN DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Transactions table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS transactions (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            transfer_id TEXT UNIQUE NOT NULL,
            amount REAL NOT NULL,
            status TEXT DEFAULT 'PENDING',
            utr TEXT,
            bank_account_id TEXT NOT NULL,
            transfer_mode TEXT DEFAULT 'IMPS',
            remarks TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            processed_at DATETIME,
            failure_reason TEXT,
            FOREIGN KEY (user_id) REFERENCES users (id),
            FOREIGN KEY (bank_account_id) REFERENCES bank_accounts (id)
          )
        `);

        // Beneficiaries table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS beneficiaries (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            bene_id TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            phone TEXT NOT NULL,
            bank_account TEXT NOT NULL,
            ifsc TEXT NOT NULL,
            address1 TEXT NOT NULL,
            city TEXT NOT NULL,
            state TEXT NOT NULL,
            pincode TEXT NOT NULL,
            status TEXT DEFAULT 'ACTIVE',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Notifications table
        this.db.run(`
          CREATE TABLE IF NOT EXISTS notifications (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            read BOOLEAN DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Create index on notifications created_at for better sorting performance
        this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_notifications_created_at 
          ON notifications (created_at DESC)
        `);

        // Create index on notifications user_id and created_at for user-specific queries
        this.db.run(`
          CREATE INDEX IF NOT EXISTS idx_notifications_user_created 
          ON notifications (user_id, created_at DESC)
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  run(sql: string, params?: any[]): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this);
        }
      });
    });
  }

  get(sql: string, params?: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql: string, params?: any[]): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

export const database = new Database();
export default database; 