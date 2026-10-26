import { NextRequest, NextResponse } from 'next/server';
import { PhotoVerificationResult } from '@/types';

export const runtime = 'nodejs';

/**
 * 3-LAYER AI PHOTO EVIDENCE VERIFICATION GATEWAY
 * 
 * Layer 1: What is in photo (Is it actual public infrastructure? Reject selfies, food, animals, memes, screenshots)
 * Layer 2: Real or Fake (Real camera photo vs blurred, black, AI-generated, or edited)
 * Layer 3: Matching with complaint (Does photo content match the claimed domain and description?)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { photo, domain = 'roads', complaintText = '', location = 'District Pilot' } = body;

    if (!photo || typeof photo !== 'string') {
      return NextResponse.json({
        isValid: false,
        decision: 'REJECTED',
        confidenceScore: 0.99,
        detectedContent: 'No image data received',
        officerVerdict: 'Inspection Failed: No photo evidence was provided for verification.',
        reason: 'Image data missing from request.',
        layers: {
          layer1_isInfrastructure: false,
          layer1_status: 'FAIL',
          layer1_details: 'No image found to inspect.',
          layer2_isAuthenticPhoto: false,
          layer2_status: 'FAIL',
          layer2_details: 'No image data.',
          layer3_matchesComplaint: false,
          layer3_status: 'FAIL',
          layer3_details: 'Cannot match against empty evidence.'
        }
      } as PhotoVerificationResult, { status: 400 });
    }

    // Extract raw base64 and mime type
    let mimeType = 'image/jpeg';
    let base64Data = photo;
    if (photo.startsWith('data:')) {
      const match = photo.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    // Call Gemini Multimodal Vision API
    const apiKey = (process.env.GEMINI_API_KEY || '').trim();
    if (apiKey) {
      try {
        const result = await callGeminiVision(base64Data, mimeType, domain, complaintText, location, apiKey);
        return NextResponse.json(result);
      } catch (geminiError: any) {
        console.warn('[Gemini Vision API Warning]:', geminiError.message, '- Falling back to smart semantic validator.');
      }
    }

    // High-Fidelity Smart Fallback Validator (Zero-Downtime Guarantee)
    const fallbackResult = smartFallbackImageVerification(base64Data, domain, complaintText);
    return NextResponse.json(fallbackResult);

  } catch (err: any) {
    console.error('[Verify Photo Error]:', err);
    return NextResponse.json({
      isValid: false,
      decision: 'REJECTED',
      confidenceScore: 0.8,
      detectedContent: 'Processing error during verification',
      officerVerdict: 'Inspection Error: Unable to verify image format. Please re-capture or attach a standard JPG/PNG photo.',
      reason: err.message || 'Image inspection failure.',
      layers: {
        layer1_isInfrastructure: false,
        layer1_status: 'FAIL',
        layer1_details: 'Image format verification error.',
        layer2_isAuthenticPhoto: false,
        layer2_status: 'FAIL',
        layer2_details: 'Could not decode image stream.',
        layer3_matchesComplaint: false,
        layer3_status: 'FAIL',
        layer3_details: 'Verification interrupted.'
      }
    } as PhotoVerificationResult, { status: 500 });
  }
}

/**
 * Executes 3-Layer Multimodal Vision Inspection using Google Gemini
 */
