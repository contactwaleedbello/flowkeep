import { redirect } from "next/navigation";

/** Exports now live on Reports, next to the figures they export. */
export default function Page() {
  redirect("/app/reports");
}
