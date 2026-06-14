/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Route = { name: string; param?: string };

type NavValue = {
  route: Route;
  go: (name: string, param?: string) => void;
  back: () => void;
  canBack: boolean;
};

const NavContext = createContext<NavValue | null>(null);

const ROOTS = ["dashboard", "grants", "network", "money", "more"];

export function NavProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: "dashboard" }]);

  const go = useCallback((name: string, param?: string) => {
    setStack((prev) => {
      // Tapping a root tab resets to that root.
      if (ROOTS.includes(name)) return [{ name, param }];
      return [...prev, { name, param }];
    });
  }, []);

  const back = useCallback(() => {
    setStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const value = useMemo<NavValue>(
    () => ({
      route: stack[stack.length - 1],
      go,
      back,
      canBack: stack.length > 1,
    }),
    [stack, go, back],
  );

  return <NavContext.Provider value={value}>{children}</NavContext.Provider>;
}

export function useNav(): NavValue {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error("useNav must be used within NavProvider");
  return ctx;
}
