import { NextRequest, NextResponse } from 'next/server';
import { getAllClusters, createOrMergeCluster } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const clusters = await getAllClusters();
    return NextResponse.json(clusters);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cluster = await createOrMergeCluster(body);
    return NextResponse.json(cluster, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
