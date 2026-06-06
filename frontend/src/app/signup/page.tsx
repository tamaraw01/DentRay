import { redirect } from "next/navigation";

export const metadata = {
  title: "Signup"
};

export default function SignupPage() {
  redirect("/?mode=signup");
}
