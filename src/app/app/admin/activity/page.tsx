import { Suspense } from "react";
import { ActivityView } from "./view";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ActivityView />
    </Suspense>
  );
}
