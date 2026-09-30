/**
 * BRICS CivicPulse — Digital Public Infrastructure SMS Gateway
 * 
 * Supports both Live Cellular SMS Dispatch (via Twilio REST API / Fast2SMS)
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
  error?: string;
  nativeSmsUrl?: string;
  whatsAppUrl?: string;
  formattedHindiReceipt?: string;
  formattedEnglishReceipt?: string;
}

/**
 * Normalizes any phone number into strict E.164 format (+[country_code][number])
 */
export function normalizeToE164(phone: string, defaultCountry: string = 'India'): string {
  if (!phone) return '';
  // Strip all whitespace, dashes, parentheses, dots
  let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');
  if (!cleaned) return '';

  if (cleaned.startsWith('+')) {
    return cleaned;
  }

  // Handle 00 international prefix
  if (cleaned.startsWith('00')) {
    return '+' + cleaned.substring(2);
  }

  // Handle leading single zero (domestic trunk prefix)
  if (cleaned.startsWith('0') && cleaned.length > 10) {
    cleaned = cleaned.substring(1);
  }

  // If country code is already prefixed without '+'
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('27') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('55') && cleaned.length >= 12 && cleaned.length <= 13) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('86') && cleaned.length === 13) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('7') && cleaned.length === 11) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('1') && cleaned.length === 11) {
    return `+${cleaned}`;
  }

  const countryLower = defaultCountry.toLowerCase();
  if (countryLower.includes('south africa') || countryLower === 'za') {
    const digits = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
    return `+27${digits.slice(-9)}`;
  } else if (countryLower.includes('brazil') || countryLower === 'br') {
    const digits = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
    return `+55${digits.slice(-11)}`;
  } else if (countryLower.includes('russia') || countryLower === 'ru') {
    const digits = cleaned.startsWith('8') || cleaned.startsWith('7') ? cleaned.substring(1) : cleaned;
    return `+7${digits.slice(-10)}`;
  } else if (countryLower.includes('china') || countryLower === 'cn') {
    const digits = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned;
    return `+86${digits.slice(-11)}`;
  } else {
    // Default to India (+91)
    const tenDigits = cleaned.slice(-10);
    return `+91${tenDigits}`;
  }
}

