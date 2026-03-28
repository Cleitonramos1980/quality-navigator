import { useState, useEffect } from "react";
import { WifiOff, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

const ApiStatusBanner = () => {
  const [offline, setOffline] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let active = true;
    const check = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`, { method: "GET", signal: AbortSignal.timeout(4000) });
        if (active) setOffline(!res.ok);
      } catch {
        if (active) setOffline(true);
      }
    };
    void check();
    const interval = setInterval(check, 30_000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning-foreground">
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-warning" />
      <span className="flex-1">API indisponível — dados exibidos podem ser do cache local.</span>
      <Button type="button" variant="ghost" size="icon" className="h-5 w-5" onClick={() => setDismissed(true)}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
};

export default ApiStatusBanner;
