import { NextRequest, NextResponse } from 'next/server';
import { getAllRecommendations, updateRecommendationStatus } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const recs = await getAllRecommendations();
    return NextResponse.json(recs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, approvedStatus, rationale, officerName } = body;

    const updated = await updateRecommendationStatus(id, approvedStatus, rationale, officerName);
    if (!updated) return NextResponse.json({ error: 'Recommendation not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
