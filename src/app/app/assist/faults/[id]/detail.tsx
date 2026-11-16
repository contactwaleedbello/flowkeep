"use client";

import { use } from "react";
import { FieldFaultDetail } from "@/components/app/field-views";

export function Detail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <FieldFaultDetail role="assist" id={id} />;
}
