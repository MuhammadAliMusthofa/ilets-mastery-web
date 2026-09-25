import { describe, it, expect, vi, beforeEach } from "vitest";
import type { ReactElement } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { QuoteAdminContainer } from "./QuoteAdminContainer";
import { quotesAdminService } from "../services/content-admin.service";
import { quoteOfDayService } from "@/src/features/shared/services/quotes.service";

vi.mock("../services/content-admin.service", () => ({
  quotesAdminService: { list: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() },
}));

vi.mock("@/src/features/shared/services/quotes.service", () => ({
  quoteOfDayService: { today: vi.fn() },
}));

const quote = {
  id: 3,
  text: "The limits of my language mean the limits of my world.",
  author: "Ludwig Wittgenstein",
  source: "Tractatus",
  is_active: true,
  createdAt: "2026-09-01T00:00:00.000Z",
  updatedAt: "2026-09-01T00:00:00.000Z",
};

const hidden = { ...quote, id: 4, text: "A hidden line.", author: "Someone", source: null, is_active: false };

const renderWithQuery = (ui: ReactElement) => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
};

describe("QuoteAdminContainer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(quotesAdminService.list).mockResolvedValue([quote, hidden]);
    vi.mocked(quotesAdminService.create).mockResolvedValue(quote);
    vi.mocked(quotesAdminService.update).mockResolvedValue(quote);
    vi.mocked(quoteOfDayService.today).mockResolvedValue({ ...quote, date: "2026-09-22" });
  });

  /** Teks kutipan juga muncul di kartu "hari ini", jadi baris dicari di dalam tabel. */
  const rows = async () => within(await screen.findByRole("table"));

  it("menampilkan kutipan beserta statusnya", async () => {
    renderWithQuery(<QuoteAdminContainer />);
    const table = await rows();

    expect(table.getByText(`“${quote.text}”`)).toBeInTheDocument();
    expect(table.getByText("Hidden")).toBeInTheDocument();
  });

  it("menyaring kutipan yang disembunyikan", async () => {
    renderWithQuery(<QuoteAdminContainer />);
    await rows();

    await userEvent.click(screen.getByRole("radio", { name: /Hidden/i }));
    const table = await rows();

    expect(table.queryByText(`“${quote.text}”`)).not.toBeInTheDocument();
    expect(table.getByText(`“${hidden.text}”`)).toBeInTheDocument();
  });

  it("mengaktifkan kembali kutipan lewat sakelar di baris", async () => {
    renderWithQuery(<QuoteAdminContainer />);
    await rows();

    await userEvent.click(screen.getByRole("switch", { name: new RegExp(hidden.text.slice(0, 10), "i") }));

    expect(quotesAdminService.update).toHaveBeenCalledWith(hidden.id, { is_active: true });
  });

  it("mengirim kutipan baru lewat form", async () => {
    renderWithQuery(<QuoteAdminContainer />);
    await rows();

    await userEvent.click(screen.getByRole("button", { name: /New quote/i }));
    await userEvent.type(screen.getByLabelText(/^Quote/i), "Practice makes progress.");
    await userEvent.type(screen.getByLabelText(/^Author/i), "Anonymous");
    await userEvent.click(screen.getByRole("button", { name: /Save quote/i }));

    expect(quotesAdminService.create).toHaveBeenCalledWith({
      text: "Practice makes progress.",
      author: "Anonymous",
      source: null,
      is_active: true,
    });
  });
});
