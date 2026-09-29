import { NextRequest, NextResponse } from 'next/server';
import { getAllScenarios, savePolicyScenario } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const scenarios = await getAllScenarios();
    return NextResponse.json(scenarios);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const created = await savePolicyScenario(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
