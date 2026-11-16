import { Suspense } from "react";
import { SettingsView } from "./view";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SettingsView />
    </Suspense>
  );
}
