import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthorizationError, ConflictError, NotFoundError } from "@/common/utils/errorClass.utils";

const mockPrisma = vi.hoisted(() => ({
	kidsForAdoption: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
	user: {
		findUnique: vi.fn(),
	},
	adoptionRequest: {
		findUnique: vi.fn(),
		create: vi.fn(),
	},
}));
vi.mock("@/db", () => ({ default: mockPrisma }));

vi.mock("@/common/services/mail.service", () => ({
	sendMail: vi.fn(),
}));

import * as adoptionService from "@/features/adoption/adoption.service";

describe("adoption.service", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("createAdoptionKid", () => {
		it("throws AuthorizationError when the caller is not an ADMIN", async () => {
			await expect(
				adoptionService.createAdoptionKid(
					{
						name: "Ram",
						surName: "Thapa",
						age: 5,
						gender: "Male",
						province: "Bagmati",
						description: "A cheerful boy.",
					},
					"USER",
					undefined,
				),
			).rejects.toBeInstanceOf(AuthorizationError);

			expect(mockPrisma.kidsForAdoption.create).not.toHaveBeenCalled();
		});
	});

	describe("requestForAdoption", () => {
		it("throws NotFoundError when the kid does not exist", async () => {
			mockPrisma.kidsForAdoption.findUnique.mockResolvedValue(null);

			await expect(adoptionService.requestForAdoption("kid-1", "adopter-1")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});

		it("throws NotFoundError when the adopter does not exist", async () => {
			mockPrisma.kidsForAdoption.findUnique.mockResolvedValue({
				id: "kid-1",
				isAdopted: false,
			});
			mockPrisma.user.findUnique.mockResolvedValue(null);

			await expect(adoptionService.requestForAdoption("kid-1", "adopter-1")).rejects.toBeInstanceOf(
				NotFoundError,
			);
		});

		it("throws ConflictError when the kid is already adopted", async () => {
			mockPrisma.kidsForAdoption.findUnique.mockResolvedValue({
				id: "kid-1",
				isAdopted: true,
			});
			mockPrisma.user.findUnique.mockResolvedValue({ id: "adopter-1" });

			await expect(adoptionService.requestForAdoption("kid-1", "adopter-1")).rejects.toBeInstanceOf(
				ConflictError,
			);
		});

		it("throws ConflictError when a request already exists for this kid/adopter pair", async () => {
			mockPrisma.kidsForAdoption.findUnique.mockResolvedValue({
				id: "kid-1",
				isAdopted: false,
			});
			mockPrisma.user.findUnique.mockResolvedValue({ id: "adopter-1" });
			mockPrisma.adoptionRequest.findUnique.mockResolvedValue({
				kidId: "kid-1",
				adopterId: "adopter-1",
			});

			await expect(adoptionService.requestForAdoption("kid-1", "adopter-1")).rejects.toBeInstanceOf(
				ConflictError,
			);

			expect(mockPrisma.adoptionRequest.create).not.toHaveBeenCalled();
		});

		it("creates the adoption request when there is no conflict", async () => {
			mockPrisma.kidsForAdoption.findUnique.mockResolvedValue({
				id: "kid-1",
				isAdopted: false,
			});
			mockPrisma.user.findUnique.mockResolvedValue({ id: "adopter-1" });
			mockPrisma.adoptionRequest.findUnique.mockResolvedValue(null);
			mockPrisma.adoptionRequest.create.mockResolvedValue({
				kidId: "kid-1",
				adopterId: "adopter-1",
				kid: { name: "Ram" },
				adopter: { email: "adopter@test.com" },
			});

			const result = await adoptionService.requestForAdoption("kid-1", "adopter-1");

			expect(result.kidId).toBe("kid-1");
			expect(mockPrisma.adoptionRequest.create).toHaveBeenCalled();
		});
	});
});
