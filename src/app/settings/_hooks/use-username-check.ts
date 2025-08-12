"use client";

import { useState, useEffect, useCallback } from "react";
import useSWRMutation from "swr/mutation";

import { apiPost } from "@/lib/fetcher";

interface UsernameCheckResult {
  available: boolean | null;
  checking: boolean;
  error: string | null;
}

interface UsernameCheckResponse {
  success: boolean;
  available: boolean;
  message?: string;
  error?: string;
}

export function useUsernameCheck(username: string, currentUsername?: string) {
  const [result, setResult] = useState<UsernameCheckResult>({
    available: null,
    checking: false,
    error: null,
  });

  const { trigger: checkUsernameMutation } = useSWRMutation(
    "/api/profile/check-username",
    (_url, { arg }: { arg: { username: string } }) =>
      apiPost<UsernameCheckResponse>("/api/profile/check-username", {
        body: arg,
      }),
  );

  const checkUsername = useCallback(
    async (usernameToCheck: string) => {
      // No verificar si es el mismo username actual
      if (usernameToCheck === currentUsername) {
        setResult({ available: true, checking: false, error: null });
        return;
      }

      // No verificar usernames muy cortos o largos
      if (usernameToCheck.length < 3 || usernameToCheck.length > 20) {
        setResult({ available: false, checking: false, error: null });
        return;
      }

      setResult((prev) => ({ ...prev, checking: true }));

      try {
        const data = await checkUsernameMutation({ username: usernameToCheck });

        if (data.success) {
          setResult({
            available: data.available,
            checking: false,
            error: null,
          });
        } else {
          setResult({
            available: false,
            checking: false,
            error: data.error || "Error al verificar username",
          });
        }
      } catch {
        setResult({
          available: false,
          checking: false,
          error: "Error de conexión",
        });
      }
    },
    [currentUsername, checkUsernameMutation],
  );

  useEffect(() => {
    if (!username || username.length < 3) {
      setResult({ available: null, checking: false, error: null });
      return;
    }

    const timeoutId = setTimeout(() => {
      checkUsername(username);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username, checkUsername]);

  return result;
}
