# ToMemo Web Editor

## Agent skills

### Issue tracker

Work is tracked as local Markdown under `.scratch/`; there is no remote issue tracker or PR request surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the five default Matt Pocock triage labels. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context project. Read `CONTEXT.md` and relevant ADRs in `docs/adr/` before changing behavior. See `docs/agents/domain.md`.

## Product guardrails

- Treat real ToMemo exports as the highest-authority technical specification.
- Treat official documentation at `https://tomemo.top/` as the product-behavior specification.
- Never invent fields in the final ToMemo export.
- Preserve unknown imported fields unless the user explicitly removes them.
- Keep configuration processing local to the browser; do not add telemetry or remote AI calls.
- A successful browser export is provisional until a real ToMemo mobile import succeeds.

