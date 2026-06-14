/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seed } from "./seed";
import type { CollectionKey, DB } from "./types";

const STORAGE_KEY = "royce-os-v1";

function loadDB(): DB {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seed;
    const parsed = JSON.parse(raw) as Partial<DB>;
    // Shallow-merge so newly added collections still get seed defaults.
    return {
      ...seed,
      ...parsed,
      profile: { ...seed.profile, ...(parsed.profile ?? {}) },
    };
  } catch {
    return seed;
  }
}

type ItemOf<K extends CollectionKey> = DB[K][number];

type StoreValue = {
  db: DB;
  add: <K extends CollectionKey>(key: K, item: ItemOf<K>) => void;
  update: <K extends CollectionKey>(
    key: K,
    id: string,
    patch: Partial<ItemOf<K>>,
  ) => void;
  remove: <K extends CollectionKey>(key: K, id: string) => void;
  setProfile: (patch: Partial<DB["profile"]>) => void;
  resetAll: () => void;
  exportJSON: () => string;
};

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDB] = useState<DB>(loadDB);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }, [db]);

  const add = useCallback(
    <K extends CollectionKey>(key: K, item: ItemOf<K>) => {
      setDB((prev) => {
        const list = prev[key] as ItemOf<K>[];
        return { ...prev, [key]: [item, ...list] } as DB;
      });
    },
    [],
  );

  const update = useCallback(
    <K extends CollectionKey>(key: K, id: string, patch: Partial<ItemOf<K>>) => {
      setDB((prev) => {
        const list = prev[key] as ItemOf<K>[];
        const next = list.map((el) => (el.id === id ? { ...el, ...patch } : el));
        return { ...prev, [key]: next } as DB;
      });
    },
    [],
  );

  const remove = useCallback(<K extends CollectionKey>(key: K, id: string) => {
    setDB((prev) => {
      const list = prev[key] as ItemOf<K>[];
      return { ...prev, [key]: list.filter((el) => el.id !== id) } as DB;
    });
  }, []);

  const setProfile = useCallback((patch: Partial<DB["profile"]>) => {
    setDB((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const resetAll = useCallback(() => {
    window.localStorage.removeItem(STORAGE_KEY);
    setDB(seed);
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(db, null, 2), [db]);

  const value = useMemo<StoreValue>(
    () => ({ db, add, update, remove, setProfile, resetAll, exportJSON }),
    [db, add, update, remove, setProfile, resetAll, exportJSON],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
