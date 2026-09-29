import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, createSubmission } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const submissions = await getAllSubmissions();
    return NextResponse.json(submissions);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await createSubmission(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
