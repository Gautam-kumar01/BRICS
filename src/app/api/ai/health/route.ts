import { NextRequest, NextResponse } from 'next/server';
import { aiGatewayTelemetry, testProviderConnectivity } from '@/lib/ai/ai-gateway';
import { AIProviderStatus } from '@/types';

export async function GET(req: NextRequest) {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const groqKey = process.env.GROQ_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';

  const now = new Date().toISOString();

  // Test configured keys concurrently
  const [geminiHealth, groqHealth, openrouterHealth] = await Promise.all([
    geminiKey ? testProviderConnectivity('gemini', geminiKey) : Promise.resolve({ success: false, latencyMs: 0 }),
    groqKey ? testProviderConnectivity('groq', groqKey) : Promise.resolve({ success: false, latencyMs: 0 }),
    openrouterKey ? testProviderConnectivity('openrouter', openrouterKey) : Promise.resolve({ success: false, latencyMs: 0 }),
  ]);

  const providers: AIProviderStatus[] = [
    {
      id: 'gemini',
      name: 'Google Gemini 1.5 Flash',
      modelName: 'gemini-1.5-flash',
      isConfigured: !!geminiKey,
      isHealthy: geminiKey ? geminiHealth.success : false,
      latencyMs: geminiHealth.latencyMs || 220,
      lastChecked: now,
      totalCalls: aiGatewayTelemetry.providerSuccessCount.gemini + aiGatewayTelemetry.providerFailureCount.gemini,
      failedCalls: aiGatewayTelemetry.providerFailureCount.gemini,
      errorRatePercent: aiGatewayTelemetry.providerFailureCount.gemini > 0 
        ? Math.round((aiGatewayTelemetry.providerFailureCount.gemini / (aiGatewayTelemetry.providerSuccessCount.gemini + aiGatewayTelemetry.providerFailureCount.gemini)) * 100) 
        : 0,
    },
    {
      id: 'groq',
      name: 'Groq LPU (Llama 3.3 70B)',
      modelName: 'llama-3.3-70b-versatile',
      isConfigured: !!groqKey,
      isHealthy: groqKey ? groqHealth.success : false,
      latencyMs: groqHealth.latencyMs || 95,
      lastChecked: now,
      totalCalls: aiGatewayTelemetry.providerSuccessCount.groq + aiGatewayTelemetry.providerFailureCount.groq,
      failedCalls: aiGatewayTelemetry.providerFailureCount.groq,
      errorRatePercent: aiGatewayTelemetry.providerFailureCount.groq > 0 
        ? Math.round((aiGatewayTelemetry.providerFailureCount.groq / (aiGatewayTelemetry.providerSuccessCount.groq + aiGatewayTelemetry.providerFailureCount.groq)) * 100) 
        : 0,
    },
    {
      id: 'openrouter',
      name: 'OpenRouter Multi-Model Gateway',
      modelName: 'meta-llama/llama-3.3-70b-instruct',
      isConfigured: !!openrouterKey,
      isHealthy: openrouterKey ? openrouterHealth.success : false,
      latencyMs: openrouterHealth.latencyMs || 340,
      lastChecked: now,
      totalCalls: aiGatewayTelemetry.providerSuccessCount.openrouter + aiGatewayTelemetry.providerFailureCount.openrouter,
      failedCalls: aiGatewayTelemetry.providerFailureCount.openrouter,
      errorRatePercent: aiGatewayTelemetry.providerFailureCount.openrouter > 0 
        ? Math.round((aiGatewayTelemetry.providerFailureCount.openrouter / (aiGatewayTelemetry.providerSuccessCount.openrouter + aiGatewayTelemetry.providerFailureCount.openrouter)) * 100) 
        : 0,
    },
    {
      id: 'local_fallback',
      name: 'CivicPulse Smart NLP Engine (Edge Local)',
      modelName: 'CivicPulse-Local-NLP-Heuristics-v2.0',
      isConfigured: true,
      isHealthy: true,
      latencyMs: 12,
      lastChecked: now,
      totalCalls: aiGatewayTelemetry.providerSuccessCount.local_fallback,
      failedCalls: 0,
      errorRatePercent: 0,
    }
  ];

  return NextResponse.json({
    providers,
    telemetry: aiGatewayTelemetry,
    activeProvider: geminiKey && geminiHealth.success ? 'gemini' : (groqKey && groqHealth.success ? 'groq' : (openrouterKey && openrouterHealth.success ? 'openrouter' : 'local_fallback')),
  });
}
