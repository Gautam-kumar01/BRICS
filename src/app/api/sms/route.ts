import { NextRequest, NextResponse } from 'next/server';
import { dispatchGrievanceSMS } from '@/lib/sms';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, referenceCode, category, subcategory, district, urgency } = body;

    if (!to || !referenceCode) {
      return NextResponse.json(
        { error: 'Missing required parameters (to, referenceCode)' },
        { status: 400 }
      );
    }

    const result = await dispatchGrievanceSMS({
      to,
      referenceCode,
      category: category || 'infrastructure',
      subcategory: subcategory || 'Public Infrastructure Grievance',
      district: district || 'District Jurisdiction',
      urgency: urgency || 'high',
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
