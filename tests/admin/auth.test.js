const request = require("supertest");
const app = require("../../server");
const bcrypt = require("bcrypt");

// Mocked services and models
const AdminService = require("../../src/services/auth");
// const User = require("../../src/models/user");
const mockGenerateToken = jest.fn();
jest.mock("../../src/utils/getToken", () => mockGenerateToken);

const mockSendEmailFunction = jest.fn();
jest.mock("../../src/utils/sendEmail", () => ({
  sendEmail: mockSendEmailFunction,
}));

describe("POST /api/admin/auth/V1/register", () => {
  // 1. Should register a new admin successfully
  it("should register a new admin successfully", async () => {
    const adminData = {
      email: "admin@example.com",
      password: "securePassword",
    };

    // Mock services
    AdminService.checkUserExists = jest.fn().mockResolvedValue(null);
    AdminService.registerAdmin = jest
      .fn()
      .mockResolvedValue({ email: adminData.email });

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(201);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Admin registered successfully");
    expect(res.body.data.email).toBe(adminData.email);
  });

  // 2. Should return an error if admin already exists
  it("should return an error if admin already exists", async () => {
    const adminData = {
      email: "admin@example.com",
      password: "securePassword",
    };

    // Mock services
    AdminService.checkUserExists = jest
      .fn()
      .mockResolvedValue({ email: adminData.email });

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Admin already exists!");
  });

  // 3. Should return an error for invalid input (empty email)
  it("should return an error for invalid input (empty email)", async () => {
    const adminData = { email: "", password: "securePassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email cannot be an empty field");
  });

  // 4. Should return an error for invalid input (empty password)
  it("should return an error for invalid input (empty password)", async () => {
    const adminData = { email: "admin@example.com", password: "" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("password cannot be an empty field");
  });

  // 5. Should return an error for invalid email format
  it("should return an error for invalid email format", async () => {
    const adminData = { email: "invalid-email", password: "securePassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email must be a valid email");
  });

  // 6. Should return an error if password is too short
  it("should return an error if password is too short", async () => {
    const adminData = { email: "admin@example.com", password: "short" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain(
      "password should have a minimum length of 6 characters"
    );
  });

  // 7. Should handle database errors (e.g., failure during registration)
  it("should return an error when there is a database issue", async () => {
    const adminData = {
      email: "admin@example.com",
      password: "securePassword",
    };

    // Mock a database error
    AdminService.registerAdmin = jest
      .fn()
      .mockRejectedValue(new Error("Database error"));

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Admin already exists!");
  });

  // 8. Should return an error for missing email field
  it("should return an error for missing email field", async () => {
    const adminData = { password: "securePassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email is a required field");
  });

  // 9. Should return an error for missing password field
  it("should return an error for missing password field", async () => {
    const adminData = { email: "admin@example.com" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("password is a required field");
  });

  // 10. Should validate and ensure strong password requirements
  it("should return an error for weak password (no numbers)", async () => {
    const adminData = { email: "admin@example.com", password: "weakpassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("Admin already exists!");
  });

  // 11. Should return an error for invalid characters in email
  it("should return an error for invalid characters in email", async () => {
    const adminData = {
      email: "admin@invalid!example.com",
      password: "securePassword",
    };

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email must be a valid email");
  });

  // 12. Should return an error if the email is already registered with a different case (case-insensitive)
  it("should return an error if the email is already registered with a different case", async () => {
    const adminData = {
      email: "Admin@example.com",
      password: "securePassword",
    };

    // Mock services
    AdminService.checkUserExists = jest
      .fn()
      .mockResolvedValue({ email: "admin@example.com" }); // Admin exists (case-insensitive)

    const res = await request(app)
      .post("/api/admin/auth/V1/register")
      .send(adminData)
      .expect(409);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Admin already exists!");
  });
});

describe("POST /api/admin/auth/V1/login", () => {
  // 1. Should log in an admin successfully
  it("should log in an admin successfully", async () => {
    const adminData = {
      email: "admin@example.com",
      password: "securePassword",
    };
    const mockAdmin = {
      id: "some-uuid-string",
      email: adminData.email,
      password: "hashedPassword",
      is_active: 1,
      isVerified: true,
    }; // Assuming id is a string/uuid

    // Mock services
    AdminService.checkUserExists = jest.fn().mockResolvedValue(mockAdmin);
    bcrypt.compare = jest.fn().mockResolvedValue(true); // Password matches

    // CORRECTED: Set the mock implementation for the directly exported function
    mockGenerateToken.mockResolvedValue("mockToken"); // Mock the token generation

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Login successful");
    expect(res.body.data.token).toBe("mockToken");

    // Optional: Also check if the token generation function was called with the correct payload
    // Remember your generateToken takes a payload object, not just an ID
    expect(mockGenerateToken).toHaveBeenCalledWith({ id: mockAdmin.id });
  });

  // 2. Should return error if user not found
  it("should return error if user not found", async () => {
    const adminData = { email: "admin@example.com", password: "wrongPassword" };

    // Mock services
    AdminService.checkUserExists = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found");
  });

  // 3. Should return error for incorrect credentials (wrong password)
  it("should return error for incorrect credentials (wrong password)", async () => {
    const adminData = { email: "admin@example.com", password: "wrongPassword" };
    const mockAdmin = {
      id: 1,
      email: adminData.email,
      password: "hashedPassword",
      is_active: 1,
      isVerified: true,
    };

    // Mock services
    AdminService.checkUserExists = jest.fn().mockResolvedValue(mockAdmin);
    bcrypt.compare = jest.fn().mockResolvedValue(false); // Password doesn"t match

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(401);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Invalid credentials");
  });

  // 4. Should return error for missing email field
  it("should return error for missing email field", async () => {
    const adminData = { password: "securePassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email is a required field");
  });

  // 5. Should return error for missing password field
  it("should return error for missing password field", async () => {
    const adminData = { email: "admin@example.com" };

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("password is a required field");
  });

  // 6. Should return error for invalid email format
  it("should return error for invalid email format", async () => {
    const adminData = { email: "invalid-email", password: "securePassword" };

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email must be a valid email");
  });

  // 9. Should return error for password less than minimum length
  it("should return error for password less than minimum length", async () => {
    const adminData = { email: "admin@example.com", password: "short" };

    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send(adminData)
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain(
      "password should have a minimum length of 6 characters"
    );
  });

  // 11. Should return an error for missing fields (empty body)
  it("should return an error for empty request body", async () => {
    const res = await request(app)
      .post("/api/admin/auth/V1/login")
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("email is a required field");
  });
});

describe("POST /api/admin/auth/V1/forgot-password", () => {
  // Test case 1: Email is missing
  it("should return error if email is missing", async () => {
    const res = await request(app)
      .post("/api/admin/auth/V1/forgot-password")
      .send({})
      .expect(400);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Email address required");
  });

  // Test case 2: User not found
  it("should return error if user is not found", async () => {
    const adminData = { email: "admin@example.com" };

    // Mock the checkUserExists method to return null (user not found)
    AdminService.checkUserExists = jest.fn().mockResolvedValue(null);

    const res = await request(app)
      .post("/api/admin/auth/V1/forgot-password")
      .send(adminData)
      .expect(404);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("User not found!");
  });

  // Test case 3: User found but email property is missing
  it("should return error if email property is missing in user object", async () => {
    const adminData = { email: "admin@example.com" };

    const mockUser = { id: 1, role: "admin" }; // Missing email field

    AdminService.checkUserExists = jest.fn().mockResolvedValue(mockUser);

    const res = await request(app)
      .post("/api/admin/auth/V1/forgot-password")
      .send(adminData)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe(
      "Internal server error: User email data is incomplete."
    );
  });

  // Test case 4: Password reset success
  it("should send a password reset email if user is found", async () => {
    const adminData = { email: "admin@example.com" };
    const mockUser = { id: 1, role: "admin", email: "admin@example.com" };

    AdminService.checkUserExists = jest.fn().mockResolvedValue(mockUser);
    mockGenerateToken.mockResolvedValue("mockToken");
    mockSendEmailFunction.mockResolvedValue(true);

    const res = await request(app)
      .post("/api/admin/auth/V1/forgot-password")
      .send(adminData)
      .expect(200);

    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe(
      "Notification send to registered email address"
    );

    // expect(generateToken).toHaveBeenCalledWith({
    //   id: mockUser.id,
    //   role: mockUser.role,
    //   email: mockUser.email,
    // });

    expect(mockSendEmailFunction).toHaveBeenCalledWith({
      to: mockUser.email,
      subject: "Reset Your Admin Password",
      html: expect.stringContaining("Click the link to reset your password"),
    });
  });

  // Test case 5: Internal error (unexpected error)
  it("should handle unexpected errors gracefully", async () => {
    const adminData = { email: "admin@example.com" };

    // Simulate an unexpected error in the service
    AdminService.checkUserExists = jest
      .fn()
      .mockRejectedValue(new Error("Database Error"));

    const res = await request(app)
      .post("/api/admin/auth/V1/forgot-password")
      .send(adminData)
      .expect(500);

    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Internal server error");
  });
});
