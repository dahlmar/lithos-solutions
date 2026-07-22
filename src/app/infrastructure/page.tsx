import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/MarketingPage";
import { infrastructure } from "@/features/marketing/content";

export const metadata: Metadata = {
  title: "Infrastructure",
  description: infrastructure.heroSub,
};

export default function InfrastructurePage() {
  return <MarketingPage content={infrastructure} />;
}
