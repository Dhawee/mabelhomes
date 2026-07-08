import type { Metadata } from "next";
import { SITE } from "@/data/site";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About",
  description: `Learn about ${SITE.name}, ${SITE.title} at ${SITE.company}.`,
};

export default function AboutPage() {
  return <AboutClient />;
}
