import { NextResponse } from 'next/server';

const LEGISLATION_API_BASE = process.env.LEGISLATION_API_BASE_URL ?? 'http://localhost:8001/legislation-api';
const LEGISLATION_API_KEY = process.env.LEGISLATION_API_KEY ?? '';

const API_HEADERS = {
  'X-API-Key': LEGISLATION_API_KEY,
};

export interface LegislationBill {
  id: string;
  identifier?: string;
  title?: string;
  latestActionAt?: string | null;
  latestActionDescription?: string | null;
  geminiSummary?: string | null;
  /** Populated only for keyword-search results — the matching text snippet. */
  matchedContent?: string | null;
  /** Cosine similarity score from semantic search (0–1). */
  similarity?: number | null;
}

interface LegislationResponse {
  results: LegislationBill[];
}

interface SemanticSearchResult {
  bill_id: string;
  title: string;
  jurisdiction_id: string;
  jurisdiction_name: string;
  classification: string[];
  session: string;
  matched_content: string;
  similarity: number;
}

interface SemanticSearchResponse {
  query: string;
  jurisdiction: string | null;
  total: number;
  results: SemanticSearchResult[];
}

// ── Topic-based search (title + subject, merged & deduped) ────────────────────

async function fetchBillsByTopic(abbr: string, topic: string): Promise<LegislationBill[]> {
  const url = (params: URLSearchParams) =>
    `${LEGISLATION_API_BASE}/api/legislation?${params.toString()}`;

  const [titleRes, subjectRes] = await Promise.all([
    fetch(url(new URLSearchParams({ jurisdiction: abbr, q: topic, limit: '8' })), {
      headers: API_HEADERS,
    }),
    fetch(url(new URLSearchParams({ jurisdiction: abbr, subject: topic, limit: '8' })), {
      headers: API_HEADERS,
    }),
  ]);

  const [titleData, subjectData]: [LegislationResponse, LegislationResponse] = await Promise.all([
    titleRes.ok ? titleRes.json() : Promise.resolve({ results: [] }),
    subjectRes.ok ? subjectRes.json() : Promise.resolve({ results: [] }),
  ]);

  const seen = new Set<string>();
  const merged: LegislationBill[] = [];
  for (const bill of [...(titleData.results ?? []), ...(subjectData.results ?? [])]) {
    if (!seen.has(bill.id)) {
      seen.add(bill.id);
      merged.push(bill);
    }
  }

  merged.sort((a, b) => {
    const ta = a.latestActionAt ? new Date(a.latestActionAt).getTime() : 0;
    const tb = b.latestActionAt ? new Date(b.latestActionAt).getTime() : 0;
    return tb - ta;
  });

  return merged.slice(0, 8);
}

// ── Keyword semantic search ───────────────────────────────────────────────────

async function fetchBillsByKeyword(abbr: string, keyword: string): Promise<LegislationBill[]> {
  const params = new URLSearchParams({ q: keyword, jurisdiction: abbr, limit: '8' });
  const res = await fetch(
    `${LEGISLATION_API_BASE}/api/legislation/search?${params.toString()}`,
    { headers: API_HEADERS }
  );

  if (!res.ok) return [];

  const data: SemanticSearchResponse = await res.json();

  return (data.results ?? []).map((r) => ({
    id: r.bill_id,
    title: r.title,
    matchedContent: r.matched_content,
    similarity: r.similarity,
  }));
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const keyword = searchParams.get('keyword');
    const statesParam = searchParams.get('states');

    if ((!topic && !keyword) || !statesParam) {
      return NextResponse.json(
        { message: 'Missing required params: (topic or keyword), states' },
        { status: 400 }
      );
    }

    const stateAbbrs = statesParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    const results: Record<string, LegislationBill[]> = {};

    await Promise.all(
      stateAbbrs.map(async (abbr) => {
        results[abbr] = keyword
          ? await fetchBillsByKeyword(abbr, keyword)
          : await fetchBillsByTopic(abbr, topic!);
      })
    );

    return NextResponse.json(
      { topic: keyword ?? topic, keyword: keyword ?? null, states: stateAbbrs, results },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in comparison API:', error);
    return NextResponse.json({ message: 'Error fetching comparison data' }, { status: 500 });
  }
}
