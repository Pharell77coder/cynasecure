/**
 * Client API centralisé pour toutes les requêtes backend.
 * Gère automatiquement :
 * - BASE_URL (depuis .env → "/api")
 * - Sessions (credentials: include)
 * - Timeout
 * - JSON / FormData
 * - Erreurs backend
 * - Réponses vides (204)
 */

const BASE_URL = "";
const DEFAULT_TIMEOUT = 15000; // 15s

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const isFormData = options.body instanceof FormData;

    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "include", // requis pour les sessions Symfony
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeout);

    if (res.status === 204) {
      return {} as T;
    }

    // JSON ou texte brut
    const data = await res
      .json()
      .catch(async () => await res.text().catch(() => null));

    if (!res.ok) {
      const message =
        data?.detail ||
        data?.message ||
        data ||
        `Erreur API (${res.status})`;

      const error = new Error(message) as Error & { statusCode: number; data: unknown };
      error.statusCode = res.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("La requête a expiré (timeout).");
    }
    if (typeof err === "object" && err !== null && "statusCode" in err) throw err;
    throw new Error(err instanceof Error ? err.message : "Erreur réseau.");
  }
}
