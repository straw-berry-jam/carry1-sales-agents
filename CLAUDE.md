# [Project Name] Project Constitution

---

## How to Customize This Constitution

This is a **template constitution** for the spec-driven development starter kit. When copying this kit to a new project:

1. **Replace `[Project Name]`** in the title with your project name.
2. **Search for `[PLACEHOLDER]`** — Every placeholder marks content you must fill in for your project.
3. **Tech Stack Anchoring** — Replace the placeholder table with your actual stack (language, framework, testing, build, data).
4. **Domain Model** — Replace with your project's core entities and flows.
5. **Directory Contract** — Adjust the table to match your project's conventions (e.g., Rails uses `app/`, Node uses `src/`).
6. **Gotchas** — Add project-specific pitfalls, legacy quirks, and domain gotchas.
7. **Core Principles** — Keep the spec-driven and TDD principles; add or adjust principles specific to your architecture (e.g., multi-tenancy, authorization).
8. **Code Style** — Update to match your language and toolchain (RuboCop, ESLint, etc.).
9. **Architectural Constraints** — Adjust for your architecture style (monolith, microservices, etc.).

**Reference**: See [GUIDE.md](GUIDE.md) for the full spec-driven process.

---

## Core Principles

### I. Non-Technical Founder Mode

This project is led by a non-technical founder. ALL AI interactions must:

**Decision Making**:
- AI makes technical decisions with clear business reasoning
- Present options only when business tradeoffs matter (cost, time, risk)
- Default to industry best practices unless there's a specific business reason not to
- Explain "why" in business terms: time to build, cost implications, user experience impact, business risk

**Communication Style**:
- Avoid unexplained jargon — translate technical terms to business concepts
- When technical terms are necessary, explain them in parentheses
- Focus on business impact: "This makes the app faster" not "This reduces query time by 200ms"
- Provide specific recommendations, not open-ended technical questions
- Flag risks proactively before they become problems

**Question Guidelines**:
- Ask BUSINESS questions: "Should users be able to delete their account or just deactivate?"
- Do NOT ask TECHNICAL questions: "Should we use PostgreSQL or MongoDB?"
- Explain technical tradeoffs in business terms when presenting options

**Examples of Good Communication**:
✅ "I'll add secure login (like Gmail uses). Takes 2 hours to implement."
❌ "Should we use JWT or session-based auth?"

### II. Spec-Driven Development (SDD)

All features and significant architecture decisions must be specified **before** implementation.

- **No code without a spec** — Every feature has a spec in `specs/features/`; every major architecture decision has a record in `specs/architecture/`.
- **Specs are the contract** — Implementation must fulfill the spec. The spec defines *what* and *why*, not *how*.
- **Specs evolve** — When requirements change, update the spec before or alongside the code.

**Source**: [GUIDE.md](GUIDE.md)  
**Verification**: Spec exists and is Approved before implementation; code review checks spec alignment.

### III. Linear Integration

Features are traced to Linear tickets for planning and commit linking.

- **Spec naming**: `specs/features/{TICKET-ID}-{feature-slug}.md` (e.g., `ENG-123-dark-mode.md`)
- **Spec frontmatter**: Include `linear` (ticket URL) and `ticket` (ticket ID)
- **Commit format**: `{TICKET-ID} Short description`
- **Branch naming**: `{ticket-id}-{short-description}` or `{ticket-id}/{description}`

**Source**: [GUIDE.md](GUIDE.md) — Linear Integration section  
**Verification**: Feature specs reference Linear ticket; commits and branches include ticket ID.

### IV. Test Discipline (TDD Enforced)

⚠️ **TDD (Test-Driven Development) Enforced**

All new features must follow TDD Red-Green-Refactor cycle:

1. **🔴 Write test first** — Before any implementation code, there must be a failing test
2. **🟢 Minimal implementation** — Only write the minimum code to make the test pass
3. **🟡 Refactor** — Refactor after test passes; keep code clean

**Test Framework**: [PLACEHOLDER: e.g., RSpec, Jest, pytest]  
**Test Location**: [PLACEHOLDER: e.g., `spec/`, `__tests__/`, `tests/`]  
**Coverage Requirement**: New code ≥ 80%; core business logic 100%  
**TDD Verification**: Git history shows tests precede implementation

### V. [PLACEHOLDER: Project-Specific Principle]

[Add principles specific to your project, e.g., multi-tenancy, authorization, async operations, feature flags. Follow the same format: principle statement, source, verification.]

### VI. [PLACEHOLDER: Additional Principle if Needed]

[Optional. Add more principles as needed.]

### VII. Learning from Bugs

When a bug recurs, add **automated prevention**, not just documentation. Aim for continuous improvement toward seamless agentic development.

**Principles**:
- **Automate over document** — When a bug is fixed, add a check or script that prevents it from recurring. Documentation (Gotchas, BUG-REGISTRY) is necessary but not sufficient.
- **Systematic over one-off** — Prefer scripts, CI steps, and command integrations that run automatically. Avoid manual steps that humans must remember.
- **Learn and improve** — Each bug fix should make the system more robust. Track patterns in `specs/bugs/` and BUG-REGISTRY; add automated guards for recurring issues.

**Process**:
1. **Fix the bug** — Resolve the immediate issue.
2. **Document** — Add to Gotchas and BUG-REGISTRY.
3. **Automate** — Add a verification script, CI step, or command integration so the same failure cannot reach users again.
4. **Integrate** — Wire the automation into implement, deploy, and CI so it runs without manual invocation.

**Example**: BUG (styling not applied) → `verify-build-health.sh` checks CSS output → `ensure-build-health.sh` auto-fixes and retries → wired into implement, deploy, and CI.

**Verification**: Recurring bugs have corresponding automated checks; implement and deploy commands run them before declaring complete.

