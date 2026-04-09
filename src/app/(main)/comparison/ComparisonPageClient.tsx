"use client";

import { useState, useRef, useEffect } from "react";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { STATE_NAMES } from "@/types/geo";

const POLICY_AREAS = [
  "Solar Energy",
  "Wind Energy",
  "Hydropower",
  "Data Centers",
  "Renewable Energy",
  "Oil and Gas",
  "Coal Mining",
];
const AVAILABLE_STATES = ["TX", "PA", "WV", "WY", "LA"];
const DEFAULT_STATES = AVAILABLE_STATES;

interface BillResult {
  id: string;
  identifier?: string;
  title?: string;
  statusText?: string | null;
  latestActionAt?: string | null;
  latestActionDescription?: string | null;
  geminiSummary?: string | null;
  matchedContent?: string | null;
  similarity?: number | null;
}

interface DrawerBill extends BillResult {
  state: string;
}

// ── Bill summary drawer ───────────────────────────────────────────────────────

function BillDrawer({ bill, onClose }: { bill: DrawerBill; onClose: () => void }) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setSummary("");
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    abortRef.current = controller;

    (async () => {
      try {
        const res = await fetch(
          `/api/comparison/bill-summary?bill_id=${encodeURIComponent(bill.id)}`,
          { signal: controller.signal }
        );
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        if (!res.body) throw new Error("No response body");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          setSummary((prev) => prev + decoder.decode(value, { stream: true }));
        }
      } catch (err: any) {
        if (err.name !== "AbortError") setError(err.message ?? "Failed to generate summary");
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [bill.id]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} aria-hidden="true" />
      <aside className="fixed right-0 top-0 h-full w-full max-w-lg bg-background shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b">
          <div className="min-w-0">
            {bill.identifier && (
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {STATE_NAMES[bill.state] ?? bill.state} · {bill.identifier}
              </span>
            )}
            <h2 className="text-base font-semibold leading-snug mt-0.5 line-clamp-3">
              {bill.title || "Untitled Bill"}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 mt-0.5 rounded-md p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 2l12 12M14 2L2 14" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Meta */}
        <div className="px-6 py-3 border-b flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
          {bill.latestActionAt && (
            <span>Last action: <span className="text-foreground">{new Date(bill.latestActionAt).toLocaleDateString()}</span></span>
          )}
          {bill.latestActionDescription && (
            <span className="truncate max-w-xs">{bill.latestActionDescription}</span>
          )}
          {bill.similarity != null && (
            <span>Relevance: <span className="text-foreground">{Math.round(bill.similarity * 100)}%</span></span>
          )}
        </div>

        {/* AI Summary */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              AI-Generated Key Takeaways
            </span>
            {loading && (
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="inline-block w-1 h-1 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
            )}
          </div>

          {error ? (
            <p className="text-destructive text-sm">{error}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed whitespace-pre-wrap">
              {summary || (loading ? "" : "No summary available.")}
              {loading && !summary && (
                <span className="inline-block w-2 h-4 bg-primary/40 animate-pulse rounded-sm ml-0.5" />
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t text-xs text-muted-foreground">
          Summary generated by Claude · Content reflects bill text only
        </div>
      </aside>
    </>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

type SearchMode = "topic" | "keyword";

export default function ComparisonPageClient() {
  const [searchMode, setSearchMode] = useState<SearchMode>("topic");
  const [selectedTopic, setSelectedTopic] = useState("Solar Energy");
  const [keyword, setKeyword] = useState("");
  const [selectedStates, setSelectedStates] = useState<string[]>(DEFAULT_STATES);
  const [results, setResults] = useState<Record<string, BillResult[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ranQuery, setRanQuery] = useState<string>("");
  const [ranMode, setRanMode] = useState<SearchMode>("topic");
  const [ranStates, setRanStates] = useState<string[]>([]);
  const [activeBill, setActiveBill] = useState<DrawerBill | null>(null);

  function toggleState(abbr: string) {
    setSelectedStates((prev) =>
      prev.includes(abbr) ? prev.filter((s) => s !== abbr) : [...prev, abbr]
    );
  }

  async function handleCompare() {
    if (selectedStates.length === 0) return;
    if (searchMode === "keyword" && !keyword.trim()) return;

    setLoading(true);
    setError(null);
    setResults(null);
    setActiveBill(null);

    try {
      const params = new URLSearchParams({ states: selectedStates.join(",") });
      if (searchMode === "keyword") {
        params.set("keyword", keyword.trim());
      } else {
        params.set("topic", selectedTopic);
      }

      const res = await fetch(`/api/comparison?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch comparison data");
      const data = await res.json();
      setResults(data.results);
      setRanQuery(searchMode === "keyword" ? keyword.trim() : selectedTopic);
      setRanMode(searchMode);
      setRanStates(selectedStates);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  const canCompare =
    selectedStates.length > 0 &&
    (searchMode === "topic" || keyword.trim().length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Policy Comparison Tool</h1>
        <p className="text-muted-foreground mt-1">
          Compare legislation across jurisdictions on a selected policy topic or keyword.
        </p>
      </div>

      {/* Controls card */}
      <div className="bg-card border rounded-lg p-5 space-y-5">

        {/* Mode toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-md w-fit">
          {(["topic", "keyword"] as SearchMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setSearchMode(mode)}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                searchMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "topic" ? "Browse by Topic" : "Keyword Search"}
            </button>
          ))}
        </div>

        {/* Search input — topic or keyword */}
        {searchMode === "topic" ? (
          <div>
            <label className="block text-sm font-medium mb-1.5">Policy Topic</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="border rounded-md px-3 py-2 text-sm bg-background w-full max-w-xs"
            >
              {POLICY_AREAS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium mb-1.5">Keyword</label>
            <div className="relative max-w-sm">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none"
                viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && canCompare && !loading) handleCompare(); }}
                placeholder="e.g. net metering, carbon capture, fracking…"
                className="border rounded-md pl-9 pr-3 py-2 text-sm bg-background w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5">
              Uses semantic search to find bills whose text matches your query.
            </p>
          </div>
        )}

        {/* States */}
        <div>
          <label className="block text-sm font-medium mb-1.5">States</label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_STATES.map((abbr) => {
              const checked = selectedStates.includes(abbr);
              return (
                <label key={abbr} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleState(abbr)}
                    className="accent-primary"
                  />
                  <span>{abbr} – {STATE_NAMES[abbr]}</span>
                </label>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || !canCompare}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}
      {loading && <LoadingOverlay text="Fetching legislation across states…" />}

      {/* Results */}
      {results && !loading && (
        <div>
          <h2 className="text-lg font-semibold mb-1">
            Results:{" "}
            <span className="text-primary">
              {ranMode === "keyword" ? `"${ranQuery}"` : ranQuery}
            </span>{" "}
            across {ranStates.join(", ")}
            {ranMode === "keyword" && (
              <span className="ml-2 text-xs font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                semantic search
              </span>
            )}
          </h2>
          <p className="text-xs text-muted-foreground mb-3">
            Click any bill to generate an AI summary of its key takeaways.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {ranStates.map((abbr) => (
                    <th key={abbr} className="border bg-muted px-3 py-2 text-left font-semibold min-w-[220px]">
                      {STATE_NAMES[abbr] || abbr}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr className="align-top">
                  {ranStates.map((abbr) => {
                    const bills = results[abbr] ?? [];
                    return (
                      <td key={abbr} className="border px-3 py-2 align-top">
                        {bills.length === 0 ? (
                          <p className="text-muted-foreground italic text-xs">No results found.</p>
                        ) : (
                          <ul className="space-y-3">
                            {bills.map((bill) => (
                              <li key={bill.id} className="border-b last:border-b-0 pb-3 last:pb-0">
                                <button
                                  onClick={() => setActiveBill({ ...bill, state: abbr })}
                                  className="text-left w-full group"
                                >
                                  <span className="font-medium text-primary group-hover:underline block leading-snug">
                                    {bill.identifier && (
                                      <span className="text-xs text-muted-foreground mr-1">{bill.identifier}</span>
                                    )}
                                    {bill.title || "Untitled"}
                                  </span>

                                  {/* Date — topic mode */}
                                  {bill.latestActionAt && (
                                    <span className="text-xs text-muted-foreground block mt-0.5">
                                      {new Date(bill.latestActionAt).toLocaleDateString()}
                                    </span>
                                  )}

                                  {/* Matched snippet — keyword mode */}
                                  {bill.matchedContent && (
                                    <span className="text-xs text-muted-foreground block mt-1 line-clamp-2 italic">
                                      "…{bill.matchedContent.trim()}…"
                                    </span>
                                  )}

                                  {/* Relevance badge — keyword mode */}
                                  {bill.similarity != null && (
                                    <span className="inline-block mt-1 text-xs text-primary/70 bg-primary/8 px-1.5 py-0.5 rounded">
                                      {Math.round(bill.similarity * 100)}% match
                                    </span>
                                  )}

                                  <span className="text-xs text-primary/70 mt-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M8 1h5a1 1 0 011 1v5M6 10l6-6M3 5H2a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                    View AI summary
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeBill && (
        <BillDrawer bill={activeBill} onClose={() => setActiveBill(null)} />
      )}
    </div>
  );
}
