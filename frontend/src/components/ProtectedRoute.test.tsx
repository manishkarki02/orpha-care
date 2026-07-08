import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuthStore } from "@/store/auth-store";

vi.mock("@/store/auth-store", () => ({
  useAuthStore: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  Navigate: ({ to }: { to: string }) => (
    <div data-testid="navigate" data-to={to} />
  ),
  Outlet: () => <div data-testid="outlet" />,
}));

const mockedUseAuthStore = vi.mocked(useAuthStore);

describe("ProtectedRoute", () => {
  it("redirects to /sign-in when the user is not authenticated", () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: false,
      user: null,
    } as ReturnType<typeof useAuthStore>);

    render(<ProtectedRoute />);

    expect(screen.getByTestId("navigate")).toHaveAttribute(
      "data-to",
      "/sign-in"
    );
  });

  it("redirects to / when the user's role is not in allowedRoles", () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test", email: "a@test.com", role: "USER" },
    } as ReturnType<typeof useAuthStore>);

    render(<ProtectedRoute allowedRoles={["ADMIN"]} />);

    expect(screen.getByTestId("navigate")).toHaveAttribute("data-to", "/");
  });

  it("renders children when authenticated and role is allowed", () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test", email: "a@test.com", role: "ADMIN" },
    } as ReturnType<typeof useAuthStore>);

    render(
      <ProtectedRoute allowedRoles={["ADMIN"]}>
        <div data-testid="protected-content">Secret</div>
      </ProtectedRoute>
    );

    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it("renders the Outlet when authenticated with no children and no role restriction", () => {
    mockedUseAuthStore.mockReturnValue({
      isAuthenticated: true,
      user: { id: "1", name: "Test", email: "a@test.com", role: "USER" },
    } as ReturnType<typeof useAuthStore>);

    render(<ProtectedRoute />);

    expect(screen.getByTestId("outlet")).toBeInTheDocument();
  });
});
