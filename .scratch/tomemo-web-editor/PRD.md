# ToMemo Web Editor product specification

Status: ready-for-agent

## Problem Statement

Editing and adding large numbers of ToMemo lists and Memos on a phone is slow and cumbersome. The user needs a desktop-friendly visual editor that can load a real ToMemo export, support precise manual and batch editing, accept structured content produced by ChatGPT Projects or another AI, and export a configuration that the mobile ToMemo app can actually import. The tool must not confuse its AI interchange format with ToMemo's real configuration format.

## Solution

Create a local-first, installable web application with a macOS-like three-pane interface. A user imports a real ToMemo configuration into a local Workspace, edits Categories and Memos visually, imports validated AI content packages into an existing or new Category, previews and resolves conflicts, validates the complete configuration, and exports ToMemo version `1.0` JSON. Provide a separate ChatGPT Projects knowledge-base package that reliably produces the supported AI content-package format. Preserve unrecognized source data and verify final compatibility through a real mobile ToMemo import.

## User Stories

1. As a ToMemo user, I want to import a real ToMemo JSON export, so that I can edit my existing mobile data on a computer.
2. As a ToMemo user, I want malformed or incompatible files rejected with precise explanations, so that I do not corrupt my mobile configuration.
3. As a ToMemo user, I want unknown fields preserved, so that the editor does not erase newer ToMemo data it does not understand.
4. As a ToMemo user, I want multiple configurations opened as separate Workspaces, so that importing a second file does not overwrite unfinished work.
5. As a ToMemo user, I want each Workspace to show its source name, item counts, and dirty state, so that I know what I am editing.
6. As a ToMemo user, I want local automatic saving, so that refreshing or closing the browser does not lose my work.
7. As a ToMemo user, I want snapshots and undo/redo, so that I can recover from mistaken edits and batch actions.
8. As a ToMemo user, I want to clear browser-local data, so that I control what remains on the computer.
9. As a ToMemo user, I want a resizable three-pane interface, so that Categories, Memos, and the selected Memo editor remain visible together.
10. As a ToMemo user, I want a compact list and card view, so that I can choose the density appropriate to my task.
11. As a ToMemo user, I want light, dark, and system themes, so that the editor matches my desktop environment.
12. As a ToMemo user, I want to create, rename, recolor, reorder, and delete Categories, so that I can organize my content visually.
13. As a ToMemo user, I want Category colors rendered accurately from `RRGGBBAA`, so that visual identity remains consistent with ToMemo.
14. As a ToMemo user, I want deletion of a non-empty Category to require moving its Memos or explicitly confirming their deletion, so that I do not lose a whole group accidentally.
15. As a ToMemo user, I want to create, edit, copy, move, and delete Memos, so that all routine configuration work is possible on desktop.
16. As a ToMemo user, I want title-only and empty-content Memos preserved, so that valid real ToMemo records remain valid.
17. As a ToMemo user, I want verified dynamic variables inserted from a toolbar, so that I do not mistype `{{CLIPBOARD}}` or `{{CURSOR}}`.
18. As a ToMemo user, I want unknown `{{...}}` tokens preserved and flagged, so that the editor does not destroy future variables.
19. As a ToMemo user, I want search across titles, content, and Categories, so that I can find items quickly.
20. As a ToMemo user, I want sorting by original order, title, creation time, and update time in both directions, so that I can inspect content in useful orders.
21. As a ToMemo user, I want temporary sorting not to rewrite the export until I explicitly apply it, so that viewing data does not silently change it.
22. As a ToMemo user, I want to drag one or more Memos into a manual order, so that I can control the exported array order.
23. As a Mac user, I want click, Command-click, Shift-click, and Command-A selection, so that bulk selection follows familiar conventions.
24. As a Mac user, I want rubber-band selection from list whitespace, so that I can select a visible region quickly.
25. As a Mac user, I want selected Memos draggable as a group to a Category, so that batch moves are direct and visual.
26. As a Mac user, I want Option-drag to copy selected Memos, so that batch copying matches familiar desktop behavior.
27. As a ToMemo user, I want a batch toolbar and context menu, so that selected Memos can be moved, copied, deleted, transformed, or exported.
28. As a ToMemo user, I want batch title prefix/suffix and body text replacement, so that repetitive edits are fast.
29. As a ToMemo user, I want to export selected Memos as an AI content package, so that an AI can work on a controlled subset.
30. As an AI user, I want to paste a strict JSON content package or upload a JSON file, so that generated content enters the editor predictably.
31. As an AI user, I want JSON wrapped in a Markdown code fence accepted, so that normal ChatGPT output remains convenient.
32. As an AI user, I want parse errors to show exact locations with an editable source area, so that I can repair output without starting over.
33. As an AI user, I want an import preview, so that I can review package name, target Category, titles, content, variables, and duplicates before merging.
34. As an AI user, I want to target an existing Category, choose another Category, or create a suggested Category, so that one package is reusable across configurations.
35. As an AI user, I want complete duplicates skipped by default, so that repeated imports do not silently multiply content.
36. As an AI user, I want title conflicts and content conflicts distinguished, so that I can choose skip, add, overwrite, title-only update, or content-only update.
37. As a ToMemo user, I want the editor to generate IDs, timestamps, Category references, and priority values, so that AI never needs to fabricate ToMemo internals.
38. As a ToMemo user, I want a validation report before export, so that missing fields, duplicate IDs, invalid colors, invalid dates, and orphan Category references are found.
39. As a ToMemo user, I want a structural difference report from the imported source, so that I understand what will change.
40. As a ToMemo user, I want `exportDate` refreshed while existing IDs and timestamps remain stable, so that exports are predictable.
41. As a ToMemo user, I want the final file to retain ToMemo version `1.0` and its confirmed top-level shape, so that it remains importable.
42. As a ToMemo user, I want a local download with an informative filename, so that I can identify the correct configuration on my phone.
43. As a ChatGPT Projects user, I want a ready-to-upload knowledge base, so that ChatGPT reliably creates supported content packages.
44. As a ChatGPT Projects user, I want project instructions, schema rules, correct examples, incorrect examples, and a self-check checklist, so that generated packages require fewer repairs.
45. As a product owner, I want the codec tested against both supplied real exports, so that implementation is based on observed behavior.
46. As a product owner, I want browser-level tests of the main workflows, so that interaction behavior is verified from the user's perspective.
47. As a product owner, I want a generated acceptance fixture imported into the real ToMemo mobile app, so that completion means genuine compatibility rather than JSON that only looks plausible.

