import Receipt from "@/components/Presentation/Receipt/Receipt";

type ReceiptPageProps = {
  params: Promise<{
    receiptId: string;
  }>;
};

export default async function ReceiptPage({ params }: ReceiptPageProps) {
  const { receiptId } = await params;

  return <Receipt receiptId={receiptId} />;
}
