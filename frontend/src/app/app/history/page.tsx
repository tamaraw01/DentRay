import { AppShell } from "@/components/app/AppShell";
import { HistoryList } from "@/components/history/HistoryList";

export const metadata = {
  title: "Riwayat"
};

export default function HistoryPage() {
  return (
    <AppShell>
      <HistoryList />
    </AppShell>
  );
}
