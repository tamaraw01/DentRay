import { Card } from "@/components/ui/Card";

type MedicalDisclaimerProps = {
  disclaimer: string;
};

export function MedicalDisclaimer({ disclaimer }: MedicalDisclaimerProps) {
  return (
    <Card className="border-amber-200/70 bg-amber-50/80 shadow-none">
      <h3 className="text-base font-extrabold text-amber-950">Catatan medis</h3>
      <p className="mt-2 text-sm leading-6 text-amber-900">{disclaimer}</p>
    </Card>
  );
}
