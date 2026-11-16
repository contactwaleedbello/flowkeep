import { Suspense } from "react";
import { WaterPointView } from "./view";

export default function Page({ params }: PageProps<"/app/water-points/[id]">) {
  return (
    <Suspense fallback={null}>
      <WaterPointView params={params} />
    </Suspense>
  );
}
