import { useEffect, useState } from "react";
import { listUsuarioSetores } from "@/services/inspecoes";
import { getCurrentPerfil } from "@/lib/rbac";

/**
 * Fetches allowed sectors exclusively from the backend (INS_USUARIO_SETOR).
 * No local fallback — the backend/database is the single source of truth.
 */
export function useSetoresPermitidos(userId?: string) {
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const perfil = getCurrentPerfil();
    const uid = userId || "current";

    (async () => {
      try {
        const result = await listUsuarioSetores(uid, perfil);
        if (!cancelled) {
          setSetores(result);
          setError(null);
        }
      } catch (err) {
        // API unavailable — return empty (safe default), surface error
        if (!cancelled) {
          setSetores([]);
          setError("Não foi possível carregar os setores permitidos.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { setoresPermitidos: setores, loading, error };
}
