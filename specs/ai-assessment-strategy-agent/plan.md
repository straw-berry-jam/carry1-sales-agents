## 📋 Implementation Plan: AI Assessment & Strategy Agent

**Branch**: `SEI-38-ai-assessment-strategy-agent`
**Spec**: [specs/features/SEI-38-ai-assessment-strategy-agent.md](../features/SEI-38-ai-assessment-strategy-agent.md)
**Exploration**: Not yet run (not needed — follows established SPIN pattern)
**Design**: Not yet run (mirrors SPIN design with learning-focused copy)
**Estimated Timeline**: 1-2 days — Follows existing SPIN architecture exactly

### What We're Building (Summary)

We're creating a second AI agent — the "AI Assessment & Strategy Agent" — that lives at `/guide/assessment`. Unlike the SPIN Sales Coach (which role-plays as a buyer), this agent **teaches** CARRY1 consultants about the AI Assessment product through conversation. At the end, users see a **learning summary** with confidence indicator instead of a performance score.

Think of it as the difference between a practice test (SPIN) and a study guide (Assessment).

### Technical Approach

We'll build this by copying the SPIN architecture exactly, then adapting the copy and output format:

**Phase 1: Manual Setup** (30 min) — You'll do this in Supabase and ElevenLabs
- Create the agent row in the database
- Create the ElevenLabs voice agent
- Add environment variables

**Phase 2: Onboarding Page** (1 hour)
- Replace the placeholder at `/guide/assessment` with a form collecting name, email, and knowledge level
- Same design as SPIN onboarding, different copy

**Phase 3: Session Page** (2 hours)
- Voice conversation page with 5-minute demo timer
- Uses the new Assessment agent IDs
- Fetches transcript when session ends (same polling as SPIN)

**Phase 4: Summary Page** (2 hours)
- Learning summary instead of scorecard
- Four learning dimension cards (Product Knowledge, Value Articulation, etc.)
- Confidence indicator instead of numerical score

**Phase 5: Summary API** (1.5 hours)
- Mirrors `/api/score-session` but returns learning summary format
- Uses same KB retrieval pattern (with TODO for adding eval criteria doc later)

### Constitution Check

- ✅ **Follows Spec-Driven Development**: Spec exists at SEI-38
- ✅ **Uses approved tech stack**: Next.js App Router, TypeScript, Tailwind, Anthropic Claude, ElevenLabs
- ✅ **Follows Directory Contract**: Pages in `app/guide/assessment/`, API in `app/api/`
- ✅ **Adding new agent**: Agent row uses `agent_type = 'Guide'` (pre-set, not null) per CLAUDE.md Gotchas
- ⚠️ **Exception needed**: None

### Files That Will Be Created/Modified

**User-Facing Changes**:
- `app/guide/assessment/page.tsx` — Onboarding form (name, email, knowledge level)
- `app/guide/assessment/session/page.tsx` — Voice/text conversation with 5-min timer
- `app/guide/assessment/summary/page.tsx` — Learning summary with 4 dimensions + confidence

**Behind-the-Scenes**:
- `app/api/assessment-summary/route.ts` — Generates learning summary from transcript

**Database (Manual)**:
- New row in `agents` table with UUID

**Environment Variables (Manual)**:
- `ASSESSMENT_COACH_ID` — UUID from agents table
- `ELEVENLABS_ASSESSMENT_AGENT_ID` — ID from ElevenLabs dashboard

**Files NOT Modified**:
- `app/coach/**/*` — SPIN remains untouched
- `lib/coaching.ts` — Shared logic, no changes
- `app/api/voice-llm/**/*` — Shared infrastructure

### Dependencies

**Must Be Done First**:
1. **Supabase agent row** — Need the UUID before building pages
2. **ElevenLabs agent** — Need the agent ID for voice sessions
3. **Environment variables** — Both IDs must be in `.env.local`

**Can Build in Parallel**:
- Onboarding page and Session page can be built simultaneously
- Summary page and Summary API can be built simultaneously

**Blocks Future Work**:
- Knowledge Base eval criteria doc (added via `/admin` after implementation)

### Test Strategy

**What We'll Test**:
- **Happy path**: User completes onboarding → has 5-min voice session → sees learning summary
- **Error cases**: Missing transcript shows graceful error; API failures show retry option
- **Edge cases**: Empty transcript still generates summary; no KB docs uses fallback

**How We'll Know It Works**:
1. Navigate to `/guide/assessment` and see the onboarding form
2. Fill out form, start session, talk for a few seconds
3. End session, see "Preparing summary" loading state
4. Summary page shows all 4 dimensions with Key Takeaways
5. Confidence indicator shows Building/Developing/Strong
6. Network tab shows Assessment agent IDs (not SPIN IDs)

### Risks & Mitigations

| Risk | Impact on Business | How We'll Handle It |
|------|-------------------|---------------------|
| ElevenLabs agent setup fails | Can't test voice | Test with text mode first; voice is bonus |
| Transcript polling times out | User stuck on loading | Same retry UX as SPIN (8 attempts, then error) |
| No KB eval criteria doc | Summary may be generic | API has fallback; doc added via admin later |
| Wrong agent ID used | Session connects to SPIN instead | Explicit env var check on page load |

### Implementation Phases