## Implementation Decisions

- Build a static, installable, offline-capable web application with no backend, login, telemetry, remote database, or AI API call.
- Use a desktop-first, macOS-like, resizable three-pane layout with responsive small-screen fallback.
- Keep a strict separation between the ToMemo configuration codec and the tool-owned AI content-package codec.
- Treat supplied real exports as the serialization authority and official ToMemo documentation as the product-behavior authority.
- Model confirmed version `1.0` fields while preserving all unknown properties during import, edit, persistence, and export.
- Reject unsafe edits for unverified configuration versions unless the user explicitly confirms compatibility risk.
- Generate uppercase UUIDs for new Categories and Memos. Generate UTC ISO 8601 timestamps for new and updated records. Refresh `exportDate` on export.
- Preserve existing IDs and timestamps unless the user operation semantically changes them. Do not mimic ToMemo's observed unstable historical `createdAt` fallback behavior.
- Preserve original array order until explicit reorder or “apply current sorting.” Treat view sorting as non-mutating.
- Support strict AI package JSON via paste and file input, including extraction from a Markdown JSON code fence.
- Keep AI package target suggestions human-readable and resolve them to real Category IDs only during confirmed import.
- Provide a transaction preview for destructive, batch, merge, and AI-import operations. Every committed operation participates in undo/redo.
- Persist Workspaces, snapshots, and preferences in browser-local storage suitable for structured data.
- Use verified literal dynamic-variable tokens `{{CLIPBOARD}}` and `{{CURSOR}}`; preserve unknown tokens.
- Do not include sensitive-data detection or masking in the first version.
- Deliver the ChatGPT Projects knowledge base alongside the application as a versioned, self-contained folder.

## Testing Decisions

- Test externally observable behavior and serialized outputs rather than component internals.
- Use the configuration codec as the principal deterministic seam: both supplied exports must parse, round-trip without unintended loss, and produce precise validation errors for controlled corruption.
- Use browser-level workflow tests as the highest automated seam: import, visualize, edit, select, batch, reorder, AI-import, validate, persist, restore, and export.
- Use focused unit tests only for logic that is difficult to exercise clearly through the browser seam, such as duplicate classification and stable ordering.
- Compare JSON semantically while also checking required field names, value formats, unknown-field preservation, stable identities, and array order.
- Keep user-supplied exports as local test fixtures excluded from distributable builds when they contain personal content; derive sanitized fixtures for committed tests.
- The final acceptance test is a manual round trip through the real ToMemo mobile app using a generated fixture containing ordinary, empty-content, and verified dynamic-variable Memos.

## Out of Scope

- Built-in AI chat or direct calls to ChatGPT/OpenAI or another model provider.
- Accounts, cloud sync, collaborative editing, server storage, or analytics.
- Sensitive-content detection, masking, credential scanning, or export blocking.
- Editing ToMemo short-term memory, action-library, image, file, keyboard, iCloud, or other configuration data not present in the supplied export schema.
- Claiming support for unknown dynamic-variable syntax or configuration versions without a real export.
- Automatically publishing or hosting the application on the public internet.

## Further Notes

Observed real-file facts include uppercase UUIDs, `RRGGBBAA` colors, UTC ISO timestamps, referential integrity through `categoryId`, verified dynamic-variable literals, Category rename identity preservation, and Category-grouped placement of newly exported Memos. Official documentation confirms that every Memo belongs to a list, Category user attributes are name and color, Memo behavior includes title/content/list membership, and subfields are derived from content delimiters.

The initial sample sources remain external to the repository. Tests must use sanitized derivatives so no private Memo content enters Git history.
