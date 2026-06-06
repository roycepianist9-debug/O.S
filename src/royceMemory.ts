import type { RoyceOperatingData } from "./royceData";

export type MemoryMode = "loading" | "supabase" | "local";

export type MemoryState = {
  mode: MemoryMode;
  detail: string;
  updatedAt?: string;
};

export type MemoryLoadResult =
  | {
      ok: true;
      data: RoyceOperatingData | null;
      state: MemoryState;
    }
  | {
      ok: false;
      state: MemoryState;
    };

export async function loadSupabaseMemory(): Promise<MemoryLoadResult> {
  try {
    const response = await fetch("/api/royce-memory");

    if (!response.ok) {
      return {
        ok: false,
        state: {
          mode: "local",
          detail: "Supabase memory not configured yet. Using browser memory.",
        },
      };
    }

    const body = (await response.json()) as { data: RoyceOperatingData | null; updatedAt?: string };

    return {
      ok: true,
      data: body.data,
      state: {
        mode: "supabase",
        detail: body.data ? "Synced with Supabase memory." : "Supabase connected. Seed data ready to sync.",
        updatedAt: body.updatedAt,
      },
    };
  } catch {
    return {
      ok: false,
      state: {
        mode: "local",
        detail: "Offline or local dev mode. Using browser memory.",
      },
    };
  }
}

export async function saveSupabaseMemory(data: RoyceOperatingData): Promise<MemoryState> {
  try {
    const response = await fetch("/api/royce-memory", {
      body: JSON.stringify({ data }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      return {
        mode: "local",
        detail: "Saved locally. Supabase memory is not connected yet.",
      };
    }

    const body = (await response.json()) as { updatedAt?: string };

    return {
      mode: "supabase",
      detail: "Saved to Supabase memory.",
      updatedAt: body.updatedAt,
    };
  } catch {
    return {
      mode: "local",
      detail: "Saved locally. Supabase sync is unavailable.",
    };
  }
}
