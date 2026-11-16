import { Suspense } from "react";
import { FaultRecordView } from "./view";

export default function Page({ params }: PageProps<"/app/faults/[id]">) {
  return (
    <Suspense fallback={null}>
      <FaultRecordView params={params} />
    </Suspense>
  );
}
