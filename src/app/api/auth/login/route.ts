import { NextRequest, NextResponse } from 'next/server';
import { validateUserCredentials } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required for official government sign-in.' },
        { status: 400 }
      );
    }

    const result = await validateUserCredentials(email, password);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: result.status });
    }

    // Return authenticated user profile (omit passwordHash)
    const safeUser = { ...result.user };
    delete safeUser.passwordHash;

    return NextResponse.json({
      success: true,
      user: safeUser,
      message: `Welcome ${safeUser.name}, authenticated as ${safeUser.role}.`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
