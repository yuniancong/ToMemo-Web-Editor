# ADR 0002: Real exports define the ToMemo codec

## Status

Accepted

## Decision

The ToMemo codec is derived from user-supplied real exports. Official documentation confirms product concepts but does not publish a complete backup JSON schema. The editor therefore validates confirmed fields, preserves unknown fields, refuses to invent final-export fields, and warns on unverified configuration versions.

Real-device testing confirmed merge-on-import behavior: matching IDs overwrite existing records and new IDs add independent records. The editor may therefore create a valid version `1.0` configuration from an empty Workspace, provided it generates conforming IDs, timestamps, colors, priorities, and Category references.

## Consequences

The AI interchange schema remains separate from the ToMemo configuration schema. Browser export is not considered fully compatible until the generated file succeeds in a real mobile-app round trip.
