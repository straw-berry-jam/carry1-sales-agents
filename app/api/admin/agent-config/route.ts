import { NextResponse } from 'next/server';
import { agentConfig } from '@/lib/agentConfig';

/**
 * GET /api/admin/agent-config
 * Returns prompt-related agent config for the Prompt Control admin tab.
 * Exposes only safe, non-secret fields (no env vars or IDs).
 */
export async function GET() {
  const objectivesSample = agentConfig.objectivesPrompt(
    'Account Executive',
    'Acme Corp',
    'Discovery Call'
  );

  return NextResponse.json({
    fullTitle: agentConfig.fullTitle,
    persona: agentConfig.persona,
    systemInstructions: agentConfig.systemInstructions,
    initialMessage: agentConfig.initialMessage,
    fallbackGreeting: agentConfig.fallbackGreeting,
    objectivesPromptSample: objectivesSample,
    contextLabel: agentConfig.contextLabel,
    contextTypes: agentConfig.onboarding.contextTypes,
    userNoun: agentConfig.userNoun,
    sessionNoun: agentConfig.sessionNoun,
  });
}
