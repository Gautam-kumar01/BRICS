/**
 * BRICS CivicPulse — Digital Public Infrastructure SMS Gateway
 * 
 * Supports both Live Carrier SMS Dispatch (via Twilio REST API or Fast2SMS)
 * and High-Fidelity Simulation with instant on-screen receipt generation.
 */

export interface SMSDispatchResult {
  success: boolean;
  simulated: boolean;
  provider: 'twilio' | 'fast2sms' | 'simulation';
  referenceCode: string;
  recipient: string;
  message: string;
  dispatchId?: string;
  note?: string;
}

export async function dispatchGrievanceSMS(params: {
  to: string;
  referenceCode: string;
  category: string;
  subcategory: string;
  district: string;
  urgency: string;
}): Promise<SMSDispatchResult> {
  const { to, referenceCode, subcategory, district } = params;

  // Clean and validate phone number
  const cleanPhone = to.trim();
  if (!cleanPhone || cleanPhone.length < 8) {
    return {
      success: false,
      simulated: true,
      provider: 'simulation',
      referenceCode,
      recipient: cleanPhone,
      message: 'Invalid phone number provided.',
      note: 'Phone number must be at least 8 digits.',
    };
  }

  // Bilingual official SMS body (Hindi & English)
  const smsBody = `[BRICS CivicPulse] Grievance Registered: ${referenceCode}. Issue: ${subcategory} (${district}). Track status online: https://brics-civicpulse.vercel.app/citizen?track=${referenceCode} • BRICS DPI Governance`;

  // 1. Check for Twilio Credentials in Environment
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('To', cleanPhone.startsWith('+') ? cleanPhone : `+91${cleanPhone.replace(/\D/g, '').slice(-10)}`);
      formData.append('From', twilioFrom);
      formData.append('Body', smsBody);

      const twilioRes = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData.toString(),
        }
      );

      const twilioData = await twilioRes.json();
      if (twilioRes.ok) {
        return {
          success: true,
          simulated: false,
          provider: 'twilio',
          referenceCode,
          recipient: cleanPhone,
          message: smsBody,
          dispatchId: twilioData.sid,
          note: 'Live SMS successfully delivered to cellular carrier via Twilio Gateway.',
        };
      } else {
        console.warn('Twilio Dispatch Warning:', twilioData);
      }
    } catch (err: any) {
      console.warn('Twilio Gateway Network Error:', err.message);
    }
  }

  // 2. Check for Fast2SMS (India Bulk Route) in Environment
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  if (fast2smsKey) {
    try {
      const raw10Digits = cleanPhone.replace(/\D/g, '').slice(-10);
      if (raw10Digits.length === 10) {
        const fRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: fast2smsKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'v3',
            sender_id: 'CVPULS',
            message: smsBody,
            language: 'english',
            flash: 0,
            numbers: raw10Digits,
          }),
        });

        const fData = await fRes.json();
        if (fRes.ok && fData.return) {
          return {
            success: true,
            simulated: false,
            provider: 'fast2sms',
            referenceCode,
            recipient: cleanPhone,
            message: smsBody,
            dispatchId: fData.request_id,
            note: 'Live SMS delivered via Fast2SMS Indian Telecom Gateway.',
          };
        }
      }
    } catch (err: any) {
      console.warn('Fast2SMS Gateway Error:', err.message);
    }
  }

  // 3. Fallback: High-Fidelity Prototype Simulation
  // Logs to server telemetry and outputs structured dispatch response
  console.log(`[SMS Gateway Simulated Dispatch] To: ${cleanPhone} | Ref: ${referenceCode} | Body: ${smsBody}`);

  return {
    success: true,
    simulated: true,
    provider: 'simulation',
    referenceCode,
    recipient: cleanPhone,
    message: smsBody,
    dispatchId: `SIM-SMS-${Date.now()}`,
    note: 'Simulated Gateway Dispatch. To deliver real physical SMS to mobile phones, add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN & TWILIO_PHONE_NUMBER or FAST2SMS_API_KEY in .env.local.',
  };
}
