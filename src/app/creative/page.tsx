import type { Metadata } from "next";
import MarketingPage from "@/components/marketing/MarketingPage";
import { creative } from "@/features/marketing/content";

export const metadata: Metadata = {
  title: "Creative",
  description: creative.heroSub,
};

export default function CreativePage() {
  return <MarketingPage content={creative} />;
}
