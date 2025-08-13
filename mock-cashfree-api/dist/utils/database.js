"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const DB_PATH = process.env.DB_PATH || './wallet.db';
class Database {
    constructor() {
        this.db = new sqlite3_1.default.Database(DB_PATH);
    }
    async init() {
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
        `, (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }
    run(sql, params) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(this);
                }
            });
        });
    }
    get(sql, params) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(row);
                }
            });
        });
    }
    all(sql, params) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(rows);
                }
            });
        });
    }
    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
}
exports.database = new Database();
exports.default = exports.database;
//# sourceMappingURL=database.js.map