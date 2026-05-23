import { useEffect, useState } from "react";

export function I18nInit({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    import("@/lib/i18n.client").then((m) => {
      m.initI18n();
      setReady(true);
    });
  }, []);
  return <>{children}</>;
}
