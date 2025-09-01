// app/context/ThemeProvider.tsx
import { createContext, PropsWithChildren, useContext, useEffect, useState } from "react";
import { ClientOnly } from "~/components/ClientOnly";

const ThemeContext = createContext({
  theme: "halloween",
  setTheme: (theme: string) => {},
});

const ThemeProviderImpl = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState("halloween");

  useEffect(() => {
    // Set theme after hydration
    const savedTheme = localStorage.getItem("theme") || "halloween";
    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return (
    <ClientOnly fallback={<div data-theme="halloween">{children}</div>}>
      <ThemeProviderImpl>{children}</ThemeProviderImpl>
    </ClientOnly>
  );
}

export const useTheme = () => useContext(ThemeContext);