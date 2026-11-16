import { Suspense } from "react";
import { SettingsView } from "../admin/settings/view";

/** Programme officer settings: Profile and Appearance. */
export default function Page() {
  return (
    <Suspense fallback={null}>
      <SettingsView role="officer" />
    </Suspense>
  );
}
