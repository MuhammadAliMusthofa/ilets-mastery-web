"use client";

import { useMemo, useState } from "react";
import { Loader2, Pencil, Plus, Quote as QuoteIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/src/libs/utils";
import { PageBody, PageHeader } from "@/src/_global/components/Shell/AppShell";
import type { Quote } from "@/src/models/admin-content";
import {
  useQuoteOfDay,
  useQuotes,
  useRemoveQuote,
  useSaveQuote,
  useToggleQuote,
} from "../hooks/useContentAdmin";
import {
  Badge,
  ConfirmDialog,
  Drawer,
  EmptyState,
  ErrorNotice,
  Field,
  FilterChips,
  IconAction,
  SearchInput,
  StatCard,
  TBody,
  THead,
  Table,
  TableCard,
  Td,
  Th,
  Toggle,
  Tr,
  formatDate,
  readErrorMessage,
} from "../components/AdminUI";
import { fieldClass, textareaClass } from "../components/fields";

type StatusFilter = "all" | "active" | "hidden";

const TEXT_MAX = 500;

const emptyForm = { text: "", author: "", source: "", is_active: true };

/** Tampilan kutipan seperti yang dilihat siswa di dashboard. */
export function QuoteCardPreview({
  text,
  author,
  source,
  label = "Quote of the day",
  className,
}: {
  text: string;
  author: string;
  source?: string | null;
  label?: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative flex flex-col justify-center overflow-hidden rounded-xl bg-slate-950 p-6 text-white", className)}>
      <QuoteIcon size={56} className="absolute -right-2 -top-2 text-white/10" aria-hidden="true" />
      <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#b9e3ff]">{label}</p>
      <blockquote className="mt-3 font-display text-[20px] leading-snug">
        {text ? `“${text}”` : <span className="text-white/40">Your quote will appear here.</span>}
      </blockquote>
      <figcaption className="mt-4 text-[14px] text-white/70">
        — {author || "Author"}
        {source && <span className="text-white/50">, {source}</span>}
      </figcaption>
    </figure>
  );
}

export function QuoteAdminContainer() {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Quote | "new" | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleting, setDeleting] = useState<Quote | null>(null);

  const { data: quotes, isLoading, isError } = useQuotes();
  const { data: today } = useQuoteOfDay();
  const saveQuote = useSaveQuote();
  const toggleQuote = useToggleQuote();
  const removeQuote = useRemoveQuote();

  const counts = useMemo(() => {
    const active = quotes?.filter((quote) => quote.is_active).length ?? 0;
    return { all: quotes?.length ?? 0, active, hidden: (quotes?.length ?? 0) - active };
  }, [quotes]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (quotes ?? []).filter((quote) => {
      if (status === "active" && !quote.is_active) return false;
      if (status === "hidden" && quote.is_active) return false;
      if (!term) return true;
      return quote.text.toLowerCase().includes(term) || quote.author.toLowerCase().includes(term);
    });
  }, [quotes, status, search]);

  const openForm = (quote: Quote | "new") => {
    saveQuote.reset();
    setForm(
      quote === "new"
        ? emptyForm
        : { text: quote.text, author: quote.author, source: quote.source ?? "", is_active: quote.is_active }
    );
    setEditing(quote);
  };

  const closeForm = () => setEditing(null);

  const formValid = form.text.trim().length >= 5 && form.author.trim().length >= 2 && form.text.length <= TEXT_MAX;

  const submit = async () => {
    if (!editing || !formValid) return;
    try {
      await saveQuote.mutateAsync({
        id: editing === "new" ? null : editing.id,
        input: {
          text: form.text.trim(),
          author: form.author.trim(),
          source: form.source.trim() || null,
          is_active: form.is_active,
        },
      });
      closeForm();
    } catch {
      // Pesan dirender dari state mutation.
    }
  };

  return (
    <>
      <PageHeader
        title="Motivational quotes"
        description="Students see one active quote a day on their dashboard. Active quotes take turns, one per day."
        actions={
          <Button onClick={() => openForm("new")}>
            <Plus size={16} /> New quote
          </Button>
        }
      />
      <PageBody>
        <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          {today ? (
            <QuoteCardPreview text={today.text} author={today.author} source={today.source} label="On student dashboards today" />
          ) : (
            <div className="flex items-center rounded-xl border border-dashed border-slate-300 p-6 text-[14px] text-slate-500">
              No active quotes, so the quote card is hidden on student dashboards.
            </div>
          )}
          <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
            <StatCard label="All quotes" value={counts.all} />
            <StatCard label="Active" value={counts.active} hint="In the daily rotation" accent="#00a360" />
            <StatCard label="Hidden" value={counts.hidden} hint="Kept, but never shown" accent="#8a5200" />
          </div>
        </div>

        <TableCard
          title="All quotes"
          count={visible.length}
          toolbar={
            <>
              <FilterChips
                label="Filter by status"
                value={status}
                onChange={setStatus}
                options={[
                  { value: "all", label: "All", count: counts.all },
                  { value: "active", label: "Active", count: counts.active },
                  { value: "hidden", label: "Hidden", count: counts.hidden },
                ]}
              />
              <SearchInput value={search} onChange={setSearch} placeholder="Search quote or author" label="Search quotes" />
            </>
          }
        >
          {isLoading && (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-slate-500">
              <Loader2 size={16} className="animate-spin" /> Loading quotes…
            </p>
          )}
          {isError && (
            <div className="p-4">
              <ErrorNotice>Couldn&apos;t load quotes. Reload the page to try again.</ErrorNotice>
            </div>
          )}
          {quotes && visible.length === 0 && (
            <EmptyState
              icon={QuoteIcon}
              title={quotes.length === 0 ? "No quotes yet" : "No quotes match"}
              text={
                quotes.length === 0
                  ? "Add a short line that keeps students going. It appears on their dashboard."
                  : "Try another search or status filter."
              }
              action={
                quotes.length === 0 && (
                  <Button onClick={() => openForm("new")}>
                    <Plus size={16} /> New quote
                  </Button>
                )
              }
            />
          )}
          {visible.length > 0 && (
            <Table minWidth={760}>
              <THead>
                <Th>Quote</Th>
                <Th className="w-[180px]">Author</Th>
                <Th className="w-[150px]">Shown to students</Th>
                <Th className="w-[120px]">Updated</Th>
                <Th className="w-[88px]">
                  <span className="sr-only">Actions</span>
                </Th>
              </THead>
              <TBody>
                {visible.map((quote) => (
                  <Tr key={quote.id} onClick={() => openForm(quote)}>
                    <Td>
                      <p className="line-clamp-2 max-w-[62ch] text-slate-900">“{quote.text}”</p>
                      {quote.source && <p className="mt-0.5 truncate text-[12px] text-slate-500">{quote.source}</p>}
                    </Td>
                    <Td className="text-slate-700">{quote.author}</Td>
                    <Td>
                      <span className="flex items-center gap-2">
                        <Toggle
                          checked={quote.is_active}
                          label={`Show “${quote.text.slice(0, 30)}…” to students`}
                          disabled={toggleQuote.isPending}
                          onChange={(next) => toggleQuote.mutate({ id: quote.id, is_active: next })}
                        />
                        <Badge tone={quote.is_active ? "green" : "neutral"}>{quote.is_active ? "Active" : "Hidden"}</Badge>
                      </span>
                    </Td>
                    <Td className="tabular text-slate-500">{formatDate(quote.updatedAt)}</Td>
                    <Td>
                      <span className="flex justify-end gap-1">
                        <IconAction label={`Edit quote by ${quote.author}`} onClick={() => openForm(quote)}>
                          <Pencil size={15} />
                        </IconAction>
                        <IconAction label={`Delete quote by ${quote.author}`} tone="danger" onClick={() => setDeleting(quote)}>
                          <Trash2 size={15} />
                        </IconAction>
                      </span>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </TableCard>
      </PageBody>

      <Drawer
        open={editing !== null}
        onClose={closeForm}
        title={editing === "new" ? "New quote" : "Edit quote"}
        subtitle={editing && editing !== "new" ? `Added ${formatDate(editing.createdAt)}` : "Keep it short: one or two sentences read best."}
        footer={
          <>
            <Button variant="ghost" onClick={closeForm}>
              Cancel
            </Button>
            <Button onClick={submit} disabled={!formValid || saveQuote.isPending}>
              {saveQuote.isPending ? "Saving…" : "Save quote"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field
            label="Quote"
            htmlFor="quote-text"
            hint={`${form.text.length}/${TEXT_MAX} characters`}
            error={form.text.length > TEXT_MAX ? `Keep it under ${TEXT_MAX} characters.` : null}
          >
            <textarea
              id="quote-text"
              rows={4}
              value={form.text}
              onChange={(event) => setForm((prev) => ({ ...prev, text: event.target.value }))}
              className={textareaClass}
            />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Author" htmlFor="quote-author">
              <input
                id="quote-author"
                value={form.author}
                onChange={(event) => setForm((prev) => ({ ...prev, author: event.target.value }))}
                className={fieldClass}
              />
            </Field>
            <Field label="Source (optional)" htmlFor="quote-source" hint="Book, speech or year">
              <input
                id="quote-source"
                value={form.source}
                onChange={(event) => setForm((prev) => ({ ...prev, source: event.target.value }))}
                className={fieldClass}
              />
            </Field>
          </div>
          <label className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 px-4 py-3">
            <span>
              <span className="block text-[14px] font-medium text-slate-900">Show to students</span>
              <span className="block text-[13px] text-slate-500">Hidden quotes stay here but skip the daily rotation.</span>
            </span>
            <Toggle
              checked={form.is_active}
              label="Show to students"
              onChange={(next) => setForm((prev) => ({ ...prev, is_active: next }))}
            />
          </label>

          <div>
            <p className="mb-2 text-[13px] font-medium text-slate-700">Preview</p>
            <QuoteCardPreview text={form.text.trim()} author={form.author.trim()} source={form.source.trim() || null} />
          </div>

          {saveQuote.isError && <ErrorNotice>{readErrorMessage(saveQuote.error, "Couldn't save the quote.")}</ErrorNotice>}
        </div>
      </Drawer>

      <ConfirmDialog
        open={deleting !== null}
        title="Delete this quote?"
        message={
          <>
            “{deleting?.text}” by {deleting?.author} will be removed for good. To take it out of rotation but keep it, switch
            it to hidden instead.
          </>
        }
        pending={removeQuote.isPending}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (!deleting) return;
          await removeQuote.mutateAsync(deleting.id).catch(() => undefined);
          setDeleting(null);
        }}
      />
    </>
  );
}
