import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "Catherin@07",
};

const dbName = process.env.DB_NAME || "ignis_arena";

let pool: mysql.Pool | null = null;

export async function initDb() {
  try {
    // First, connect to MySQL without specifying a database to ensure it exists
    const connection = await mysql.createConnection(dbConfig);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
    await connection.end();

    // Create the connection pool with the database specified
    pool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Create tables if they do not exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        passwordHash VARCHAR(255) NOT NULL,
        salt VARCHAR(255) NOT NULL,
        createdAt VARCHAR(255) NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ai_cache (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cache_key VARCHAR(64) UNIQUE NOT NULL,
        prompt_type VARCHAR(50) NOT NULL,
        prompt_input TEXT NOT NULL,
        response_output TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log(`[DB] Database "${dbName}" initialized and tables verified.`);
  } catch (error) {
    console.error(`[DB] Failed to initialize database:`, error);
    throw error;
  }
}

export function getPool(): mysql.Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call initDb() first.");
  }
  return pool;
}

export async function query(sql: string, params?: any[]): Promise<any> {
  const [results] = await getPool().execute(sql, params);
  return results;
}
