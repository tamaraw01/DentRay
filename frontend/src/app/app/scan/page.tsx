import { AppShell } from "@/components/app/AppShell";
import { SingleImageScan } from "@/components/scan/SingleImageScan";

export const metadata = {
  title: "Skrining"
};

export default function ScanPage() {
  return (
    <AppShell>
      <SingleImageScan />
    </AppShell>
  );
}
