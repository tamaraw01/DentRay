import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export const metadata = {
  title: "Password Baru"
};

export default function ResetPasswordPage() {
  return (
    <section className="px-4 py-16">
      <ResetPasswordForm />
    </section>
  );
}
