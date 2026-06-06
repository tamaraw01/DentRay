import { AppShell } from "@/components/app/AppShell";
import { ProfilePanel } from "@/components/profile/ProfilePanel";

export const metadata = {
  title: "Profil"
};

export default function ProfilePage() {
  return (
    <AppShell>
      <ProfilePanel />
    </AppShell>
  );
}
