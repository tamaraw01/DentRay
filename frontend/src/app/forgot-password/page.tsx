import { AuthCard } from "@/components/auth/AuthCard";

export const metadata = {
  title: "Lupa Password"
};

export default function ForgotPasswordPage() {
  return (
    <section className="px-4 py-16">
      <AuthCard mode="forgot" />
    </section>
  );
}

