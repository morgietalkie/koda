"use client";

import { useEffect, useState } from "react";
import { ReceiptResponse } from "@/app/api/receipt/[receiptId]/route";

type ReceiptState = { status: "loading" } | { status: "error"; message: string } | { status: "success"; data: ReceiptResponse };

export default function Receipt({ receiptId }: { receiptId: string }) {
  const [state, setState] = useState<ReceiptState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();

    const loadReceipt = async () => {
      setState({ status: "loading" });

      try {
        const response = await fetch(`/api/receipt/${encodeURIComponent(receiptId)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          const payload = await response.json();
          console.error(payload.error);
          throw new Error("Der opstod en fejl ved hentning af kvitteringen.");
        }

        const receipt: ReceiptResponse = await response.json();
        setState({ status: "success", data: receipt });
      } catch (error) {
        const isAbort = controller.signal.aborted;
        if (isAbort) {
          return;
        }

        console.error("Failed to load receipt", error);
        setState({
          status: "error",
          message: "Kunne ikke hente kvitteringen for din registrering.",
        });
      }
    };

    loadReceipt();

    return () => controller.abort();
  }, [receiptId]);

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-4">
      <div className="mx-auto max-w-3xl bg-white p-10 shadow-[0_40px_80px_rgba(15,23,42,0.08)]">
        {state.status === "loading" && <p className="text-center text-base text-gray-600">Henter kvittering...</p>}

        {state.status === "error" && (
          <div className="space-y-4 text-center">
            <p className="text-lg font-semibold text-gray-900">Vi kunne ikke hente en kvittering.</p>
            <p className="text-base text-gray-600">{state.message}</p>
          </div>
        )}

        {state.status === "success" && <ReceiptDetailsView details={state.data} />}
      </div>
    </div>
  );
}

function ReceiptDetailsView({ details }: { details: ReceiptResponse }) {
  return (
    <div className="space-y-6 text-center sm:text-left">
      <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">Registrering sendt</p>
      <h1 className="text-3xl font-semibold text-gray-900">Tak! Vi har modtaget din registrering</h1>

      <p className="text-base text-gray-600">
        Referencenummer {details.reference} ({new Date(details.receivedAt).toLocaleString()}).
      </p>

      <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-left">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Uddrag af indsendte data</h2>
        <dl className="mt-4 space-y-3 text-sm text-gray-800">
          <DescriptionItem label="Kontakt" value={`${details.contactName}, ${details.contactEmail}`} />
          <DescriptionItem label="ISRC" value={details.isrc} />
          <DescriptionItem label="Artist" value={details.artistName} />
          <DescriptionItem label="Link til original" value={details.originalLink || "Ikke angivet"} />
        </dl>
      </div>
    </div>
  );
}

function DescriptionItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-sm text-gray-900">{value}</p>
    </div>
  );
}
