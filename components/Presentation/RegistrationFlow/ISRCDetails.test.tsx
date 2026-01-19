import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ISRCDetails from "./ISRCDetails";

const originalFetch = globalThis.fetch;
const mockResponse = {
  title: "Test Title",
  workNumber: "12341234",
  composers: ["Composer"],
  arranger: "Arranger",
  lyricist: "Lyricist",
};

describe("ISRCDetails", () => {
  afterEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = originalFetch;
  });

  it("should inform about loading and ready status changes", async () => {
    const onStatusChange = jest.fn();
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    globalThis.fetch = fetchMock;

    render(<ISRCDetails isrc="USRC17607839" onStatusChange={onStatusChange} onSelectAnother={jest.fn()} />);

    await waitFor(() => expect(onStatusChange).toHaveBeenNthCalledWith(2, "ready"));

    expect(onStatusChange).toHaveBeenNthCalledWith(1, "loading");

    expect(await screen.findByText("Du har valgt værket “Test Title”")).toBeInTheDocument();
  });

  it("should inform about loading and error status changes when request fails", async () => {
    const onStatusChange = jest.fn();
    const fetchMock = jest.fn().mockRejectedValue(new Error("Network error"));
    globalThis.fetch = fetchMock;

    render(<ISRCDetails isrc="USRC17607839" onStatusChange={onStatusChange} onSelectAnother={jest.fn()} />);

    await waitFor(() => expect(onStatusChange).toHaveBeenNthCalledWith(2, "error"));

    expect(onStatusChange).toHaveBeenNthCalledWith(1, "loading");

    expect(await screen.findByText("Kunne ikke hente oplysninger om originalværket. Forsøg venligst igen.")).toBeInTheDocument();
  });

  it("should trigger onSelectAnother when user chooses to search again", async () => {
    const onSelectAnother = jest.fn();

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    globalThis.fetch = fetchMock;

    render(<ISRCDetails isrc="USRC17607839" onStatusChange={jest.fn()} onSelectAnother={onSelectAnother} />);

    const user = userEvent.setup();
    const selectAnotherButton = await screen.findByRole("button", { name: "Er det ikke det rigtige værk? Søg igen." });
    await user.click(selectAnotherButton);

    expect(onSelectAnother).toHaveBeenCalledTimes(1);
  });
});
