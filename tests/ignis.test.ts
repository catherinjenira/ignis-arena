import { test, before, after } from "node:test";
import assert from "node:assert";
import { initDb, query, getPool } from "../server/db";
import { registerUser, loginUser, getUserByEmail } from "../server/auth";
import { rateLimiter } from "../server";

before(async () => {
  // Set up connection
  await initDb();
  // Clear any existing test users to have clean state
  await query("DELETE FROM users WHERE email = ?", ["test_user@ignis.com"]);
  await query("DELETE FROM users WHERE email = ?", ["invalid_test_email"]);
  await query("DELETE FROM ai_cache WHERE prompt_type = ?", ["test_prompt"]);
});

after(async () => {
  // Clean up
  await query("DELETE FROM users WHERE email = ?", ["test_user@ignis.com"]);
  await query("DELETE FROM users WHERE email = ?", ["invalid_test_email"]);
  await query("DELETE FROM ai_cache WHERE prompt_type = ?", ["test_prompt"]);
  // Close connection pool
  const pool = getPool();
  await pool.end();
  
  // Terminate cleanly
  setTimeout(() => {
    process.exit(0);
  }, 100);
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

test("Registration validation rules (Security checks)", async () => {
  // 1. Invalid email format fails
  const invalidEmailResult = await registerUser("Invalid Email", "invalid_email_format", "securePassword123", "security");
  assert.strictEqual(invalidEmailResult.success, false);
  assert.strictEqual(invalidEmailResult.error, "Invalid email format.");

  // 2. Password too short fails
  const shortPassResult = await registerUser("Short Pass", "short_pass@ignis.com", "123", "security");
  assert.strictEqual(shortPassResult.success, false);
  assert.strictEqual(shortPassResult.error, "Password must be at least 6 characters long.");
});

test("Database AI cache read, write, and update (Efficiency checks)", async () => {
  const key = "test_key_123";
  const type = "test_prompt";
  const input = "test input prompt";
  const output = "test response output";

  // Clean any residual test cache
  await query("DELETE FROM ai_cache WHERE cache_key = ?", [key]);

  // 1. Save cache
  await query(
    "INSERT INTO ai_cache (cache_key, prompt_type, prompt_input, response_output) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE response_output = ?",
    [key, type, input, output, output]
  );

  // 2. Read cache
  const results = await query("SELECT response_output FROM ai_cache WHERE cache_key = ?", [key]);
  assert.strictEqual(results.length, 1);
  assert.strictEqual(results[0].response_output, output);

  // 3. Update cache
  const newOutput = "updated response output";
  await query(
    "INSERT INTO ai_cache (cache_key, prompt_type, prompt_input, response_output) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE response_output = ?",
    [key, type, input, newOutput, newOutput]
  );
  
  const updatedResults = await query("SELECT response_output FROM ai_cache WHERE cache_key = ?", [key]);
  assert.strictEqual(updatedResults.length, 1);
  assert.strictEqual(updatedResults[0].response_output, newOutput);

  // Clean up
  await query("DELETE FROM ai_cache WHERE cache_key = ?", [key]);
});

test("Rate Limiter Middleware (Security checks)", () => {
  let nextCalled = false;
  const mockReq = {
    ip: "1.2.3.4",
    headers: {},
    socket: {}
  } as any;
  
  let statusSet: number | null = null;
  let jsonSent: any = null;
  const mockRes = {
    status(code: number) {
      statusSet = code;
      return this;
    },
    json(data: any) {
      jsonSent = data;
      return this;
    }
  } as any;
  
  const mockNext = () => {
    nextCalled = true;
  };

  // Create a rate limiter with a limit of 1 request
  const limiter = rateLimiter(1, 10000);

  // First request should pass
  limiter(mockReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, true);

  // Reset next flag
  nextCalled = false;

  // Second request should be blocked
  limiter(mockReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, false);
  assert.strictEqual(statusSet, 429);
  assert.deepStrictEqual(jsonSent, { error: "Too many requests. Please try again later." });
});
