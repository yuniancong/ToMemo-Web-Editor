# ADR 0001: Local-first static web application

## Status

Accepted

## Decision

Build the editor as a static, installable web application. All parsing, editing, persistence, AI-package conversion, validation, and export happen in the browser. The first version has no server, account, telemetry, database, remote AI call, or API key.

## Consequences

The application can run offline and can be deployed to static hosting. Browser-local persistence stores workspaces and history. AI content is generated outside the application and enters through a validated interchange format.

