import { redirect } from "next/navigation";

export default function HelloWorldRedirectPage() {
  redirect("/stats");
}
