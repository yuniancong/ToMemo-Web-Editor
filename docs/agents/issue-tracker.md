# Issue tracker: Local Markdown

Specifications and issues live under `.scratch/` in this repository.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- The product specification is `.scratch/<feature-slug>/PRD.md`.
- Implementation tickets are consolidated in the repository-root `tickets.md` in dependency order.
- `Status:` uses the vocabulary in `triage-labels.md`.
- There is no remote tracker and no pull-request request surface.

## Skill operations

When a skill says to publish or fetch an issue, read or write the corresponding local Markdown document. Work the frontier: a ticket is available when all tickets named under `Blocked by` are complete.

