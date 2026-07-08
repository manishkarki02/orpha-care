import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AuthenticationError,
  BadRequestError,
} from "@/common/utils/errorClass.utils";
import type {
  RegisterRequestSchema,
  LoginRequestSchema,
} from "@/features/auth/auth.schema";
import * as authService from "@/features/auth/services/auth.service";

const mockPrisma = vi.hoisted(() => ({
  user: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));
vi.mock("@/db", () => ({ default: mockPrisma }));

const mockAuthUtils = vi.hoisted(() => ({
  generatePasswordHash: vi.fn(async (pw: string) => `hashed:${pw}`),
  comparePasswordHash: vi.fn(),
  generateRandomToken: vi.fn(() => "random-token"),
  createJWTToken: vi.fn(() => "jwt-token"),
}));
vi.mock("@/features/auth/utils/auth.utils", () => mockAuthUtils);

const mockTokenCache = vi.hoisted(() => ({
  setCachedToken: vi.fn(),
  getCachedToken: vi.fn(),
  consumeCachedToken: vi.fn(),
}));
vi.mock("@/features/auth/services/tokenCache.service", () => mockTokenCache);

const mockUserCache = vi.hoisted(() => ({
  setCacheUser: vi.fn(),
  removeCachedUser: vi.fn(),
}));
vi.mock("@/features/auth/services/userCache.service", () => mockUserCache);

const mockMail = vi.hoisted(() => ({
  sendVerificationMail: vi.fn(),
  sendResetPasswordMail: vi.fn(),
}));
vi.mock("@/common/services/mail.service", () => mockMail);

const registerBody: RegisterRequestSchema["body"] = {
  name: "Test User",
  address: "Kathmandu",
  email: "a@test.com",
  phone: "9800000000",
  password: "Password123",
  confirmPassword: "Password123",
};

const loginBody: LoginRequestSchema["body"] = {
  email: "a@test.com",
  password: "Password123",
};

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("signUpUser", () => {
    it("throws BadRequestError when email/phone is already registered and verified", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ isVerified: true });

      await expect(authService.signUpUser(registerBody)).rejects.toBeInstanceOf(
        BadRequestError
      );
    });

    it("throws AuthenticationError when a matching account exists but is unverified", async () => {
      mockPrisma.user.findFirst.mockResolvedValue({ isVerified: false });

      await expect(authService.signUpUser(registerBody)).rejects.toBeInstanceOf(
        AuthenticationError
      );
    });

    it("creates a new user and sends a verification email when there is no conflict", async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: "1",
        email: registerBody.email,
      });

      await authService.signUpUser(registerBody);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(mockMail.sendVerificationMail).toHaveBeenCalledWith(
        registerBody.email,
        "random-token"
      );
    });
  });

  describe("signInUser", () => {
    it("throws AuthenticationError for an unknown email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(authService.signInUser(loginBody)).rejects.toBeInstanceOf(
        AuthenticationError
      );
    });

    it("throws AuthenticationError for an incorrect password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        password: "hashed",
        isVerified: true,
      });
      mockAuthUtils.comparePasswordHash.mockResolvedValue(false);

      await expect(authService.signInUser(loginBody)).rejects.toBeInstanceOf(
        AuthenticationError
      );
    });

    it("throws AuthenticationError for an unverified user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        password: "hashed",
        isVerified: false,
      });
      mockAuthUtils.comparePasswordHash.mockResolvedValue(true);

      await expect(authService.signInUser(loginBody)).rejects.toBeInstanceOf(
        AuthenticationError
      );
    });

    it("returns access/refresh tokens and the user's role on success", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "1",
        name: "Test User",
        email: registerBody.email,
        password: "hashed",
        isVerified: true,
        role: "USER",
        address: "Kathmandu",
        createdAt: new Date(),
      });
      mockAuthUtils.comparePasswordHash.mockResolvedValue(true);

      const result = await authService.signInUser(loginBody);

      expect(result.accessToken).toBe("jwt-token");
      expect(result.refreshToken).toBe("random-token");
      expect(result.role).toBe("USER");
      expect(mockTokenCache.setCachedToken).toHaveBeenCalled();
      expect(mockUserCache.setCacheUser).toHaveBeenCalled();
    });
  });
});
