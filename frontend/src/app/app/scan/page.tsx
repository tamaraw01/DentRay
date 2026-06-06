import { AppShell } from "@/components/app/AppShell";
import { MultiViewScan } from "@/components/scan/MultiViewScan";

export const metadata = {
  title: "Skrining"
};

export default function ScanPage() {
  return (
    <AppShell>
      <MultiViewScan />
    </AppShell>
  );
}
