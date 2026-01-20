"use client";

import { useEffect, useState } from "react";
import Button from "@/components/UI/Button";
import { OriginalWork } from "@/app/api/fetch-song/[isrc]/route";

export type ISRCDetailsStatus = "loading" | "ready" | "error";

type ISRCDetailsProps = {
  isrc: string;
  onStatusChange?: (status: ISRCDetailsStatus) => void;
  onSelectAnother: () => void;
};

export default function ISRCDetails({ isrc, onStatusChange, onSelectAnother }: ISRCDetailsProps) {
  const [isrcDetails, setIsrcDetails] = useState<OriginalWork | null>(null);
  const [status, setStatus] = useState<ISRCDetailsStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const updateStatus = (nextStatus: ISRCDetailsStatus) => {
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  useEffect(() => {
    if (!isrc) {
      setErrorMessage("ISRC mangler. Gå tilbage og indtast koden igen.");
      updateStatus("error");
      return;
    }

    const fetchISRCDetails = async () => {
      updateStatus("loading");
      setErrorMessage(null);

      try {
        const response = await fetch(`/api/fetch-song/${encodeURIComponent(isrc)}`);

        if (!response.ok) {
          throw new Error("Kunne ikke hente data");
        }

        const data = await response.json();
        setIsrcDetails(data);
        updateStatus("ready");
      } catch (error) {
        console.error("Failed to fetch ISRC details", error);
        setErrorMessage("Kunne ikke hente oplysninger om originalværket. Forsøg venligst igen.");
        updateStatus("error");
      }
    };

    fetchISRCDetails();
  }, [isrc]);

  if (status === "loading") {
    return <div className="rounded-2xl bg-gray-100 p-6 text-sm text-gray-500">Henter oplysninger om originalværket...</div>;
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl bg-red-50 p-6 text-sm text-red-700">{errorMessage}</div>
      </div>
    );
  }

  if (!isrcDetails) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-sky-50 p-6 text-gray-900">
      <p className="text-sm font-semibold text-sky-900">Du har valgt værket “{isrcDetails.title}”</p>
      <div className="mt-4 space-y-3 text-sm text-gray-700">
        <DescriptionItem label="Titel" value={isrcDetails.title} />
        <DescriptionItem label="Værknummer" value={isrcDetails.workNumber} />
        <DescriptionItem label="Komponister/forfattere" value={isrcDetails.composers.join(", ")} />
        <DescriptionItem label="Arrangør" value={isrcDetails.arranger} />
        <DescriptionItem label="Tekstforfatter" value={isrcDetails.lyricist} />
        <Button onClick={onSelectAnother} size="sm" variant="outlined">
          Er det ikke det rigtige værk? Søg igen.
        </Button>
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
