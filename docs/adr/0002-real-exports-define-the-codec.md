# ADR 0002: Real exports define the ToMemo codec

## Status

Accepted

## Decision

The ToMemo codec is derived from user-supplied real exports. Official documentation confirms product concepts but does not publish a complete backup JSON schema. The editor therefore validates confirmed fields, preserves unknown fields, refuses to invent final-export fields, and warns on unverified configuration versions.

## Consequences

The AI interchange schema remains separate from the ToMemo configuration schema. Browser export is not considered fully compatible until the generated file succeeds in a real mobile-app round trip.

