import { NextResponse } from 'next/server';

const LEGISLATION_API_BASE = process.env.LEGISLATION_API_BASE_URL ?? 'http://localhost:8001/legislation-api';
const LEGISLATION_API_KEY = process.env.LEGISLATION_API_KEY ?? '';

const API_HEADERS = {
  'X-API-Key': LEGISLATION_API_KEY,
};

interface LegislationBill {
  id: string;
  identifier?: string;
  title?: string;
  latestActionAt?: string | null;
  latestActionDescription?: string | null;
  geminiSummary?: string | null;
}

interface LegislationResponse {
  results: LegislationBill[];
}

async function fetchBillsForState(abbr: string, topic: string): Promise<LegislationBill[]> {
  const url = (params: URLSearchParams) =>
    `${LEGISLATION_API_BASE}/api/legislation?${params.toString()}`;

  // Run title-search and subject-search in parallel to replicate the original $or logic
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

  // Merge, deduplicate by id, sort by latestActionAt desc, take top 8
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const statesParam = searchParams.get('states');

    if (!topic || !statesParam) {
      return NextResponse.json({ message: 'Missing required params: topic, states' }, { status: 400 });
    }

    const stateAbbrs = statesParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);

    const results: Record<string, LegislationBill[]> = {};

    await Promise.all(
      stateAbbrs.map(async (abbr) => {
        results[abbr] = await fetchBillsForState(abbr, topic);
      })
    );

    return NextResponse.json({ topic, states: stateAbbrs, results }, { status: 200 });
  } catch (error) {
    console.error('Error in comparison API:', error);
    return NextResponse.json({ message: 'Error fetching comparison data' }, { status: 500 });
  }
}
