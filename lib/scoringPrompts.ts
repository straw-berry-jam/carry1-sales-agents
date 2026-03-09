/**
 * SPIN scoring prompt templates for the score-session API.
 * Each prompt describes session type and duration, includes {{TRANSCRIPT}},
 * and instructs the model to return only valid JSON (no preamble, no markdown).
 * Calibration differs by session type per spec (SEI-27).
 */

/**
 * Fallback rubric used when no evaluation_criteria documents are found in the KB.
 * Ensures scoring never runs with zero rubric context. Import and use in score-session route.
 */
export const FALLBACK_RUBRIC = `EVALUATION CRITERIA (fallback — no KB docs found)

Situation (1-5): Did the rep establish context clearly? Strong scores for specific, relevant background (role, company, initiative). Penalize vague or missing context. Commentary must reference a specific moment in the transcript.

Problem (1-5): Did the rep uncover or acknowledge a clear problem/pain? Strong scores for a well-articulated problem tied to the situation. Penalize skipping problem or multiple shallow problems. Reward depth on one core problem.

Implication (1-5): Did the rep explore consequences or stakes of the problem? Strong scores for clear "so what" — cost, risk, or impact. Penalize missing or superficial implication. In short sessions this may be partial.

Need-payoff (1-5): Did the rep connect to value, capability, or next step? Strong scores for explicit link to solution value or clear next step. In outreach/short sessions this may be light; in discovery it should be present.

Overall (1-5): Average the four dimensions with professional judgment. Weight dimensions per session type (e.g. outreach prioritizes S+P).`;

const OUTPUT_SCHEMA = `
Return ONLY a valid JSON object with this exact structure. No preamble, no markdown, no explanation.
{
  "scores": {
    "situation": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment from the transcript>" },
    "problem": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "implication": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "need_payoff": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "overall": <1-5>
  },
  "strengths": ["<specific thing they did well>", "<specific thing they did well>"],
  "growth_areas": ["<specific area to work on with a concrete suggestion>", "<specific area with concrete suggestion>"],
  "next_step_quality": "Yes | Partial | No",
  "next_step_note": "<brief note>",
  "headline": "<one sentence summary of the session, used as scorecard subheading>"
}
Scores are integers 1-5. Provide exactly 2 strengths and 2 growth_areas. Headline must be one sentence.`;

export const SCORING_PROMPTS: Record<string, string> = {
  outreach_15: `You are scoring a 15-minute SPIN outreach practice session. Session type: outreach; duration: 15 minutes. Expectations: Situation and Problem are the priority. Implication is lightly penalized if underdeveloped. Need-payoff is not expected in this short outreach window.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  outreach_30: `You are scoring a 30-minute SPIN outreach practice session. Session type: outreach; duration: 30 minutes. Expectations: All four SPIN elements (Situation, Problem, Implication, Need-payoff) are expected. Implication and Need-payoff should be developed; score accordingly if they are missing or shallow.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  discovery_15: `You are scoring a 15-minute SPIN discovery practice session. Session type: discovery; duration: 15 minutes. Expectations: Tight, focused Situation. Deep on one core problem rather than many. Reward depth over breadth. Implication and Need-payoff may be partial in this window.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  discovery_30: `You are scoring a 30-minute SPIN discovery practice session. Session type: discovery; duration: 30 minutes. Expectations: Full development of all four SPIN elements. Need-payoff must explicitly connect to SEI capability or value. Score accordingly if any element is missing or weak.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,
};

/** Valid sessionType values for the score-session API. */
export const VALID_SESSION_TYPES = ['outreach_15', 'outreach_30', 'discovery_15', 'discovery_30'] as const;
export type SessionType = (typeof VALID_SESSION_TYPES)[number];
