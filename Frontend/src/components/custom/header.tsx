// components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="flex items-center justify-between px-2 sm:px-4 py-2 bg-background text-black dark:text-white w-full">
      <div className="flex items-center space-x-2">
        {/* side menu button */}
        <Button
          variant="outline"
          onClick={onMenuClick}
          className="bg-background border border-gray text-gray-600 dark:text-gray-200 h-10"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>

        {/* Home Button */}
        <Link to="/">
          <Button
            variant="outline"
            className="bg-background border border-gray text-gray-600 dark:text-gray-200 h-10"
          >
            <Home className="h-[1.2rem] w-[1.2rem]" />
            <span className="sr-only">Go home</span>
          </Button>
        </Link>

        {/* Theme Toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
};
