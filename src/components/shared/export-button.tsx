import * as XLSX from "xlsx";
import { OPERATOR_LABELS, PAYMENT_STATUS_LABELS, type PaymentStatus, type MobileMoneyOperator } from "@/lib/constants";

// ─── Generic Excel Export ───

interface ExportExcelProps {
  data: Record<string, unknown>[];
  filename: string;
  sheetName?: string;
}

export function ExportExcelButton({ data, filename, sheetName = "Données" }: ExportExcelProps) {
  const handleExport = () => {
    if (!data.length) return;

    const ws = XLSX.utils.json_to_sheet(data);

    const colWidths = Object.keys(data[0]).map((key) => ({
      wch: Math.max(key.length, ...data.map((row) => String(row[key] ?? "").length)) + 2,
    }));
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `${filename}-${date}.xlsx`);
  };

  return (
    <button className="inline-flex items-center justify-center rounded-md border px-3 h-8 text-xs font-medium hover:bg-[hsl(var(--accent))]" onClick={handleExport} disabled={!data.length}>
      📥 Exporter Excel
    </button>
  );
}

// ─── Payments-specific Export ───

interface ExportPaymentsProps {
  payments: Array<{
    beneficiaryName: string;
    operator: MobileMoneyOperator;
    mobileMoneyNumber: string;
    amount: number;
    status: PaymentStatus;
    createdAt: number;
  }>;
}

export function ExportPaymentsButton({ payments }: ExportPaymentsProps) {
  const data = payments.map((p) => ({
    "Bénéficiaire": p.beneficiaryName,
    "Opérateur": OPERATOR_LABELS[p.operator],
    "N° Mobile Money": p.mobileMoneyNumber,
    "Montant (FCFA)": p.amount,
    "Statut": PAYMENT_STATUS_LABELS[p.status],
    "Date": new Date(p.createdAt).toLocaleDateString("fr-FR"),
  }));

  return <ExportExcelButton data={data} filename="paiements" sheetName="Paiements" />;
}
