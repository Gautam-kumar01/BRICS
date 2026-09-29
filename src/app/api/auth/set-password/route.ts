import { NextRequest, NextResponse } from 'next/server';
import { setPasswordWithToken } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json({ error: 'Token and new password are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const updatedUser = await setPasswordWithToken(token, password);

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation token. Please request a fresh invitation link from your Central Administrator.' },
        { status: 400 }
      );
    }

    const safeUser = { ...updatedUser };
    delete safeUser.passwordHash;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Password successfully set for ${safeUser.name}. You can now sign in to your official workspace.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
