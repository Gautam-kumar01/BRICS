import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, createUser, updateUserRoleAndTerritory, getUserById, inviteOfficial } from '@/lib/db';
import { UserProfile } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const users = await getAllUsers();
    // Return safe users (omit passwordHash for security)
    const safeUsers = users.map(u => {
      const copy = { ...u };
      delete copy.passwordHash;
      return copy;
    });
    return NextResponse.json(safeUsers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    // 1. Super Admin Official Invitation Flow
    if (action === 'invite_official') {
      const { 
        name, 
        email, 
        role, 
        agency, 
        assignedCountry, 
        assignedDistrict, 
        assignedPincodes, 
        assignedDepartment, 
        stateOrProvince,
        allocatedBudgetUsd,
        badge,
        invitedBy 
      } = body;

      if (!email || !name || !role) {
        return NextResponse.json(
          { error: 'Name, email, and role are mandatory for official provisioning.' },
          { status: 400 }
        );
      }

      const result = await inviteOfficial(
        {
          name,
          email,
          role,
          agency: agency || `Office of the ${role.replace('_', ' ').toUpperCase()}`,
          assignedCountry: assignedCountry || 'India',
          stateOrProvince: stateOrProvince || 'Bihar',
          assignedDistrict: assignedDistrict || undefined,
          assignedPincodes: assignedPincodes || (body.pincode ? [body.pincode] : undefined),
          assignedDepartment: assignedDepartment || undefined,
          allocatedBudgetUsd: allocatedBudgetUsd ? Number(allocatedBudgetUsd) : 1500000,
          badge: badge || `${assignedDistrict || 'Municipal'} Authority`
        },
        invitedBy || 'gautamkr192007@gmail.com'
      );

      // If RESEND_API_KEY is configured, send real email via Resend
      let emailSent = false;
      const resendApiKey = process.env.RESEND_API_KEY;
      if (resendApiKey && email) {
        try {
          const origin = req.nextUrl.origin || 'http://localhost:3000';
          const fullActivationUrl = `${origin}${result.activationUrl}`;
          const resendRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              from: 'Central Governance Cell <onboarding@resend.dev>',
              to: [email],
              subject: `[OFFICIAL] BRICS CivicPulse Governance Workspace Activation — ${name}`,
              html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #fed7aa; border-radius: 12px; background-color: #fffaf5;">
                  <h2 style="color: #ea580c; margin-top: 0;">BRICS CivicPulse Sovereign GovTech Platform</h2>
                  <p>Dear <strong>${name}</strong>,</p>
                  <p>You have been formally provisioned on the <strong>BRICS CivicPulse Sovereign Governance & Infrastructure Platform</strong> by Super Administrator Gautam Kumar.</p>
                  <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb; font-family: monospace; font-size: 13px; margin: 15px 0;">
                    <div><strong>Assigned Role:</strong> ${role.toUpperCase()}</div>
                    <div><strong>Jurisdiction Territory:</strong> ${assignedDistrict || 'Omniscient: All BRICS Pilot Districts'}</div>
                    <div><strong>Agency:</strong> ${agency || 'District Administrative Council'}</div>
                    <div><strong>Allocated Budget:</strong> $${(allocatedBudgetUsd || 1500000).toLocaleString()} USD</div>
                    <div><strong>Activation Token:</strong> <span style="color: #ea580c; font-weight: bold;">${result.inviteToken}</span></div>
                  </div>
                  <p>Please click the button below to generate your official password and access your district-scoped grievance triage and policy planning dashboards:</p>
                  <div style="margin: 25px 0; text-align: center;">
                    <a href="${fullActivationUrl}" style="background-color: #ea580c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Activate Official Account & Set Password</a>
                  </div>
                  <p style="font-size: 12px; color: #6b7280;">This activation link is valid for 48 hours. If you did not expect this invitation, please contact central governance oversight.</p>
                </div>
              `
            })
          });
          if (resendRes.ok) {
            emailSent = true;
          }
        } catch (emailErr) {
          console.error('Failed to send email via Resend:', emailErr);
        }
      }

      const safeUser = { ...result.user };
      delete safeUser.passwordHash;

      return NextResponse.json({
        success: true,
        user: safeUser,
        inviteToken: result.inviteToken,
        activationUrl: result.activationUrl,
        emailSent,
        message: emailSent 
          ? `Official invitation email dispatched to ${email}. Account activation link generated.`
          : `Official invitation generated for ${name} (${email}). Activation link dispatched.`
      }, { status: 201 });
    }

    // 2. Update Role & Scope
    if (action === 'update_role') {
      const { id, role, assignedDistrict, assignedPincodes, assignedDepartment, allocatedBudgetUsd, isActive, name, actor } = body;
      const updated = await updateUserRoleAndTerritory(id, {
        role,
        assignedDistrict,
        assignedPincodes,
        assignedDepartment,
        allocatedBudgetUsd: allocatedBudgetUsd ? Number(allocatedBudgetUsd) : undefined,
        isActive,
        name
      }, actor || 'Super Admin (gautamkr192007@gmail.com)');

      if (!updated) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      
      const safeUser = { ...updated };
      delete safeUser.passwordHash;
      return NextResponse.json(safeUser);
    }

    // Default create
    const newUser: UserProfile = {
      id: body.id || `user-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: body.name,
      email: body.email,
      role: body.role || 'district_collector',
      agency: body.agency || 'Municipal Administrative Council',
      assignedCountry: body.assignedCountry || 'India',
      assignedDistrict: body.assignedDistrict,
      assignedPincodes: body.assignedPincodes || (body.pincode ? [body.pincode] : undefined),
      assignedDepartment: body.assignedDepartment,
      badge: body.badge || `${body.assignedDistrict || 'Municipal'} Officer`,
      isActive: true,
      isPasswordSet: false,
      permissions: body.permissions || ['district_triage', 'district_planning']
    };

    const created = await createUser(newUser, body.actor || 'Super Admin');
    const safeCreated = { ...created };
    delete safeCreated.passwordHash;
    return NextResponse.json(safeCreated, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
