# Tickets: ToMemo Web Editor

Build a local-first visual editor and AI content-package bridge for real ToMemo configurations. Source specification: `.scratch/tomemo-web-editor/PRD.md`.

Work the **frontier**: any ticket whose blockers are complete may start.

## 1. Import, inspect, validate, and safely export a real configuration

**What to build:** A runnable desktop-first web application that imports either supplied ToMemo configuration, renders Categories and Memos in a three-pane interface, validates confirmed version `1.0` invariants, preserves unknown fields, and downloads a safe ToMemo JSON export.

**Blocked by:** None — can start immediately.

- [x] Import valid JSON by file picker and drag/drop.
- [x] Reject malformed or structurally invalid files with precise errors.
- [x] Render Category colors/counts, Memo summaries, and selected Memo details.
- [x] Preserve unknown properties and stable existing values in a no-edit round trip.
- [x] Refresh only export metadata required by the observed format.
- [x] Verify the codec with sanitized derivatives of both real exports.
- [x] Produce a successful production build.

## 2. Manually edit Categories and Memos

**What to build:** Users can create, edit, copy, move, and safely delete Categories and Memos, insert verified dynamic variables, and reverse committed changes.

**Blocked by:** 1. Import, inspect, validate, and safely export a real configuration.

- [ ] Create, rename, recolor, reorder, and safely delete Categories.
- [ ] Create, edit, duplicate, move, and delete Memos.
- [ ] Generate uppercase UUIDs and UTC timestamps consistent with real exports.
- [ ] Insert `{{CLIPBOARD}}` and `{{CURSOR}}` without altering unknown tokens.
- [ ] Require an explicit disposition for Memos in a deleted Category.
- [ ] Support undo and redo for committed changes.

## 3. Search, order, select, and batch-edit content

**What to build:** Users can locate and organize large Memo sets through search, temporary and applied sorting, manual group reordering, Mac-style selection, direct drag/drop, and reversible batch commands.

**Blocked by:** 2. Manually edit Categories and Memos.

- [ ] Search titles, content, and Category names.
- [ ] Sort by original order, title, creation time, and update time in either direction.
- [ ] Keep view sorting non-mutating until explicitly applied.
- [ ] Support click, Command-click, Shift-click, Command-A, and rubber-band selection.
- [ ] Support group move, Option-copy, and manual group reorder by drag/drop.
- [ ] Support batch move, copy, delete, title affixes, text replacement, and AI-package export.

## 4. Import AI content packages with conflict preview

**What to build:** Users can paste or upload a strict AI content package, repair parse failures, preview its effects, choose an existing or new target Category, resolve duplicates, and commit a valid ToMemo merge.

**Blocked by:** 2. Manually edit Categories and Memos.

- [ ] Parse canonical JSON and JSON wrapped in a Markdown code fence.
- [ ] Display exact parse and schema errors in an editable source view.
- [ ] Preview package metadata, target Category, items, and dynamic variables.
- [ ] Create or select the target Category during import.
- [ ] Distinguish exact, title-only, and content-only conflicts.
- [ ] Support skip, add, overwrite, title-only update, and content-only update.
- [ ] Generate ToMemo internals only when the import is committed.

## 5. Persist workspaces and install the offline application

**What to build:** Users can keep multiple local editing Workspaces, recover from refreshes, manage snapshots and dirty state, adjust appearance, and install or statically deploy the offline-capable application.

**Blocked by:** 2. Manually edit Categories and Memos.

- [ ] Persist multiple Workspaces and preferences in browser-local structured storage.
- [ ] Restore work after refresh and show unsaved/export status.
- [ ] Create and restore import/export snapshots.
- [ ] Clear selected or all local data.
- [ ] Support resizable panes, compact/card views, responsive layout, and system/light/dark themes.
- [ ] Provide an installable PWA with no remote runtime dependencies.

## 6. Deliver the ChatGPT Projects knowledge base and mobile acceptance package

**What to build:** A self-contained ChatGPT Projects knowledge base and a final acceptance package prove the complete workflow from AI generation through browser merge to a real mobile ToMemo import.

**Blocked by:** 3. Search, order, select, and batch-edit content; 4. Import AI content packages with conflict preview; 5. Persist workspaces and install the offline application.

- [ ] Provide project instructions, schema reference, examples, failure cases, and self-check checklist.
- [ ] Provide canonical AI package fixtures and an import walkthrough.
- [ ] Report structural differences before final ToMemo export.
- [ ] Run codec, interaction, persistence, and production-build verification.
- [ ] Generate an acceptance configuration containing ordinary, empty-content, and verified dynamic-variable Memos.
- [ ] Record the real mobile import result and any follow-up codec correction.
