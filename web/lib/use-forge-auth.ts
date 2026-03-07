"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { syncClerkUser } from "./forge-api";

interface ForgeAuth {
  forgeToken: string | null;
  isLoading: boolean;
  error: string | null;
}

export function useForgeAuth(): ForgeAuth {
  const { user, isLoaded } = useUser();
  const [forgeToken, setForgeToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function sync() {
      if (!isLoaded) return;
      
      if (!user) {
        setForgeToken(null);
        setIsLoading(false);
        return;
      }

      try {
        const email = user.primaryEmailAddress?.emailAddress;
        if (!email) {
          throw new Error("No email address found");
        }

        const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || null;
        const result = await syncClerkUser(user.id, email, name);
        setForgeToken(result.forge_token);
        setError(null);
      } catch (err) {
        console.error("Failed to sync with FORGE:", err);
        setError(err instanceof Error ? err.message : "Sync failed");
        setForgeToken(null);
      } finally {
        setIsLoading(false);
      }
    }

    sync();
  }, [user, isLoaded]);

  return { forgeToken, isLoading, error };
}