**Phase 0: Manual Setup** (30 min) — YOU DO THIS
1. Run SQL to create agent row in Supabase, note the UUID
2. Create ElevenLabs agent (blank prompt), note the ID
3. Add both to `.env.local` and Vercel
- **Deliverable**: Environment ready for development

**Phase 1: Onboarding Page** (1 hour)
- Replace placeholder at `/guide/assessment/page.tsx`
- Form: First Name, Email, Knowledge Level (radio buttons)
- Store in `localStorage.assessment-onboarding-data`
- Navigate to `/guide/assessment/session` on submit
- **Deliverable**: Users can fill out onboarding and start session

**Phase 2: Session Page** (2 hours)
- Create `/guide/assessment/session/page.tsx`
- 5-minute demo timer (`DEMO_LIMIT_MS = 300_000`)
- Use `ELEVENLABS_ASSESSMENT_AGENT_ID` and `ASSESSMENT_COACH_ID`
- Fetch transcript on end (same polling as SPIN)
- Write to `localStorage.assessmentTranscript`
- Navigate to `/guide/assessment/summary`
- **Deliverable**: Users can have voice conversation with Assessment agent

**Phase 3: Summary API** (1.5 hours)
- Create `/api/assessment-summary/route.ts`
- Fetch KB docs for eval criteria (with TODO comment)
- Send to Claude with learning summary prompt
- Return JSON with dimensions, covered, revisit, confidence
- **Deliverable**: API returns structured learning summary

**Phase 4: Summary Page** (2 hours)
- Create `/guide/assessment/summary/page.tsx`
- 4 learning cards: Product Knowledge, Value Articulation, Objection Handling, Competitive Positioning
- Each card: dimension name, 2-3 sentence summary, Key Takeaway
- Confidence indicator: Building / Developing / Strong
- Sections: What You Covered, Worth Revisiting
- Actions: Continue Learning / Return to Home
- **Deliverable**: Users see their complete learning summary

**Phase 5: Build Verification** (15 min)
- Run `npm run build`
- Verify zero changes to `app/coach/`
- Test end-to-end flow
- **Deliverable**: Feature complete, ready for commit

### Deployment Plan

**Feature Flag**: No — This is a new route that doesn't affect existing features.

**Database Changes**: Yes — One new row in `agents` table (manual insert via Supabase).
- Agent row uses `agent_type = 'Guide'` (pre-set in INSERT statement)
- Status set to `'active'` so it appears in Prompt Control immediately

**Environment Variables**: Yes — Two new vars needed before deployment.
- `ASSESSMENT_COACH_ID`
- `ELEVENLABS_ASSESSMENT_AGENT_ID`

**Rollback Strategy**: Delete the three new page files and API route. Remove agent row from Supabase. No data migration needed.

### Success Metrics

| Metric | What It Tells Us |
|--------|------------------|
| Build passes | Code compiles without errors |
| End-to-end flow works | Users can complete full journey |
| Correct agent IDs in network | Not accidentally using SPIN agent |
| Summary shows all 4 dimensions | API and page rendering correctly |
| Zero SPIN file changes | Existing coach unaffected |

### Timeline Breakdown

| Phase | Duration | Why This Long |
|-------|----------|---------------|
| Manual Setup | 30 min | Database + ElevenLabs dashboard work |
| Onboarding Page | 1 hour | Copy existing SPIN pattern, change copy |
| Session Page | 2 hours | Complex — voice, timer, transcript polling |
| Summary API | 1.5 hours | New API with Claude integration |
| Summary Page | 2 hours | New UI with learning card components |
| Build Verification | 15 min | Final testing and cleanup |

**Total**: 7-8 hours (1-2 days with breaks/context switches)
**Confidence**: High — Following proven SPIN architecture exactly

### What Could Make This Take Longer

- **ElevenLabs issues**: +2 hours if agent setup has problems
- **Transcript polling bugs**: +1 hour if timing differs from SPIN
- **Claude API changes**: +30 min if response format needs adjustment

### What's NOT Included

- **KB evaluation criteria document** — Added via `/admin` after implementation
- **Agent system prompt** — Set via Prompt Control after implementation
- **ElevenLabs First Message** — Configured in ElevenLabs dashboard
- **Additional Assessment dimensions** — Can be added later via KB document

### Manual Steps Required (Before Implementation)

**1. Supabase — Create Agent Row**
```sql
INSERT INTO agents (name, agent_type, business_process, status)
VALUES ('AI Assessment & Strategy Agent', 'Guide', 'Sales & BD', 'active');
```
Note the generated UUID.

**2. ElevenLabs — Create Agent**
- Go to ElevenLabs dashboard
- Create new conversational agent
- Leave system prompt blank (will use Prompt Control)
- Leave First Message blank (configure in ElevenLabs)
- Note the agent ID

**3. Environment Variables**
Add to `.env.local`:
```
ASSESSMENT_COACH_ID=<uuid-from-step-1>
ELEVENLABS_ASSESSMENT_AGENT_ID=<id-from-step-2>
```
Add same to Vercel environment variables.

### Next Steps

1. ✅ Review this plan
2. Complete manual setup steps above (Supabase + ElevenLabs + env vars)
3. When ready: Run `/implement` to start building
4. I'll create the pages and API following the phases above
