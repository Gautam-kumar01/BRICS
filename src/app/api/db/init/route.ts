import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabaseSchema, isNeonConnected } from '@/lib/db';

export async function GET() {
  const result = await initializeDatabaseSchema();
  return NextResponse.json({
    ...result,
    isNeonConnected: isNeonConnected(),
    databaseUrlPresent: !!process.env.DATABASE_URL,
  });
}

export async function POST() {
  const result = await initializeDatabaseSchema();
  return NextResponse.json(result);
}
