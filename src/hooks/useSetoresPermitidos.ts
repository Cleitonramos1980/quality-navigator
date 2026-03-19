import { useEffect, useState } from "react";
import { listUsuarioSetores, listSetoresInspecao } from "@/services/inspecoes";
import { getCurrentPerfil, type PerfilNome } from "@/lib/rbac";
import { SETORES_INSPECAO } from "@/types/inspecoes";

/**
 * Fetches allowed sectors from the backend for the current user/profile.
 * Falls back to SETORES_INSPECAO only if the API call fails entirely.
 */
export function useSetoresPermitidos(userId?: string) {
  const [setores, setSetores] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const perfil = getCurrentPerfil();
    const uid = userId || "current";

    (async () => {
      try {
        const result = await listUsuarioSetores(uid, perfil);
        if (!cancelled) setSetores(result);
      } catch {
        // API unavailable — local fallback
        if (!cancelled) setSetores([...SETORES_INSPECAO]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { setoresPermitidos: setores, loading };
}
