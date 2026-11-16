import type { Metadata } from "next";
import { DemoProvider } from "@/lib/demo/store";

export const metadata: Metadata = {
  title: { default: "Demo app", template: "%s · Flowkeep demo" },
  robots: { index: false },
};

export default function AppLayout({ children }: LayoutProps<"/app">) {
  return <DemoProvider>{children}</DemoProvider>;
}