---

## Domain Model

[PLACEHOLDER: Describe your project's core domain. Include:]

- **Core entities** and their relationships
- **Key domain flows** (user journeys, state machines)
- **Important domain terms** and their meanings
- **Multi-tenancy or scoping** if applicable

**Example structure** (replace with your domain):

```
[Entity A] → [Entity B] → [Entity C]
Key concepts: [term1], [term2], [term3]
[State machines or workflows if applicable]
```

---

## Code Style

Follow [PLACEHOLDER: language/framework] conventions and repository lint rules.

**Naming Convention**: [PLACEHOLDER: e.g., snake_case files, CamelCase classes, snake_case methods]  
**Formatting**: [PLACEHOLDER: e.g., RuboCop, ESLint, Prettier — config file location]  
**Toolchain**: [PLACEHOLDER: e.g., `bundle exec rubocop`, `npm run lint`]

---

## Architectural Constraints

**Architecture Style**: [PLACEHOLDER: e.g., Rails monolith with MVC + service layer, Next.js app router, microservices]

**Module Boundaries**:

- [PLACEHOLDER: Describe where different concerns live, e.g., controllers orchestrate, models encapsulate persistence, services own workflows]
- **Dependency Rules**: [PLACEHOLDER: e.g., Controllers → Services/Models; Services → Models. Avoid cross-layer coupling.]

---

## Tech Stack Anchoring

**SDD specs and plans for this project must follow this tech stack**:

| Category | Technology | Version Constraint | Non-replaceable |
|----------|------------|--------------------|-----------------|
| Language | [PLACEHOLDER] | [PLACEHOLDER] | ✓ / — |
| Framework | [PLACEHOLDER] | [PLACEHOLDER] | ✓ / — |
| Testing | [PLACEHOLDER] | [PLACEHOLDER] | ✓ / — |
| Build | [PLACEHOLDER] | [PLACEHOLDER] | ✓ / — |
| Data | [PLACEHOLDER] | [PLACEHOLDER] | ✓ / — |

---

## Specs Directory Structure

**Standard layout** (do not change unless project requires it):

```
specs/
├── templates/
│   ├── FEATURE_TEMPLATE.md      # Copy for new features
│   └── ARCHITECTURE_TEMPLATE.md # Copy for new ADRs
├── features/                    # Feature specifications ({TICKET-ID}-{slug}.md)
└── architecture/                # Architecture decision records
```

**Reference**: [GUIDE.md](GUIDE.md) — Quick Reference

---

## Directory Contract

**New code must be placed in locations conforming to these conventions**:

| Code Type | Standard Location | Naming Convention |
|-----------|-------------------|-------------------|
| [PLACEHOLDER: e.g., Business Logic] | [PLACEHOLDER: e.g., `app/services/`] | [PLACEHOLDER] |
| [PLACEHOLDER: e.g., Data Model] | [PLACEHOLDER: e.g., `app/models/`] | [PLACEHOLDER] |
| [PLACEHOLDER: e.g., API Endpoint] | [PLACEHOLDER: e.g., `app/controllers/`] | [PLACEHOLDER] |
| [PLACEHOLDER: e.g., UI Components] | [PLACEHOLDER: e.g., `app/components/`] | [PLACEHOLDER] |
| Test Code | [PLACEHOLDER: e.g., `spec/`] | [PLACEHOLDER: e.g., `*_spec.rb`] |
| Config File | [PLACEHOLDER: e.g., `config/`] | [PLACEHOLDER] |

---

## Gotchas (Project-Specific)

[PLACEHOLDER: List pitfalls, legacy behavior, and domain quirks that developers must know. Examples:]

1. **[PLACEHOLDER: e.g., Multi-tenancy]** — Always scope to [PLACEHOLDER: e.g., current_company]
2. **[PLACEHOLDER: e.g., State machines]** — [PLACEHOLDER: Describe callback or transition behavior]
3. **[PLACEHOLDER: e.g., Time zones]** — [PLACEHOLDER: How dates/times are stored and displayed]
4. [Add more as needed]

---

## Next.js / Dev & Build Prevention (If Using Next.js)

**Page not loading / "localhost unable to handle this request"** — Port conflicts, multiple dev servers (EMFILE), stale processes.
- Use `npm run dev:safe` or `bash scripts/reset-dev-server.sh` then `npm run dev`
- Run `npm run verify:dev` to confirm dev server is responding before declaring success

**Webpack cache ENOENT / build corruption** — Corrupted .next cache, incremental builds in bad state.
- Add to `next.config.js`: `webpack: (config, { dev }) => { if (dev) config.cache = false; return config; }`
- Use `npm run ensure:build` before deploy; when build fails, run `bash scripts/fix-webpack-error.sh` then retry
- Never deploy a branch that doesn't build

**Styling not applied** — Build cache corruption; brand tokens missing from compiled CSS.
- Run `npm run ensure:build` before implementation complete or deploy
- `verify-build-health.sh` checks .next/static/css for brand tokens; `ensure-build-health.sh` auto-fixes and retries
- On Vercel: redeploy with "Clear build cache" checked

**Reference**: [docs/NEXTJS-DEV-BUILD-SETUP.md](docs/NEXTJS-DEV-BUILD-SETUP.md)

---

## Governance

### Constitution Priority

1. This constitution is the highest guidance for SDD workflow
2. All specs must conform to constitution principles
3. All plans must use constitution-anchored tech stack
4. All tasks must comply with directory contract

### Amendment Procedure

- Modifying the constitution requires documenting change reasons
- Must update all templates depending on this constitution
- Version numbers follow semantic versioning

**Version**: 1.0.0 | **Created**: [PLACEHOLDER: Date] | **Source**: Spec-Driven Starter Kit
