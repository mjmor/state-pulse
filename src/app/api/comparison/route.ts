import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';
import { STATE_NAMES } from '@/types/geo';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const topic = searchParams.get('topic');
    const statesParam = searchParams.get('states');

    if (!topic || !statesParam) {
      return NextResponse.json({ message: 'Missing required params: topic, states' }, { status: 400 });
    }

    const stateAbbrs = statesParam.split(',').map((s) => s.trim().toUpperCase()).filter(Boolean);
    const collection = await getCollection('legislation');

    const results: Record<string, any[]> = {};

    await Promise.all(
      stateAbbrs.map(async (abbr) => {
        const jurisdictionName = STATE_NAMES[abbr];
        if (!jurisdictionName) return;

        const docs = await collection
          .find({
            jurisdictionName,
            $or: [
              { 'topicClassification.broadTopics': topic },
              { subjects: { $regex: topic, $options: 'i' } },
              { title: { $regex: topic, $options: 'i' } },
            ],
          })
          .sort({ latestActionAt: -1 })
          .limit(8)
          .project({
            id: 1,
            identifier: 1,
            title: 1,
            statusText: 1,
            latestActionAt: 1,
            latestActionDescription: 1,
            geminiSummary: 1,
            jurisdictionName: 1,
          })
          .toArray();

        results[abbr] = docs.map((doc) => ({
          ...doc,
          id: doc.id || doc._id?.toString(),
        }));
      })
    );

    return NextResponse.json({ topic, states: stateAbbrs, results }, { status: 200 });
  } catch (error) {
    console.error('Error in comparison API:', error);
    return NextResponse.json({ message: 'Error fetching comparison data' }, { status: 500 });
  }
}
