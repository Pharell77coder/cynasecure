import { useCallback, useState, useEffect } from "react";

export interface ToastMessage {
  id: string;
  message: string;
  variant: "default" | "success" | "error";
  duration?: number;
}

type Listener = (t: ToastMessage) => void;

let listeners: Listener[] = [];

export function toast(
  message: string,
  variant: ToastMessage["variant"] = "default",
  duration = 3500
) {
  const t: ToastMessage = {
    id: crypto.randomUUID(),
    message,
    variant,
    duration,
  };

  listeners.forEach((l) => l(t));
}

export function useToast() {
  const [items, setItems] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const handler: Listener = (t) => {
      setItems((prev) => [...prev, t]);

      const timeout = setTimeout(() => {
        setItems((prev) => prev.filter((p) => p.id !== t.id));
      }, t.duration ?? 3500);

      return () => clearTimeout(timeout);
    };

    listeners.push(handler);

    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return { items, dismiss };
}
