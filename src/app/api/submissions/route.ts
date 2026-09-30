import { NextRequest, NextResponse } from 'next/server';
import { getAllSubmissions, createSubmission } from '@/lib/db';
import { dispatchGrievanceSMS } from '@/lib/sms';

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

    let smsResult = null;
    // Trigger SMS dispatch if phone number is provided
    const phone = created.citizenConsent?.contactValue;
    if (phone && phone.trim().length >= 8) {
      smsResult = await dispatchGrievanceSMS({
        to: phone,
        referenceCode: created.referenceCode,
        category: created.category,
        subcategory: created.subcategory,
        district: created.location.district,
        urgency: created.urgency,
        country: created.location.country,
      });
    }

    return NextResponse.json({
      ...created,
      smsDispatch: smsResult,
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


