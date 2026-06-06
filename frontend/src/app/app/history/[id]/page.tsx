import { AppShell } from "@/components/app/AppShell";
import { HistoryDetail } from "@/components/history/HistoryDetail";

export const metadata = {
  title: "Detail Riwayat"
};

type HistoryDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function HistoryDetailPage({ params }: HistoryDetailPageProps) {
  const { id } = await params;
  return (
    <AppShell>
      <HistoryDetail id={id} />
    </AppShell>
  );
}
