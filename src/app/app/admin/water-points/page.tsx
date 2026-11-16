import { Suspense } from "react";
import { WaterPointsView } from "./view";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <WaterPointsView />
    </Suspense>
  );
}