export async function dispatchGrievanceSMS(params: {
  to: string;
  referenceCode: string;
  category: string;
  subcategory: string;
  district: string;
  urgency: string;
  country?: string;
}): Promise<SMSDispatchResult> {
  const { to, referenceCode, category, subcategory, district, country = 'India' } = params;

  // Clean and format phone to strict E.164
  const e164Phone = normalizeToE164(to, country);
  const plainDigits = e164Phone.replace(/\+/g, '');
  const raw10Digits = e164Phone.slice(-10);

  // Concise official SMS notification under 160 characters
  const smsBody = `[CivicPulse] Grievance Registered: ${referenceCode}. Issue: ${subcategory} (${district}). Track status: https://brics-civicpulse.vercel.app/citizen?track=${referenceCode}`;
  
  const formattedHindiReceipt = `🏛️ सरकारी नागरिक सेवा सूचना (BRICS CivicPulse)\n✅ आपकी शिकायत सफलतापूर्वक दर्ज हो गई है!\n📋 संदर्भ कोड: ${referenceCode}\n🏷️ श्रेणी: ${category.toUpperCase()} (${subcategory})\n📍 स्थान: ${district}\n🔍 स्थिति ट्रैक करें: https://brics-civicpulse.vercel.app/citizen?track=${referenceCode}`;
  const formattedEnglishReceipt = `🏛️ BRICS CivicPulse Official Receipt\n✅ Grievance Registered Successfully!\n📋 Ref Code: ${referenceCode}\n🏷️ Domain: ${category.toUpperCase()} (${subcategory})\n📍 Location: ${district}\n🔍 Track Live Status: https://brics-civicpulse.vercel.app/citizen?track=${referenceCode}`;

  const nativeSmsUrl = `sms:${e164Phone || ''}?body=${encodeURIComponent(smsBody)}`;
  const whatsAppUrl = `https://wa.me/${plainDigits}?text=${encodeURIComponent(smsBody)}`;

  if (!e164Phone || e164Phone.length < 9) {
    return {
      success: false,
      simulated: true,
      provider: 'simulation',
      referenceCode,
      recipient: to,
      message: 'Invalid phone number format.',
      note: 'Please provide a valid 10-digit mobile number or full international format with country code (e.g., +919823456789).',
      nativeSmsUrl,
      whatsAppUrl,
      formattedHindiReceipt,
      formattedEnglishReceipt,
    };
  }

  // 1. Check for Fast2SMS Gateway (Prioritized for India Mobile Numbers)
  const fast2smsKey = (
    process.env.FAST2SMS_API_KEY ||
    process.env.FAST2SMS_KEY ||
    process.env.FAST2SMS_TOKEN ||
    process.env.FAST2SMS_SECRET ||
    ''
  ).trim();

  if (fast2smsKey) {
    try {
      console.log(`[Fast2SMS Gateway] Attempting live SMS dispatch to Indian mobile: ${raw10Digits}...`);

      // Fast2SMS Quick SMS Route (route: 'q') — instant text delivery without strict DLT templates
      const fRes = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: fast2smsKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: smsBody,
          language: 'english',
          flash: 0,
          numbers: raw10Digits,
        }),
      });

      const fData = await fRes.json();
      console.log('[Fast2SMS API Response]', fData);

      if (fRes.ok && (fData.return === true || fData.status_code === 200)) {
        const requestId = fData.request_id || (Array.isArray(fData.message) ? fData.message[0] : 'Delivered');
        console.log(`[Fast2SMS Success] Request ID: ${requestId} sent to ${raw10Digits}`);
        return {
          success: true,
          simulated: false,
          provider: 'fast2sms',
          referenceCode,
          recipient: e164Phone,
          message: smsBody,
          dispatchId: requestId,
          note: `Live SMS successfully dispatched via Fast2SMS Indian Gateway to +91 ${raw10Digits} (Request ID: ${requestId}).`,
          nativeSmsUrl,
          whatsAppUrl,
          formattedHindiReceipt,
          formattedEnglishReceipt,
        };
      } else {
        const rawMsg = Array.isArray(fData.message) ? fData.message.join(', ') : (fData.message || fData.error || 'Fast2SMS dispatch rejected');
        const isRechargeRequired = fData.status_code === 999 || rawMsg.includes('100 INR') || rawMsg.includes('transaction of 100');
        
        const note = isRechargeRequired
          ? `Fast2SMS Gateway Policy: Fast2SMS accounts require a 1-time ₹100 recharge at fast2sms.com/dashboard/add-wallet before carrier API dispatch is unlocked. In the meantime, use the 1-Click Instant SMS / WhatsApp buttons below to send the receipt directly!`
          : `Fast2SMS Gateway Notice: ${rawMsg}.`;

        console.warn('[Fast2SMS Notice]', note);
        return {
          success: false,
          simulated: true,
          provider: 'fast2sms',
          referenceCode,
          recipient: e164Phone,
          message: smsBody,
          dispatchId: `ERR-FAST2SMS-${fData.status_code || 'NOTICE'}`,
          error: rawMsg,
          note,
          nativeSmsUrl,
          whatsAppUrl,
          formattedHindiReceipt,
          formattedEnglishReceipt,
        };
      }
    } catch (err: any) {
      console.error('[Fast2SMS Network Error]', err.message);
      return {
        success: false,
        simulated: true,
        provider: 'fast2sms',
        referenceCode,
        recipient: e164Phone,
        message: smsBody,
        error: err.message,
        note: `Fast2SMS network connection notice: ${err.message}. Use 1-Click SMS/WhatsApp trigger below for direct transmission.`,
        nativeSmsUrl,
        whatsAppUrl,
        formattedHindiReceipt,
        formattedEnglishReceipt,
      };
    }
  }

  // 2. Check for Twilio Gateway (Secondary / International)
  const twilioSid = (process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID || '').trim();
  const twilioToken = (process.env.TWILIO_AUTH_TOKEN || process.env.TWILIO_TOKEN || '').trim();
  const twilioFrom = (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_FROM || process.env.TWILIO_NUMBER || '').trim();

  if (twilioSid && twilioToken && twilioFrom) {
    try {
      console.log(`[Twilio SMS] Attempting live dispatch to: ${e164Phone} from ${twilioFrom}...`);
      const basicAuth = Buffer.from(`${twilioSid}:${twilioToken}`).toString('base64');
      const formData = new URLSearchParams();
      formData.append('To', e164Phone);
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
        console.log(`[Twilio SMS Success] Message SID: ${twilioData.sid} sent to ${e164Phone}`);
        return {
          success: true,
          simulated: false,
          provider: 'twilio',
          referenceCode,
          recipient: e164Phone,
          message: smsBody,
          dispatchId: twilioData.sid,
          note: `Live SMS successfully dispatched via Twilio to ${e164Phone} (SID: ${twilioData.sid}).`,
          nativeSmsUrl,
          whatsAppUrl,
          formattedHindiReceipt,
          formattedEnglishReceipt,
        };
      } else {
        console.error('[Twilio SMS Error]', twilioData);
        return {
          success: false,
          simulated: true,
          provider: 'twilio',
          referenceCode,
          recipient: e164Phone,
          message: smsBody,
          dispatchId: `ERR-TWILIO-${twilioData.code || 'FAIL'}`,
          error: twilioData.message || 'Twilio API request rejected',
          note: `Twilio API Response: ${twilioData.message || 'Failed to dispatch'}. (If using a free Twilio trial, ensure ${e164Phone} is added under 'Verified Caller IDs' in your Twilio Console).`,
          nativeSmsUrl,
          whatsAppUrl,
          formattedHindiReceipt,
          formattedEnglishReceipt,
        };
      }
    } catch (err: any) {
      console.error('[Twilio Network Error]', err.message);
      return {
        success: false,
        simulated: true,
        provider: 'twilio',
        referenceCode,
        recipient: e164Phone,
        message: smsBody,
        error: err.message,
        note: `Twilio network connection error: ${err.message}. Defaulted to prototype simulation.`,
        nativeSmsUrl,
        whatsAppUrl,
        formattedHindiReceipt,
        formattedEnglishReceipt,
      };
    }
  }

  // 3. High-Fidelity Prototype Simulation Fallback
  console.log(`[SMS Gateway Simulated Dispatch] To: ${e164Phone} | Ref: ${referenceCode} | Body: ${smsBody}`);

  return {
    success: true,
    simulated: true,
    provider: 'simulation',
    referenceCode,
    recipient: e164Phone,
    message: smsBody,
    dispatchId: `SIM-SMS-${Date.now()}`,
    note: 'Instant Receipt Generated. You can click "Open in SMS App" or "Share via WhatsApp" below to transmit directly to mobile.',
    nativeSmsUrl,
    whatsAppUrl,
    formattedHindiReceipt,
    formattedEnglishReceipt,
  };
}

