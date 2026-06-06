import { AppHome } from "@/components/app/AppHome";
import { AppShell } from "@/components/app/AppShell";

export const metadata = {
  title: "App"
};

export default function PrivateHomePage() {
  return (
    <AppShell>
      <AppHome />
    </AppShell>
  );
}
