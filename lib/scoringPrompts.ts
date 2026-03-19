/**
 * CARRY1 scoring prompt templates for the score-session API.
 * Each prompt describes session type and duration, includes {{TRANSCRIPT}},
 * and instructs the model to return only valid JSON (no preamble, no markdown).
 */

export const FALLBACK_RUBRIC = `EVALUATION CRITERIA (fallback — no KB docs found)

Preparation & Research (1-5): Did the rep walk in knowing the buyer's business? Strong scores for specific, accurate details and a clear point of view before discovery starts. Penalize generic questions that show no prior research.

Personal Connection (1-5): Did the rep find a real human entry point before pitching? Strong scores for something personal, warm, and specific. Penalize going straight to the pitch with no warmup.

Storytelling (1-5): Did the rep use a personal or client-led story relevant to the buyer? Strong scores for specific stories connected to the platform's mission or value. Penalize facts-and-features only.

Discovery & Qualification (1-5): Did the rep ask below-the-surface questions? Did they identify near-term vs. longer-cycle? Strong scores for getting the buyer talking about challenges in their own words. Penalize surface-level questions and too much talking.

Reading the Room & EQ (1-5): Did the rep adapt in real time? Was their language confident and direct? Strong scores for pivoting when the conversation shifts and answering objections cleanly. Penalize weak hedging language and over-explaining.

Creating Tension & Closing (1-5): Did the rep catch the buying signal and move confidently toward a close? Strong scores for specific next steps with a timeline. Penalize missing the signal or leaving next steps vague.`;

const OUTPUT_SCHEMA = `
Return ONLY a valid JSON object with this exact structure. No preamble, no markdown, no explanation.
{
  "scores": {
    "preparation": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment from the transcript>" },
    "connection": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "storytelling": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "discovery": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "eq": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
    "closing": { "score": <1-5>, "commentary": "<2-3 sentences grounded in a specific moment>" },
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
  outreach_15: `You are scoring a 15-minute CARRY1 Method outreach practice session. Session type: outreach; duration: 15 minutes. Expectations: Preparation, Personal Connection, and Storytelling are the priority. Discovery and Closing are lightly penalized if underdeveloped in this short window.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  outreach_30: `You are scoring a 30-minute CARRY1 Method outreach practice session. Session type: outreach; duration: 30 minutes. Expectations: All six CARRY1 categories are expected. Discovery and Closing should be developed — score accordingly if missing or shallow.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  discovery_15: `You are scoring a 15-minute CARRY1 Method discovery practice session. Session type: discovery; duration: 15 minutes. Expectations: Strong on Preparation, Personal Connection, and Discovery. Reading the Room and Closing may be partial in this window.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,

  discovery_30: `You are scoring a 30-minute CARRY1 Method discovery practice session. Session type: discovery; duration: 30 minutes. Expectations: Full development of all six CARRY1 categories. Closing must include a specific next step. Score accordingly if any category is missing or weak.

${OUTPUT_SCHEMA}

Transcript to score:
{{TRANSCRIPT}}`,
};

/** Valid sessionType values for the score-session API. */
export const VALID_SESSION_TYPES = ['outreach_15', 'outreach_30', 'discovery_15', 'discovery_30'] as const;
export type SessionType = (typeof VALID_SESSION_TYPES)[number];
