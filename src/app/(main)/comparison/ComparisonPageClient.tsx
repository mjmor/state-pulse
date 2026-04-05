"use client";

import { useState } from "react";
import Link from "next/link";
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
}

export default function ComparisonPageClient() {
  const [selectedTopic, setSelectedTopic] = useState("Solar Energy");
  const [selectedStates, setSelectedStates] = useState<string[]>(DEFAULT_STATES);
  const [results, setResults] = useState<Record<string, BillResult[]> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ranTopic, setRanTopic] = useState<string>("");
  const [ranStates, setRanStates] = useState<string[]>([]);

  function toggleState(abbr: string) {
    setSelectedStates((prev) =>
      prev.includes(abbr) ? prev.filter((s) => s !== abbr) : [...prev, abbr]
    );
  }

  async function handleCompare() {
    if (selectedStates.length === 0) return;
    setLoading(true);
    setError(null);
    setResults(null);
    try {
      const res = await fetch(
        `/api/comparison?topic=${encodeURIComponent(selectedTopic)}&states=${selectedStates.join(",")}`
      );
      if (!res.ok) throw new Error("Failed to fetch comparison data");
      const data = await res.json();
      setResults(data.results);
      setRanTopic(selectedTopic);
      setRanStates(selectedStates);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-headline">Policy Comparison Tool</h1>
        <p className="text-muted-foreground mt-1">
          Compare legislation across jurisdictions on a selected policy topic.
        </p>
      </div>

      {/* Controls */}
      <div className="bg-card border rounded-lg p-5 space-y-5">
        {/* Topic */}
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

        {/* States */}
        <div>
          <label className="block text-sm font-medium mb-1.5">States</label>
          <div className="flex flex-wrap gap-3">
            {AVAILABLE_STATES.map((abbr) => {
              const name = STATE_NAMES[abbr];
              const checked = selectedStates.includes(abbr);
              return (
                <label key={abbr} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleState(abbr)}
                    className="accent-primary"
                  />
                  <span>{abbr} – {name}</span>
                </label>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleCompare}
          disabled={loading || selectedStates.length === 0}
          className="bg-primary text-primary-foreground px-5 py-2 rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <p className="text-destructive text-sm">{error}</p>
      )}

      {/* Loading */}
      {loading && <LoadingOverlay text="Fetching legislation across states…" />}

      {/* Results */}
      {results && !loading && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Results: <span className="text-primary">{ranTopic}</span> across {ranStates.join(", ")}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr>
                  {ranStates.map((abbr) => (
                    <th
                      key={abbr}
                      className="border bg-muted px-3 py-2 text-left font-semibold min-w-[220px]"
                    >
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
                                <Link
                                  href={`/legislation/${bill.id}`}
                                  className="font-medium text-primary hover:underline block leading-snug"
                                >
                                  {bill.identifier && (
                                    <span className="text-xs text-muted-foreground mr-1">{bill.identifier}</span>
                                  )}
                                  {bill.title || "Untitled"}
                                </Link>
                                {bill.statusText && (
                                  <p className="text-xs text-muted-foreground mt-0.5">{bill.statusText}</p>
                                )}
                                {bill.latestActionAt && (
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(bill.latestActionAt).toLocaleDateString()}
                                  </p>
                                )}
                                {bill.geminiSummary && (
                                  <p className="text-xs mt-1 text-foreground/80 line-clamp-3">
                                    {bill.geminiSummary.slice(0, 180)}
                                    {bill.geminiSummary.length > 180 ? "…" : ""}
                                  </p>
                                )}
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
    </div>
  );
}
