import LogoIcon from "@/components/icons/LogoIcon";
import { Button } from "@/components/ui/button";
import useThemeStore from "@/hooks/useThemeStore";
import { useAuthStore } from "@/store/auth-store";
import { api } from "@/lib/api";
import { Link, useNavigate } from "@tanstack/react-router";
import { Moon, Sun, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

export default function NavigationBar() {
  const navigate = useNavigate();
  const { theme, setTheme } = useThemeStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);

  const handleSignOut = async () => {
    try {
      await api.post("/auth/signout");
    } catch {
      // best-effort: proceed with local logout regardless
    } finally {
      logout();
      navigate({ to: "/" });
    }
  };

  const links = [
    {
      label: "Home",
      to: "/",
    },
    {
      label: "Report",
      to: "/reports",
    },
    {
      label: "Volunteer",
      to: "/volunteers",
    },
    {
      label: "Donate",
      to: "/donation",
    },
    {
      label: "About",
      to: "/about",
    },
  ];

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <header className="py-6 flex items-center justify-between sticky top-0 z-50 bg-bg-body/95 backdrop-blur supports-[backdrop-filter]:bg-bg-body/60">
      <h1 className="flex gap-2 items-center text-lg leading-tight tracking-[-0.015rem] font-bold text-dark">
        <LogoIcon className={"size-6 text-brand"} />
        <span>Orphacare</span>
      </h1>

      {/* Desktop Navigation (large screens only) */}
      <nav className="hidden lg:flex ml-auto items-center gap-8 font-medium text-sm">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="hover:text-brand transition-colors text-text-muted"
            activeProps={{
              className: "!text-brand font-bold",
            }}
          >
            {link.label}
          </Link>
        ))}
        {isAuthenticated ? (
          <div className="ml-4 flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hover:text-brand transition-colors text-text-muted"
              activeProps={{ className: "!text-brand font-bold" }}
            >
              Dashboard
            </Link>
            <Button
              variant={"outline"}
              className="hover:cursor-pointer rounded-full px-6"
              onClick={handleSignOut}
            >
              Sign Out
            </Button>
          </div>
        ) : (
          <Button
            variant={"outline"}
            className="ml-4 hover:cursor-pointer rounded-full px-6"
            onClick={() => navigate({ to: "/sign-in" })}
          >
            Sign In / Register
          </Button>
        )}
      </nav>

      {/* Desktop Theme Toggle */}
      <motion.div
        key={`desktop-${theme}`}
        initial={{ rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="hidden lg:block ml-6 cursor-pointer text-text-muted hover:text-dark"
        onClick={toggleTheme}
      >
        {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
      </motion.div>

      {/* Mobile / Tablet Actions (hidden on large screens) */}
      <div className="flex items-center gap-4 lg:hidden">
        <motion.div
          key={`mobile-${theme}`}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="cursor-pointer text-text-muted hover:text-dark"
          onClick={toggleTheme}
        >
          {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
        </motion.div>

        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-text-dark hover:text-brand transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-bg-card rounded-xl border border-border shadow-xl p-6 flex flex-col gap-4 lg:hidden"
          >
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-lg font-medium text-text-dark hover:text-brand py-2 border-b border-border/50 last:border-0"
                activeProps={{
                  className: "!text-brand font-bold",
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-lg font-medium text-text-dark hover:text-brand py-2 border-b border-border/50"
                  activeProps={{ className: "!text-brand font-bold" }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Button
                  className="w-full mt-2 rounded-full"
                  onClick={() => {
                    handleSignOut();
                    setIsMenuOpen(false);
                  }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                className="w-full mt-2 rounded-full"
                onClick={() => {
                  navigate({ to: "/sign-in" });
                  setIsMenuOpen(false);
                }}
              >
                Sign In / Register
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
