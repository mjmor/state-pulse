import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';

const LEGISLATION_API_BASE =
  process.env.LEGISLATION_API_BASE_URL ?? 'http://localhost:8001/legislation-api';
const LEGISLATION_API_KEY = process.env.LEGISLATION_API_KEY ?? '';

const anthropic = new Anthropic();

interface HistoryEntry {
  date: string;
  description: string;
  classification?: string[];
  organization?: string;
}

interface Sponsor {
  name: string;
  classification: string;
  primary: boolean;
}

interface Bill {
  id: string;
  identifier?: string;
  title?: string;
  jurisdictionName?: string;
  subjects?: string[];
  sponsors?: Sponsor[];
  history?: HistoryEntry[];
  fullText?: string | null;
  latestActionAt?: string | null;
  latestActionDescription?: string | null;
  session?: string;
}

function buildBillSection(bill: Bill): string {
  const sponsors = (bill.sponsors ?? [])
    .filter((s) => s.primary)
    .map((s) => s.name)
    .join(', ') || 'Unknown';

  const subjects = (bill.subjects ?? []).join(', ') || 'None listed';

  const recentHistory = (bill.history ?? [])
    .slice(-6)
    .map((h) => `${h.date}: ${h.description}`)
    .join('\n');

  const textSnippet = bill.fullText
    ? bill.fullText.replace(/\s+/g, ' ').trim().slice(0, 4000)
    : 'Full text not available.';

  return `--- ${bill.jurisdictionName ?? 'Unknown'}: ${bill.identifier ?? ''} —  ${bill.title ?? 'Untitled'} ---
PRIMARY SPONSORS: ${sponsors}
SUBJECTS: ${subjects}
LATEST ACTION: ${bill.latestActionDescription ?? ''} (${bill.latestActionAt ? new Date(bill.latestActionAt).toLocaleDateString() : ''})
RECENT LEGISLATIVE HISTORY:
${recentHistory}
BILL TEXT (excerpt):
${textSnippet}`;
}

function buildPrompt(bills: Bill[]): string {
  const billSections = bills.map(buildBillSection).join('\n\n');

  return `You are a nonpartisan legislative analyst. Compare the following ${bills.length} bills from different states.

For each bill, provide a structured analysis using these exact headings:
1. **What this bill does** (1-2 sentences)
2. **Key provisions** (3-5 bullet points)
3. **Current status** (1 sentence)
4. **Potential impact** (1-2 sentences)

After analyzing each bill individually, add a **Cross-State Comparison** section that covers:
- Key similarities across the bills
- Notable differences in approach or scope
- Which state(s) take the most or least aggressive stance

Be factual, neutral, and accessible. Do not include political commentary.

BILLS TO COMPARE:

${billSections}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const billIdsParam = searchParams.get('bill_ids');

  if (!billIdsParam) {
    return NextResponse.json({ message: 'Missing required param: bill_ids' }, { status: 400 });
  }

  const billIds = billIdsParam.split(',').map((id) => id.trim()).filter(Boolean);

  if (billIds.length < 2) {
    return NextResponse.json({ message: 'At least 2 bill IDs are required' }, { status: 400 });
  }

  if (billIds.length > 6) {
    return NextResponse.json({ message: 'Maximum 6 bills allowed' }, { status: 400 });
  }

  const billResults = await Promise.all(
    billIds.map(async (id) => {
      const res = await fetch(
        `${LEGISLATION_API_BASE}/api/legislation/${encodeURIComponent(id)}`,
        { headers: { 'X-API-Key': LEGISLATION_API_KEY } }
      );
      if (!res.ok) throw new Error(`Failed to fetch bill ${id}: ${res.status}`);
      return res.json() as Promise<Bill>;
    })
  );

  const prompt = buildPrompt(billResults);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 2048,
          messages: [{ role: 'user', content: prompt }],
        });

        for await (const chunk of claudeStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (err) {
        console.error('Claude streaming error:', err);
        controller.enqueue(encoder.encode('\n\n[Error generating comparison]'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Transfer-Encoding': 'chunked',
      'Cache-Control': 'no-cache',
    },
  });
}
