import sqlite3 from 'sqlite3';
declare class Database {
    private db;
    constructor();
    init(): Promise<void>;
    run(sql: string, params?: any[]): Promise<sqlite3.RunResult>;
    get(sql: string, params?: any[]): Promise<any>;
    all(sql: string, params?: any[]): Promise<any[]>;
    close(): Promise<void>;
}
export declare const database: Database;
export default database;
//# sourceMappingURL=database.d.ts.map