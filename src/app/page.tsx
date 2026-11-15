import { redirect } from "next/navigation";
import { ROUTES } from "@/constants";

// This route only redirects; it has no segment to render for instant validation.
export const instant = false;

export default function HomePage() {
  redirect(ROUTES.repositories);
}
