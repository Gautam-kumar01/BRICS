import { NextRequest, NextResponse } from 'next/server';
import { executeResilientAIExtraction } from '@/lib/ai/ai-gateway';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, language = 'en', customConfig } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text content is required for AI extraction' }, { status: 400 });
    }

    const result = await executeResilientAIExtraction(text, language, customConfig);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('API AI Extract Error:', error);
    return NextResponse.json({ error: error.message || 'AI extraction failed' }, { status: 500 });
  }
}
