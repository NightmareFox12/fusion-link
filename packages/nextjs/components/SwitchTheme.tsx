"use client";

import { useEffect, useState } from "react";
import { Switch } from "./shadcn/ui/switch";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const SwitchTheme = ({ className }: { className?: string }) => {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  const isDarkMode = resolvedTheme === "dark";

  const handleToggle = () => {
    if (isDarkMode) {
      setTheme("light");
      return;
    }
    setTheme("dark");
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={`flex space-x-2 h-8 items-center justify-center text-sm ${className}`}>
      <div className="flex items-center space-x-2">
        <Switch id="airplane-mode" onCheckedChange={handleToggle} />
        {isDarkMode ? <Sun className="text-neutral-content" /> : <Moon className="text-neutral-content" />}
      </div>
    </div>
  );
};
