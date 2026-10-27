import { redirect } from "next/navigation";

export const instant = false;

export default function StaffIndexPage() {
  redirect("/staff/reservations");
}
