import { test, before, after } from "node:test";
import assert from "node:assert";
import { initDb, query, getPool } from "../server/db";
import { registerUser, loginUser, getUserByEmail } from "../server/auth";

before(async () => {
  // Set up connection
  await initDb();
  // Clear any existing test users to have clean state
  await query("DELETE FROM users WHERE email = ?", ["test_user@ignis.com"]);
  await query("DELETE FROM ai_cache WHERE prompt_type = ?", ["test_prompt"]);
});

after(async () => {
  // Clean up
  await query("DELETE FROM users WHERE email = ?", ["test_user@ignis.com"]);
  await query("DELETE FROM ai_cache WHERE prompt_type = ?", ["test_prompt"]);
  // Close connection pool
  const pool = getPool();
  await pool.end();
});

test("Database connection and tables initialized", async () => {
  const usersTable = await query("SHOW TABLES LIKE 'users'");
  assert.ok(usersTable.length > 0, "users table should exist");
  
  const cacheTable = await query("SHOW TABLES LIKE 'ai_cache'");
  assert.ok(cacheTable.length > 0, "ai_cache table should exist");
});

test("User registration, login, and retrieval flow", async () => {
  // 1. Register new user
  const regResult = await registerUser("Test Operator", "test_user@ignis.com", "securePassword123", "security");
  assert.strictEqual(regResult.success, true);
  assert.ok(regResult.user);
  assert.strictEqual(regResult.user.username, "Test Operator");

  // 2. Register duplicate user fails
  const dupeResult = await registerUser("Test Operator", "test_user@ignis.com", "securePassword123", "security");
  assert.strictEqual(dupeResult.success, false);
  assert.strictEqual(dupeResult.error, "An account with this email already exists.");

  // 3. Login with correct password succeeds
  const loginResult = await loginUser("test_user@ignis.com", "securePassword123");
  assert.strictEqual(loginResult.success, true);
  assert.ok(loginResult.token);
  assert.ok(loginResult.user);

  // 4. Login with incorrect password fails
  const failedLogin = await loginUser("test_user@ignis.com", "wrongPassword");
  assert.strictEqual(failedLogin.success, false);

  // 5. Get user by email
  const user = await getUserByEmail("test_user@ignis.com");
  assert.ok(user);
  assert.strictEqual(user.username, "Test Operator");
});
