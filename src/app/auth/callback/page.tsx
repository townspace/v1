import { redirect } from "next/navigation";

export default function AuthCallbackPage() {
  // Redirect to home after Supabase processes the callback
  redirect("/");
}
