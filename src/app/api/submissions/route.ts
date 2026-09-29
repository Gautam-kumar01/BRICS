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

    // Trigger SMS dispatch if phone number is provided
    const phone = created.citizenConsent?.contactValue;
    if (phone && phone.trim().length >= 8) {
      // Fire SMS dispatch asynchronously
      dispatchGrievanceSMS({
        to: phone,
        referenceCode: created.referenceCode,
        category: created.category,
        subcategory: created.subcategory,
        district: created.location.district,
        urgency: created.urgency,
      }).catch((err) => console.warn('Background SMS Dispatch Warning:', err));
    }

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

