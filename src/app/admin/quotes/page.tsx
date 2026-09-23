import type { Metadata } from "next";
import { QuoteAdminContainer } from "@/src/features/admin/containers/QuoteAdminContainer";

export const metadata: Metadata = { title: "Motivational quotes" };

export default function AdminQuotesPage() {
  return <QuoteAdminContainer />;
}
