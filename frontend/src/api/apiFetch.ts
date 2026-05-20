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

const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
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
      credentials: "include", // 🔥 indispensable pour les sessions Symfony
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeout);

    // 🔥 204 No Content
    if (res.status === 204) {
      return {} as T;
    }

    // 🔥 JSON ou texte brut
    const data = await res
      .json()
      .catch(async () => await res.text().catch(() => null));

    if (!res.ok) {
      const message =
        data?.detail ||
        data?.message ||
        data ||
        `Erreur API (${res.status})`;

      throw new Error(message);
    }

    return data as T;
  } catch (err: any) {
    if (err.name === "AbortError") {
      throw new Error("La requête a expiré (timeout).");
    }
    throw new Error(err.message || "Erreur réseau.");
  }
}
