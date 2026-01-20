"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/UI/Button";
import InputField from "@/components/UI/InputField";
import Stepper from "@/components/UI/Stepper";
import { RegistrationRequest, SubmissionResponse } from "@/app/api/register-song/route";
import { isValidEmail } from "@/utils/isValidEmail";
import { isValidUrl } from "@/utils/isValidUrl";
import { isValidIsrc } from "@/utils/isValidISRC";
import { registrationReducer } from "./RegistrationReducer";
import ISRCDetails, { ISRCDetailsStatus } from "./ISRCDetails";

type FormData = RegistrationRequest;

const steps = [
  {
    id: 1,
    title: "Kontaktoplysninger",
    description: "Vi bruger oplysningerne til at kontakte dig angående din registrering, hvis det bliver nødvendigt.",
  },
  {
    id: 2,
    title: "Oplysninger om dit covernummer",
    description: "Indtast ISRC og kunstnernavn præcis som registreret hos din digitale distributør.",
  },
  {
    id: 3,
    title: "Oplysninger om originalværket",
    description: "Bekræft at du har valgt det rigtige værk, og hjælp os med et link til originalen.",
  },
];

export default function RegistrationFlow() {
  const [state, dispatch] = useReducer(registrationReducer, {
    step: 1,
    formData: {
      contactName: "",
      contactEmail: "",
      isrc: "",
      artistName: "",
      originalLink: "",
    },
    fieldErrors: {},
    isError: null,
    isLoading: false,
  });
  const { step, formData, fieldErrors, isError, isLoading } = state;
  const router = useRouter();

  const currentStep = steps[step - 1];

  const updateField = (field: keyof FormData, value: string) => {
    dispatch({ type: "UPDATE_FIELD", field, value });
  };

  const validateStep = (currentStepId: number) => {
    const fieldErrors: Partial<Record<keyof FormData, string>> = {};

    if (currentStepId === 1) {
      if (!formData.contactName.trim()) {
        fieldErrors.contactName = "Indtast dit fulde navn.";
      }

      if (!isValidEmail(formData.contactEmail)) {
        fieldErrors.contactEmail = "Indtast en gyldig e-mailadresse.";
      }
    }

    if (currentStepId === 2) {
      if (!isValidIsrc(formData.isrc)) {
        fieldErrors.isrc = "ISRC skal indeholde præcis 12 cifre uden mellemrum.";
      }

      if (!formData.artistName.trim()) {
        fieldErrors.artistName = "Indtast dit artistnavn.";
      }
    }

    if (currentStepId === 3) {
      const originalLinkValue = formData.originalLink.trim();
      if (originalLinkValue && !isValidUrl(originalLinkValue)) {
        fieldErrors.originalLink = "Linket skal starte med http:// eller https://.";
      }
    }

    dispatch({ type: "SET_FIELD_ERRORS", fieldErrors });
    return Object.keys(fieldErrors).length === 0;
  };

  const handlePrevious = () => {
    dispatch({ type: "CLEAR_FIELD_ERRORS" });
    dispatch({ type: "SET_STEP", step: Math.max(1, step - 1) });
  };

  const submit = async (payload: FormData): Promise<SubmissionResponse> => {
    const response = await fetch("/api/register-song", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("API request failed");
    }

    return await response.json();
  };

  const handleNext = async () => {
    const isStepValid = validateStep(step);

    if (!isStepValid) {
      return;
    }

    if (step < steps.length) {
      dispatch({ type: "SET_STEP", step: step + 1 });
      return;
    }

    dispatch({ type: "SET_ERROR", message: null });
    dispatch({ type: "SET_LOADING", loading: true });

    try {
      const response = await submit(formData);

      router.push(`/receipt/${encodeURIComponent(response.receiptId)}`);
    } catch (error) {
      console.error("Failed to send data", error);
      dispatch({ type: "SET_ERROR", message: "Det lykkedes ikke at sende data. Tjek din forbindelse og prøv igen." });
      dispatch({ type: "SET_LOADING", loading: false });
    }
  };

  const handleStatusChange = (status: ISRCDetailsStatus) => {
    if (status === "loading") {
      dispatch({ type: "SET_LOADING", loading: true });
      return;
    }

    dispatch({ type: "SET_LOADING", loading: false });

    if (status === "error") {
      dispatch({ type: "SET_ERROR", message: "Originalværket er ikke tilgængeligt endnu. Prøv igen om lidt." });
      return;
    }

    dispatch({ type: "SET_ERROR", message: null });
  };

  const renderStepContent = () => {
    if (step === 1) {
      return (
        <div className="space-y-5">
          <InputField required label="Navn" placeholder="Fornavn Efternavn" value={formData.contactName} error={fieldErrors.contactName} onChange={(value) => updateField("contactName", value)} />

          <InputField
            required
            label="E-mailadresse"
            type="email"
            placeholder="mail@mail.dk"
            value={formData.contactEmail}
            error={fieldErrors.contactEmail}
            onChange={(value) => updateField("contactEmail", value)}
          />
        </div>
      );
    }

    if (step === 2) {
      return (
        <div className="space-y-6">
          <div className="space-y-2">
            <InputField required label="ISRC" placeholder="ex. 123456789000" value={formData.isrc} error={fieldErrors.isrc} onChange={(value) => updateField("isrc", value)} />
            <p className="text-sm text-gray-500">ISRC står for International Standard Recording Code. Det er en 12-cifret kode, der identificerer hvert enkelt track på en udgivelse.</p>
          </div>

          <InputField required label="Dit artistnavn" placeholder="ex. The Beatles" value={formData.artistName} error={fieldErrors.artistName} onChange={(value) => updateField("artistName", value)} />
        </div>
      );
    }

    if (step === 3) {
      return (
        <div className="space-y-6">
          <ISRCDetails isrc={formData.isrc} onStatusChange={handleStatusChange} onSelectAnother={handlePrevious} />

          {isLoading !== true && (
            <div className="space-y-2">
              <InputField
                label="Indsæt et link til originalværket (valgfrit)"
                placeholder="ex. https://www.youtube.com/watch?v=NrgmdOz227I"
                value={formData.originalLink}
                error={fieldErrors.originalLink}
                onChange={(value) => updateField("originalLink", value)}
              />
              <p className="text-sm text-gray-500">Hjælp os med at sikre, at du har valgt det rigtige originalværk ved at indsætte et link fra Youtube, Spotify eller en anden tjeneste.</p>
            </div>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-16 px-4">
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <Stepper steps={steps.length} currentStep={step} />

        <section className="bg-white p-8 shadow-[0_40px_80px_rgba(15,23,42,0.08)]">
          <div className="space-y-3">
            <h2 className="text-2xl font-semibold text-gray-900">{currentStep.title}</h2>
            <p className="text-base text-gray-600">{currentStep.description}</p>
          </div>

          <div className="mt-8">{renderStepContent()}</div>

          {isError && <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">{isError}</p>}

          <div className="mt-10 flex  gap-4 flex-row justify-between">
            <Button onClick={handlePrevious} disabled={step === 1 || isLoading} variant="text">
              Tilbage
            </Button>

            <Button onClick={handleNext} disabled={isLoading === true} isLoading={isLoading}>
              {step === steps.length ? "Send" : "Næste"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
