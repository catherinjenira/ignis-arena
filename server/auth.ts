import { User, UserRole } from "../src/types";
import { query } from "./db";
import crypto from "crypto";

// Helper to hash password with salt
function hashPassword(password: string, salt: string): string {
  return crypto.createHash("sha256").update(password + salt).digest("hex");
}

// Seed default users if the users table is empty
export async function initUserStore() {
  try {
    const existingUsers: any[] = await query("SELECT COUNT(*) as count FROM users");
    const count = existingUsers[0]?.count || 0;
    if (count === 0) {
      console.log("[Auth] Users table is empty. Seeding default simulation accounts...");
      await seedDefaultUsers();
    } else {
      console.log(`[Auth] Users table verified, contains ${count} users.`);
    }
  } catch (err) {
    console.error("[Auth] Failed to initialize user store:", err);
  }
}

async function seedDefaultUsers() {
  try {
    // Seed Director
    const saltDir = crypto.randomBytes(16).toString("hex");
    const passDir = hashPassword("director123", saltDir);
    await query(
      "INSERT INTO users (id, username, email, role, passwordHash, salt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["u-dir-1", "Director Ignis", "director@ignis.com", "director", passDir, saltDir, new Date().toISOString()]
    );

    // Seed Security
    const saltSec = crypto.randomBytes(16).toString("hex");
    const passSec = hashPassword("security123", saltSec);
    await query(
      "INSERT INTO users (id, username, email, role, passwordHash, salt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["u-sec-1", "Chief Jaeger", "security@ignis.com", "security", passSec, saltSec, new Date().toISOString()]
    );

    // Seed Fan
    const saltFan = crypto.randomBytes(16).toString("hex");
    const passFan = hashPassword("fan123", saltFan);
    await query(
      "INSERT INTO users (id, username, email, role, passwordHash, salt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      ["u-fan-1", "Echo Fan", "fan@ignis.com", "fan", passFan, saltFan, new Date().toISOString()]
    );

    console.log("[Auth] Default simulation accounts seeded successfully.");
  } catch (err) {
    console.error("[Auth] Failed to seed default users:", err);
  }
}

// Core Operations
export async function registerUser(username: string, email: string, password: string, role: UserRole = "fan"): Promise<{ success: boolean; error?: string; user?: User }> {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (!username || !email || !password) {
    return { success: false, error: "Username, email, and password are required." };
  }

  try {
    const existing: any[] = await query("SELECT id FROM users WHERE email = ?", [normalizedEmail]);
    if (existing.length > 0) {
      return { success: false, error: "An account with this email already exists." };
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);
    const id = "u-" + crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await query(
      "INSERT INTO users (id, username, email, role, passwordHash, salt, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [id, username.trim(), normalizedEmail, role, passwordHash, salt, createdAt]
    );

    return {
      success: true,
      user: {
        id,
        username: username.trim(),
        email: normalizedEmail,
        role,
        createdAt
      }
    };
  } catch (err: any) {
    console.error("[Auth] Error registering user:", err);
    return { success: false, error: "Database error during registration." };
  }
}

export async function loginUser(email: string, password: string): Promise<{ success: boolean; error?: string; user?: User; token?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const results: any[] = await query("SELECT * FROM users WHERE email = ?", [normalizedEmail]);
    if (results.length === 0) {
      return { success: false, error: "Invalid email or password." };
    }

    const record = results[0];
    const computedHash = hashPassword(password, record.salt);
    if (computedHash !== record.passwordHash) {
      return { success: false, error: "Invalid email or password." };
    }

    // Create a simple token
    const token = crypto.randomBytes(32).toString("hex");

    return {
      success: true,
      user: {
        id: record.id,
        username: record.username,
        email: record.email,
        role: record.role as UserRole,
        createdAt: record.createdAt,
      },
      token,
    };
  } catch (err: any) {
    console.error("[Auth] Error logging in user:", err);
    return { success: false, error: "Database error during login." };
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const results: any[] = await query("SELECT * FROM users WHERE email = ?", [email.toLowerCase().trim()]);
    if (results.length === 0) return null;
    const record = results[0];
    return {
      id: record.id,
      username: record.username,
      email: record.email,
      role: record.role as UserRole,
      createdAt: record.createdAt,
    };
  } catch (err) {
    console.error("[Auth] Error getting user by email:", err);
    return null;
  }
}