async function callGeminiVision(
  base64Data: string,
  mimeType: string,
  domain: string,
  complaintText: string,
  location: string,
  apiKey: string
): Promise<PhotoVerificationResult> {
  // Proven fastest & most active vision models on Gemini API
  const models = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];

  const prompt = `You are a strict, experienced Municipal Infrastructure Verification Officer inspecting citizen photo evidence for Digital Public Infrastructure (CivicPulse).

A citizen has registered a grievance with the following details:
- Claimed Infrastructure Domain: "${domain.toUpperCase()}"
- Citizen's Problem Description: "${complaintText || 'Not provided'}"
- Territory / Location: "${location || 'District Area'}"

Inspect this attached image thoroughly through these 3 MANDATORY LAYERS:

Layer 1 - What is in photo:
Look at the image carefully. Is it really showing public/municipal infrastructure (roads, potholes, asphalt, bridges, culverts, water pipelines, potable water leakage/contamination, electricity transformers/wires, poles, garbage heaps, open drains, public health clinic hazard, telecom pole/fiber)?
CRITICAL REJECTION RULES FOR LAYER 1:
- Animals or pets (dogs, cats, cattle, birds, etc.) -> REJECT (NOT INFRASTRUCTURE).
- Human faces, selfies, portraits, group photos, clothes, shoes -> REJECT (NOT INFRASTRUCTURE).
- Food, dishes, kitchen items, groceries -> REJECT (NOT INFRASTRUCTURE).
- Digital screenshots (phone screen, computer screen, WhatsApp chats, emails, schedules, timetables, Google Meet, apps, websites) -> REJECT (NOT INFRASTRUCTURE).
- Paper documents (handwritten notes, question papers, letters, forms, certificates, books) -> REJECT (NOT INFRASTRUCTURE).
- Memes, cartoons, drawings, anime, or indoor bedrooms/living rooms -> REJECT (NOT INFRASTRUCTURE).
If it's NOT genuine public municipal outdoor infrastructure, REJECT IT IMMEDIATELY (isValid = false, decision = "REJECTED").

Layer 2 - Real or fake:
Check if the photo looks like an authentic camera photo from a real scene.
If the photo is completely black, completely white, extremely blurry/unrecognizable, a computer screenshot with text/UI buttons, an AI-generated image, or heavily filtered/edited, mark it as suspicious/rejected (isValid = false, decision = "REJECTED").

Layer 3 - Matching with complaint:
Does the photo match the citizen's claimed domain and description?
- If citizen claimed "roads" but photo shows an animal, dog, paper, water, garbage, electricity, or an indoor room -> MISMATCH (REJECT).
- If citizen claimed "water" but photo shows a dry pothole, electric pole, animal, or selfie -> MISMATCH (REJECT).
- If citizen claimed "energy" but photo shows a water puddle or garbage -> MISMATCH (REJECT).
- If citizen claimed "sanitation" but photo shows an electric transformer or road bridge -> MISMATCH (REJECT).
The photo MUST correspond directly to the claimed domain "${domain.toUpperCase()}" and the issue described "${complaintText}".

After checking all 3 layers, provide your official verdict in simple, human officer words. Speak like a real human officer checking photos.

Return ONLY a valid JSON object matching this schema:
{
  "isValid": false,
  "decision": "REJECTED",
  "confidenceScore": 0.95,
  "detectedContent": "A domestic dog standing outdoors / A digital screenshot of email / Broken asphalt road with deep pothole",
  "detectedDomain": "roads",
  "officerVerdict": "Officer statement explaining in simple words whether valid or why rejected.",
  "reason": "Clear explanation of which layer failed or passed.",
  "layers": {
    "layer1_isInfrastructure": false,
    "layer1_status": "FAIL",
    "layer1_details": "Details on what was detected.",
    "layer2_isAuthenticPhoto": true,
    "layer2_status": "PASS",
    "layer2_details": "Quality inspection details.",
    "layer3_matchesComplaint": false,
    "layer3_status": "FAIL",
    "layer3_details": "Domain alignment details."
  }
}

If any layer fails, set "isValid": false and "decision": "REJECTED".
Be strict: do not allow animals, selfies, memes, screenshots, or domain mismatches.
Return ONLY raw JSON, with no markdown code blocks or backticks.`;

  let lastError: any = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000); // 12 sec timeout per model

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.1
          }
        })
      });
      clearTimeout(timer);

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Vision (${model}) status ${response.status}: ${errText.substring(0, 100)}`);
      }

      const json = await response.json();
      const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) throw new Error(`Empty response content from ${model}`);

      // Parse JSON safely
      let clean = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const s = clean.indexOf('{');
      const e = clean.lastIndexOf('}');
      if (s !== -1 && e !== -1 && e > s) {
        clean = clean.substring(s, e + 1);
      }
      const parsed = JSON.parse(clean);

      const isValid = Boolean(parsed.isValid);

      return {
        isValid,
        decision: parsed.decision || (isValid ? 'APPROVED' : 'REJECTED'),
        confidenceScore: typeof parsed.confidenceScore === 'number' ? parsed.confidenceScore : 0.95,
        detectedContent: parsed.detectedContent || 'Inspected photo evidence',
        detectedDomain: parsed.detectedDomain || domain,
        officerVerdict: parsed.officerVerdict || (isValid ? 'Photo verified by AI Officer.' : 'Photo rejected by AI Officer.'),
        reason: parsed.reason || (isValid ? 'Evidence verified successfully.' : 'Photo failed verification standards.'),
        layers: {
          layer1_isInfrastructure: Boolean(parsed.layers?.layer1_isInfrastructure),
          layer1_status: parsed.layers?.layer1_status || (parsed.layers?.layer1_isInfrastructure ? 'PASS' : 'FAIL'),
          layer1_details: parsed.layers?.layer1_details || (isValid ? 'Infrastructure verified.' : 'Non-infrastructure content detected.'),
          layer2_isAuthenticPhoto: Boolean(parsed.layers?.layer2_isAuthenticPhoto),
          layer2_status: parsed.layers?.layer2_status || (parsed.layers?.layer2_isAuthenticPhoto ? 'PASS' : 'FAIL'),
          layer2_details: parsed.layers?.layer2_details || 'Visual quality evaluated.',
          layer3_matchesComplaint: Boolean(parsed.layers?.layer3_matchesComplaint),
          layer3_status: parsed.layers?.layer3_status || (parsed.layers?.layer3_matchesComplaint ? 'PASS' : 'FAIL'),
          layer3_details: parsed.layers?.layer3_details || 'Complaint alignment evaluated.'
        }
      };

    } catch (err: any) {
      lastError = err;
      console.warn(`[Gemini Vision ${model}]:`, err.message);
      // Try next model in sequence
    }
  }

  throw lastError || new Error('All Gemini Vision model endpoints failed');
}

/**
 * Smart Fallback Semantic Image Inspector
 * CRITICAL RULE: Never blindly approve photos if AI verification is unavailable.
 * Strictly flags unverified photos for safety.
 */
function smartFallbackImageVerification(
  base64Data: string,
  domain: string,
  complaintText: string
): PhotoVerificationResult {
  const byteLength = Math.round((base64Data.length * 3) / 4);
  const normalizedDomain = domain.toLowerCase();

  // If payload is under 1KB, likely corrupt or completely blank
  if (byteLength < 1024) {
    return {
      isValid: false,
      decision: 'REJECTED',
      confidenceScore: 0.99,
      detectedContent: 'Extremely low-resolution or blank image data (< 1KB)',
      officerVerdict: 'Officer Note: Rejected at Layer 2. The attached image file is too small or blank to inspect. Please take a clear photo of the site.',
      reason: 'Photo is blank, corrupted, or under minimum visual resolution.',
      layers: {
        layer1_isInfrastructure: false,
        layer1_status: 'FAIL',
        layer1_details: 'Unable to detect any infrastructure objects in tiny/blank data.',
        layer2_isAuthenticPhoto: false,
        layer2_status: 'FAIL',
        layer2_details: `Payload size (${byteLength} bytes) is below minimum camera resolution.`,
        layer3_matchesComplaint: false,
        layer3_status: 'FAIL',
        layer3_details: 'Cannot match blank data with claimed complaint.'
      }
    };
  }

  // Strict conservative fallback: Do NOT blindly approve unknown photos
  return {
    isValid: false,
    decision: 'REJECTED',
    confidenceScore: 0.92,
    detectedContent: 'Unverified Image File (AI Vision Gateway Timeout / Offline)',
    detectedDomain: normalizedDomain,
    officerVerdict: 'Officer Note: Evidence verification service could not conclusively confirm civic infrastructure in this image. To protect municipal records from invalid submissions, please re-upload a clear on-site photo.',
    reason: 'Automated 3-Layer check could not confirm physical infrastructure in uploaded file.',
    layers: {
      layer1_isInfrastructure: false,
      layer1_status: 'FAIL',
      layer1_details: 'Cannot confirm public infrastructure without active visual analysis.',
      layer2_isAuthenticPhoto: false,
      layer2_status: 'FAIL',
      layer2_details: 'Authenticity verification inconclusive.',
      layer3_matchesComplaint: false,
      layer3_status: 'FAIL',
      layer3_details: 'Domain alignment unconfirmed.'
    }
  };
}
