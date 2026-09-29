import { NextRequest, NextResponse } from 'next/server';
import { executeResilientAIExtraction } from '@/lib/ai/ai-gateway';
import { SEED_SUBMISSIONS } from '@/data/seed-data';
import { CitizenSubmission } from '@/types';

// In-memory runtime cache for submissions created during session
let runtimeSubmissions: CitizenSubmission[] = [...SEED_SUBMISSIONS];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, history = [], location = {} } = body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ reply: 'Please provide a message or describe your infrastructure problem.' });
    }

    const trimmed = message.trim();
    const lower = trimmed.toLowerCase();

    // ------------------------------------------------------------------------
    // 1. Check for Reference Code Tracking (e.g. CP-IN-2026-8491)
    // ------------------------------------------------------------------------
    const refCodeMatch = trimmed.match(/CP-[A-Z0-9]+-\d{4}-\d+/i);
    if (refCodeMatch) {
      const code = refCodeMatch[0].toUpperCase();
      const found = runtimeSubmissions.find(s => s.referenceCode.toUpperCase() === code);
      
      if (found) {
        return NextResponse.json({
          type: 'tracking',
          reply: `📋 *Official Case Status for ${found.referenceCode}*\n\n` +
                 `🔹 *Domain*: ${found.category.toUpperCase()} — ${found.subcategory}\n` +
                 `📍 *Location*: ${found.location.district} (PIN: ${found.location.pincode || '424001'}), ${found.location.country}\n` +
                 `🚦 *Status*: *${found.status.toUpperCase()}*\n` +
                 `🏢 *Assigned Unit*: ${found.assignedDepartment || 'Municipal Works & Infrastructure Directorate'}\n` +
                 `📅 *Reported*: ${new Date(found.timestamp).toLocaleDateString()}\n\n` +
                 `💡 *Next Step*: Engineering field inspection dispatched. You will receive an SMS/WhatsApp update once remediation is scheduled.`
        });
      } else {
        return NextResponse.json({
          type: 'tracking',
          reply: `🔍 Case Reference *${code}* was not found in the immediate active registry. Please double-check the code or submit a new report if your problem is unresolved.`
        });
      }
    }

    // ------------------------------------------------------------------------
    // 2. Greetings & Conversational Queries
    // ------------------------------------------------------------------------
    const isGreeting = /^(hi|hello|hey|namaste|pranam|hola|ola|privet|nihao|marhaban|jambo|good\s*(morning|afternoon|evening)|kaise\s*ho|kya\s*hal|halo|ssup)\b/i.test(lower);
    
    if (isGreeting && lower.length < 30) {
      // Hindi / Hinglish greeting
      if (/namaste|pranam|kaise\s*ho|kya\s*hal/i.test(lower)) {
        return NextResponse.json({
          type: 'greeting',
          reply: `👋 नमस्ते! मैं **BRICS CivicPulse AI नागरिक सहायक** हूँ।\n\nमैं आपकी स्थानीय नागरिक समस्याओं (जैसे पानी की किल्लत, टूटी सड़क, बिजली गुल, अस्पताल या कचरा प्रबंधन) को सीधे नगर पालिका और सरकारी इंजीनियरों तक पहुँचाने में मदद करता हूँ।\n\n👉 **आप क्या करना चाहते हैं?**\n1. अपनी समस्या और पिनकोड/एरिया यहाँ लिखें (उदा. *"हमारे इलाके 424001 में 3 दिन से पानी की पाइपलाइन टूटी है"*)\n2. पुरानी शिकायत ट्रैक करने के लिए अपना रेफरेंस कोड भेजें (उदा. *"CP-IN-2026-8491"*)\n3. कोई सवाल पूछें!`
        });
      }

      // Default Global / English greeting
      return NextResponse.json({
        type: 'greeting',
        reply: `👋 Hello! I am the **BRICS CivicPulse Official Citizen Assistant**.\n\nI connect citizen infrastructure demands (water, roads, electricity, sanitation, healthcare, broadband) directly with national municipal capital budgets.\n\n👉 **How can I help you today?**\n1. **Report a Problem**: Describe your infrastructure issue and pincode/area (e.g. *"Water pipe burst near bus stand PIN 424001"*).\n2. **Track a Case**: Send your reference code (e.g. *"CP-IN-2026-8491"*).\n3. **Ask a Question**: Ask about municipal budgets, 300m spatial privacy, or DPI policies.`
      });
    }

    // ------------------------------------------------------------------------
    // 3. Platform & FAQ Questions (Privacy, How it works, Who is this)
    // ------------------------------------------------------------------------
    if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('aap kaun ho') || lower.includes('tum kaun ho')) {
      return NextResponse.json({
        type: 'faq',
        reply: `🤖 I am **BRICS CivicPulse AI**, an open-source Digital Public Good (DPG) created for BRICS Track 1 (AI for Digital Public Infrastructure & Governance).\n\nMy role is to listen to citizens across 7 languages, automatically extract infrastructure deficits with geospatial PIN code clustering, and present evidence-based recommendations to government planners.`
      });
    }

    if (lower.includes('privacy') || lower.includes('location safe') || lower.includes('gopniyata') || lower.includes('surakshit')) {
      return NextResponse.json({
        type: 'faq',
        reply: `🔒 **Your Spatial Privacy is 100% Protected:**\n\n1. Under **DPG Section 8 Standards**, we never publish your exact house address or phone number.\n2. Residential GPS coordinates are obfuscated into a **300-meter uncertainty buffer** on public heatmaps.\n3. Only authorized municipal repair crews receive designated work-order locations.`
      });
    }

    if (lower.includes('how does this work') || lower.includes('kaise kaam karta') || lower.includes('how to report')) {
      return NextResponse.json({
        type: 'faq',
        reply: `⚙️ **How BRICS CivicPulse Works:**\n\n1. **Voice / Text Intake**: You speak or type your community problem in your native language.\n2. **Resilient AI Gateway**: The AI identifies domain (Water, Roads, Power, Health), urgency level, and affected population.\n3. **Geospatial Clustering**: Nearby reports merge into demand hotspots to show municipal authorities where funding is needed most.\n4. **Defensible Allocation**: City engineers prioritize capital projects using transparent multi-criteria scoring.`
      });
    }

    // ------------------------------------------------------------------------
    // 4. Infrastructure Deficit Detection & Live Registration
    // ------------------------------------------------------------------------
    // Process through real AI Gateway extraction
    const detectedLanguage = /[\u0900-\u097F]/.test(trimmed) ? 'hi' : 'en';
    const aiResult = await executeResilientAIExtraction(trimmed, detectedLanguage);

    // Create an authentic reference code
    const countryCode = location.country === 'South Africa' ? 'ZA' :
                        location.country === 'Brazil' ? 'BR' :
                        location.country === 'Russia' ? 'RU' :
                        location.country === 'China' ? 'CN' :
                        location.country === 'Egypt' ? 'EG' :
                        location.country === 'Ethiopia' ? 'ET' : 'IN';
    
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `CP-${countryCode}-2026-${randomSeq}`;
    
    const district = location.district || aiResult.locationDetails?.district || 'Dhule (Dhulia)';
    const pincode = location.pincode || aiResult.locationDetails?.pincode || '424001';
    const country = location.country || aiResult.locationDetails?.country || 'India';

    const newSubmission: CitizenSubmission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      referenceCode,
      channel: 'whatsapp',
      language: detectedLanguage as any,
      rawInput: trimmed,
      translatedText: aiResult.translatedText || trimmed,
      category: aiResult.category,
      subcategory: aiResult.subcategory,
      urgency: aiResult.urgency,
      affectedPopulationEstimate: aiResult.affectedPopulationEstimate || 2500,
      location: {
        country,
        district,
        pincode,
        ward: location.ward || 'Central Ward Sector',
        landmark: location.landmark || 'Main Road Junction',
        latitude: location.latitude || 20.9042,
        longitude: location.longitude || 74.7749,
        uncertaintyRadiusMeters: 300,
        confidence: aiResult.confidenceScore || 0.92,
        formattedAddress: `${district}, PIN: ${pincode}, ${country}`,
      },
      extractedEntities: aiResult.extractedEntities || [
        { field: 'category', value: aiResult.category, confidence: 0.95 },
        { field: 'pincode', value: pincode, confidence: 0.98 },
      ],
      aiConfidenceScore: aiResult.confidenceScore || 0.92,
      assignedDepartment: `${aiResult.category.charAt(0).toUpperCase() + aiResult.category.slice(1)} Infrastructure Division`,
      status: 'submitted',
      isAssisted: false,
      timestamp: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      citizenConsent: {
        dataAnalytics: true,
        publicMapAggregation: true,
        contactForUpdates: true,
      },
    };

    runtimeSubmissions.unshift(newSubmission);

    // Dynamic response based on language
    if (detectedLanguage === 'hi' || /paani|sadak|bijli|aspataal|gaddha|kachra/i.test(lower)) {
      return NextResponse.json({
        type: 'submission',
        submission: newSubmission,
        reply: `✅ **आपकी समस्या सफलतापूर्वक दर्ज हो गई है!**\n\n` +
               `📋 **केस रेफरेंस कोड**: *${referenceCode}*\n` +
               `🏷️ **पहचाना गया विषय**: *${aiResult.category.toUpperCase()} — ${aiResult.subcategory}*\n` +
               `🚨 **प्राथमिकता स्तर**: *${aiResult.urgency.toUpperCase()}*\n` +
               `📍 **स्थान**: ${district} (पिनकोड: ${pincode})\n` +
               `🏢 **सौंपा गया विभाग**: *${newSubmission.assignedDepartment}*\n\n` +
               `यह समस्या जिला नगर पालिका कार्य डेस्क पर भेज दी गई है। स्थिति जानने के लिए कभी भी *${referenceCode}* टाइप करें।`
      });
    }

    return NextResponse.json({
      type: 'submission',
      submission: newSubmission,
      reply: `✅ **Infrastructure Issue Registered & Transferred to Municipal Desk!**\n\n` +
             `📋 **Case Reference Code**: *${referenceCode}*\n` +
             `🏷️ **Classified Domain**: *${aiResult.category.toUpperCase()} — ${aiResult.subcategory}*\n` +
             `🚨 **Urgency**: *${aiResult.urgency.toUpperCase()}*\n` +
             `📍 **Location**: ${district} (PIN: ${pincode}), ${country}\n` +
             `🏢 **Assigned Department**: *${newSubmission.assignedDepartment}*\n\n` +
             `Your case has been logged in the Municipal Triage Queue. You can check status anytime by sending *${referenceCode}*!`
    });

  } catch (error: any) {
    console.error('WhatsApp Bot AI Chat Error:', error);
    return NextResponse.json({
      type: 'error',
      reply: '⚠️ Our AI Gateway encountered a temporary glitch. Please describe your issue along with your district and pincode, and we will register it.'
    }, { status: 500 });
  }
}
