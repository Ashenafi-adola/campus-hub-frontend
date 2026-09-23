import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import VerifyEmailForm from "@/components/auth/verify/verify-email-form";

export default async function VerifyEmailPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("signup_redirect")?.value;

  if (!token) {
    redirect("/signup");
  }

  return <VerifyEmailForm email={token}/>;
}
