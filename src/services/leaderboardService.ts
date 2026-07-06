import type { LeaderboardEntry } from "../types/leaderboard";

const BASE_URL = import.meta.env.VITE_API_URL;

export function streamLeaderboard(
  token: string | null,
  isAdmin: boolean,
  onData: (entries: LeaderboardEntry[]) => void,
  onError: (error: Error) => void,
): AbortController {
  const controller = new AbortController();

  const headers: Record<string, string> = {
    Accept: "text/event-stream",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  (async () => {
    try {
      const endpoint = isAdmin ? "/leaderboard/stream" : "/leaderboard/stream/anonymous";
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        method: "GET",
        credentials: "include",
        headers,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ReadableStream not supported");
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed.startsWith("data:")) {
            const jsonStr = trimmed.slice(5).trim();
            if (!jsonStr) continue;
            try {
              const parsed = JSON.parse(jsonStr) as LeaderboardEntry[];
              onData(parsed);
            } catch {
              /* skip malformed chunks */
            }
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      onError(err instanceof Error ? err : new Error("Stream connection lost"));
    }
  })();

  return controller;
}
