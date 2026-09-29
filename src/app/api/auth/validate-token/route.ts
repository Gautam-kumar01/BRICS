import { NextRequest, NextResponse } from 'next/server';
import { getUserByInviteToken } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Activation token is missing.' }, { status: 400 });
    }

    const user = await getUserByInviteToken(token);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token. Please contact the Central Administrator (gautamkr192007@gmail.com) for a new invitation.' },
        { status: 404 }
      );
    }

    // Return safe preview for the setup password page
    return NextResponse.json({
      valid: true,
      name: user.name,
      email: user.email,
      role: user.role,
      agency: user.agency,
      assignedCountry: user.assignedCountry,
      assignedDistrict: user.assignedDistrict,
      assignedDepartment: user.assignedDepartment,
      invitedBy: user.invitedBy
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
