import prisma from '@/lib/prisma';
import { ASSESSMENT_BUILDER_AGENT_ID } from '@/lib/assessment-builder-retrieval';

/**
 * Loads the Assessment Builder row from `agents` (Prompt Control). Both generate-draft and
 * refine-section use `prompt` as the Anthropic `system` message when non-empty; otherwise each
 * route uses its own fallback in `lib/prompts.ts`. The seed migration fills generation-style
 * instructions; extend the stored prompt in Prompt Control if you need refine-specific rules
 * in the same field.
 */
export async function getAssessmentBuilderAgent() {
  if (!ASSESSMENT_BUILDER_AGENT_ID) {
    return null;
  }
  return prisma.agent.findUnique({
    where: { id: ASSESSMENT_BUILDER_AGENT_ID },
    select: { id: true, name: true, prompt: true },
  });
}
