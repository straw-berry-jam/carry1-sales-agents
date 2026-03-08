/**
 * POST /api/score-session
 * Scores a session transcript using the active SPIN Sales Coach prompt from the DB
 * and returns a structured JSON scorecard. System prompt is never hardcoded.
 */

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getActiveSpinCoachPrompt } from '@/lib/agents';
import { SCORING_PROMPTS, VALID_SESSION_TYPES } from '@/lib/scoringPrompts';

const NO_ACTIVE_AGENT_MESSAGE =
  'No active SPIN Sales Coach agent found. Set status to active in Prompt Control.';

function stripMarkdownFences(raw: string): string {
  let s = raw.trim();
  const jsonBlock = /^```(?:json)?\s*\n?([\s\S]*?)\n?```\s*$/;
  const m = s.match(jsonBlock);
  if (m) s = m[1].trim();
  return s;
}

export async function POST(request: NextRequest) {
  let body: { transcript?: string; sessionType?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const transcript = body.transcript;
  const sessionType = body.sessionType;

  if (transcript === undefined || transcript === null) {
    return NextResponse.json(
      { error: 'transcript is required' },
      { status: 400 }
    );
  }
  if (sessionType === undefined || sessionType === null || typeof sessionType !== 'string') {
    return NextResponse.json(
      { error: 'sessionType is required' },
      { status: 400 }
    );
  }
  if (!VALID_SESSION_TYPES.includes(sessionType as (typeof VALID_SESSION_TYPES)[number])) {
    return NextResponse.json(
      { error: 'sessionType must be one of: outreach_15, outreach_30, discovery_15, discovery_30' },
      { status: 400 }
    );
  }

  let systemPrompt: string | null;
  try {
    systemPrompt = await getActiveSpinCoachPrompt();
  } catch (err) {
    console.error('Score session: failed to fetch agent prompt', err);
    return NextResponse.json(
      { error: 'Failed to load scoring configuration' },
      { status: 500 }
    );
  }

  if (!systemPrompt) {
    return NextResponse.json(
      { error: NO_ACTIVE_AGENT_MESSAGE },
      { status: 404 }
    );
  }

  const template = SCORING_PROMPTS[sessionType];
  if (!template) {
    return NextResponse.json(
      { error: 'Invalid session type' },
      { status: 400 }
    );
  }
  const userMessage = template.replace('{{TRANSCRIPT}}', String(transcript));

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Scoring service is not configured' },
      { status: 500 }
    );
  }

  const client = new Anthropic({ apiKey });
  let responseText: string;
  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    });
    const block = response.content.find((c) => c.type === 'text');
    responseText = block && 'text' in block ? block.text : '';
  } catch (err) {
    console.error('Score session: Anthropic API error', err);
    return NextResponse.json(
      { error: 'Scoring request failed. Please try again.' },
      { status: 500 }
    );
  }

  const stripped = stripMarkdownFences(responseText);
  let scorecard: unknown;
  try {
    scorecard = JSON.parse(stripped);
  } catch {
    console.error('Score session: invalid JSON from model');
    return NextResponse.json(
      { error: 'Scoring response could not be parsed' },
      { status: 500 }
    );
  }

  return NextResponse.json(scorecard);
}
