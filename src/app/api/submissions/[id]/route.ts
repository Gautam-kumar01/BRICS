import { NextRequest, NextResponse } from 'next/server';
import { getSubmissionByReference, updateSubmissionStatus, addCitizenFeedback } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const sub = await getSubmissionByReference(resolvedParams.id);
    if (!sub) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    return NextResponse.json(sub);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const body = await req.json();
    const { status, assignedDepartment, clusterId, resolutionNotes, actor } = body;

    const updated = await updateSubmissionStatus(resolvedParams.id, status, assignedDepartment, clusterId, resolutionNotes, actor);
    if (!updated) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> | { id: string } }) {
  // Citizen closure feedback rating
  try {
    const resolvedParams = await Promise.resolve(params);
    const body = await req.json();
    const { rating, comment } = body;

    const updated = await addCitizenFeedback(resolvedParams.id, rating, comment);
    if (!updated) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

