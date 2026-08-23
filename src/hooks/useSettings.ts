import { useState, useEffect, useCallback } from "react";
import { getSettings, updateSettings } from "@/db/database";
import type { Settings } from "@/types";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const s = await getSettings();
      setSettings(s);
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(
    async (updates: Partial<Omit<Settings, "id">>) => {
      const updated = await updateSettings(updates);
      setSettings(updated);
      return updated;
    },
    []
  );

  return { settings, loading, update, refresh };
}
