import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegistrationFlow from "./RegistrationFlow";
import { useRouter } from "next/navigation";

jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const advanceToStepTwo = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/Navn/i), "Test User");
  await user.type(screen.getByLabelText(/E-mailadresse/i), "test@example.com");
  await user.click(screen.getByRole("button", { name: "Næste" }));
};

const advanceToStepThree = async (user: ReturnType<typeof userEvent.setup>) => {
  await advanceToStepTwo(user);
  const isrcInput = await screen.findByLabelText(/ISRC/i);
  const artistInput = await screen.findByLabelText(/Dit artistnavn/i);
  await user.type(isrcInput, "USRC17607839");
  await user.type(artistInput, "Demo Artist");
  await user.click(screen.getByRole("button", { name: "Næste" }));
};

const originalFetch = globalThis.fetch;

describe("RegistrationFlow", () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("should display field error when input is wrong", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await user.type(screen.getByLabelText(/Navn/i), "Test User");
    await user.type(screen.getByLabelText(/E-mailadresse/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: "Næste" }));

    expect(screen.getByText("Indtast en gyldig e-mailadresse.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("should navigate to next step", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await advanceToStepTwo(user);

    expect(await screen.findByLabelText(/ISRC/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/Dit artistnavn/i)).toBeInTheDocument();
  });

  it("should fetch ISRC details when reaching step three", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        title: "Yesterday",
        workNumber: "12341234",
        composers: ["Composer"],
        arranger: "Arranger",
        lyricist: "Lyricist",
      }),
    });
    globalThis.fetch = fetchMock;

    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await advanceToStepThree(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/fetch-song/USRC17607839"));
    expect(await screen.findByText("Du har valgt værket “Yesterday”")).toBeInTheDocument();
    expect(screen.getByText("Værknummer")).toBeInTheDocument();
  });

  it("should show an error when fetching ISRC details fails", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    const fetchMock = jest.fn().mockRejectedValue(new Error("Network error"));
    globalThis.fetch = fetchMock;

    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await advanceToStepThree(user);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/fetch-song/USRC17607839"));
    expect(await screen.findByText("Kunne ikke hente oplysninger om originalværket. Forsøg venligst igen.")).toBeInTheDocument();
    expect(screen.getByText("Originalværket er ikke tilgængeligt endnu. Prøv igen om lidt.")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it("should submit data and redirect user to receipt page", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    const fetchMock = jest.fn().mockImplementation((url: string) => {
      if (url.startsWith("/api/fetch-song/")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            title: "Yesterday",
            workNumber: "12341234",
            composers: ["Composer"],
            arranger: "Arranger",
            lyricist: "Lyricist",
          }),
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({
          reference: "NMP-123456",
          receivedAt: "2024-01-01T00:00:00.000Z",
          receiptId: "receipt-789",
        }),
      });
    });
    globalThis.fetch = fetchMock;
    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await advanceToStepThree(user);

    const sendButton = await screen.findByRole("button", { name: "Send" });
    await waitFor(() => expect(sendButton).not.toBeDisabled());

    await user.click(sendButton);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith("/api/register-song", expect.objectContaining({ method: "POST" })));
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/receipt/receipt-789"));
  });

  it("should throw an error if data cannot be submitted", async () => {
    const pushMock = jest.fn();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });

    const fetchMock = jest.fn().mockImplementation((url: string) => {
      if (url.startsWith("/api/fetch-song/")) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            title: "Yesterday",
            workNumber: "12341234",
            composers: ["Composer"],
            arranger: "Arranger",
            lyricist: "Lyricist",
          }),
        });
      }

      return Promise.resolve({
        ok: false,
        json: async () => ({ error: "failed" }),
      });
    });
    globalThis.fetch = fetchMock;

    render(<RegistrationFlow />);

    const user = userEvent.setup();
    await advanceToStepThree(user);

    const sendButton = await screen.findByRole("button", { name: "Send" });
    await waitFor(() => expect(sendButton).not.toBeDisabled());

    await user.click(sendButton);

    await waitFor(() => expect(screen.getByText("Det lykkedes ikke at sende data. Tjek din forbindelse og prøv igen.")).toBeInTheDocument());
    expect(pushMock).not.toHaveBeenCalled();
  });
});
