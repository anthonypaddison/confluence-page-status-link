# Dependency notes

Checked 2 September 2026 with the committed lockfile. This is a point-in-time note, not an ongoing security-monitoring commitment.

## Advisory disposition

`npm audit` reported **0 critical, 0 high, 8 moderate package entries**. The eight entries trace to one advisory: [GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq), missing bounds checks in `uuid` v3/v5/v6 **methods** when a caller supplies an output buffer.

The affected transitive package is `@atlaskit/react-ufo/node_modules/uuid` in the Forge/Atlaskit SDK dependency tree. It is an installed production dependency, not merely development tooling. This app does not import `uuid`, pass UUID output buffers, or expose a buffer/offset input. The inspected `@atlaskit/react-ufo` UUID callers use `v4`, which is not the affected method. No actionable path from this app's inputs to the affected APIs was found; this is not an audit-zero result or a guarantee about future SDK versions.

The audit's suggested remediation downgrades the supported Forge SDK releases. No forced fix, override or downgrade was applied. Re-run `npm audit` before deploying a fork and assess any new findings; these notes do not clear new or unrelated advisories.

## Licence provenance

The repository contains project source, tests and documentation, not vendored SDK code, fonts, image assets, compiled bundles or package tarballs. Inspection of its source history found no copied substantial third-party implementation or sample requiring a separate source notice. Original project material is MIT-licensed; this does **not** relicense dependencies or grant Atlassian trademark rights.

The lockfile points to the public npm registry. React is MIT; many Atlaskit components use Apache-2.0 and other permissive licences. Forge packages including `@forge/react` and `@forge/bridge` use their own `LICENSE.txt`, which refers to the [Atlassian Developer Terms](https://developer.atlassian.com/platform/marketplace/atlassian-developer-terms/). Dependency notices stay with those packages. Not every lockfile entry declares its licence: `@atlaskit/forge-react-types` includes an Apache-2.0 notice, while `@atlaskit/navigation-system` lacks a package-level licence declaration/file in the inspected installation. Neither is vendored or relicensed here. Check upstream terms and preserve required notices if you redistribute dependencies or compiled output.
