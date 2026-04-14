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
  statusText?: string | null;
  session?: string;
}

function buildPrompt(bill: Bill): string {
  const sponsors = (bill.sponsors ?? [])
    .filter((s) => s.primary)
    .map((s) => s.name)
    .join(', ') || 'Unknown';

  const subjects = (bill.subjects ?? []).join(', ') || 'None listed';

  const recentHistory = (bill.history ?? [])
    .slice(-6)
    .map((h) => `${h.date}: ${h.description}`)
    .join('\n');

  // Trim full text to avoid token bloat — first 4 000 chars is usually enough
  const textSnippet = bill.fullText
    ? bill.fullText.replace(/\s+/g, ' ').trim().slice(0, 4000)
    : 'Full text not available.';

  return `You are a nonpartisan legislative analyst. Summarize the following bill with clear, plain-language key takeaways for a general audience.

BILL: ${bill.identifier ?? ''} — ${bill.title ?? 'Untitled'}
STATE: ${bill.jurisdictionName ?? 'Unknown'}
SESSION: ${bill.session ?? ''}
PRIMARY SPONSORS: ${sponsors}
SUBJECTS: ${subjects}
LATEST ACTION: ${bill.latestActionDescription ?? ''} (${bill.latestActionAt ? new Date(bill.latestActionAt).toLocaleDateString() : ''})

RECENT LEGISLATIVE HISTORY:
${recentHistory}

BILL TEXT (excerpt):
${textSnippet}

Respond with a concise summary structured as:
1. **What this bill does** (1-2 sentences)
2. **Key provisions** (3-5 bullet points)
3. **Current status** (1 sentence)
4. **Potential impact** (1-2 sentences)

Be factual, neutral, and accessible. Do not include political commentary.`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const billId = searchParams.get('bill_id');

  if (!billId) {
    return NextResponse.json({ message: 'Missing required param: bill_id' }, { status: 400 });
  }

  // Fetch the full bill from the legislation backend
  const billRes = await fetch(
    `${LEGISLATION_API_BASE}/api/legislation/${encodeURIComponent(billId)}`,
    { headers: { 'X-API-Key': LEGISLATION_API_KEY } }
  );

  if (!billRes.ok) {
    return NextResponse.json(
      { message: `Failed to fetch bill: ${billRes.status}` },
      { status: billRes.status }
    );
  }

  const bill: Bill = await billRes.json();
  const prompt = buildPrompt(bill);

  // Stream Claude's response back to the client
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claudeStream = anthropic.messages.stream({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
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
        controller.enqueue(encoder.encode('\n\n[Error generating summary]'));
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
