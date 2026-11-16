import { Suspense } from "react";
import { Detail } from "./detail";

export default function Page({ params }: PageProps<"/app/technician/faults/[id]">) {
  return (
    <Suspense fallback={null}>
      <Detail params={params} />
    </Suspense>
  );
}
