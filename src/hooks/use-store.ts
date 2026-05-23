import { useEffect, useState } from "react";
import { store, type AppState, currentUser as cu } from "@/lib/store";

export function useStore() {
  const [state, setState] = useState<AppState>(() => store.get());
  useEffect(() => {
    const sync = () => setState(store.get());
    window.addEventListener("trix:store", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("trix:store", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return state;
}

export function useCurrentUser() {
  const s = useStore();
  return s.users.find(u => u.id === s.currentUserId);
}

export { cu };
