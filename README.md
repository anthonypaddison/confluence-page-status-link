# Page Status Link for Confluence

A self-deployed Confluence Cloud macro that shows a permitted page's title, link and current content status inline.

## What it does

Edit a Confluence page, insert **Page Status Link**, **paste a same-site page URL**, save the configuration, then publish. There is no page picker. Viewers see the linked page title and its content status, or `No status` when none is assigned.

Reads use the current viewer's Confluence permissions. Invalid, inaccessible, deleted or unexpected targets fail to `Page unavailable` without displaying their title/status. A missing configuration asks the author to configure the macro.

Only Confluence Cloud page URLs on the current HTTPS site are supported: `/wiki/spaces/SPACE/pages/ID/...` and `/wiki/pages/viewpage.action?pageId=ID`. Short/share links, cross-site links and non-page targets are not supported. Status refreshes when the macro renders or its configuration changes, not continuously; refresh an open page to see a later status change. A content-state 404 is treated as no assigned status after the page metadata read succeeds. Multiple macros each make their own requests; there is no caching or retry service.

## Architecture and permissions

Forge UI Kit, native inline macro plus a native configuration dialog, Node.js 24 runtime. Configuration uses `view.getContext()`/`view.submit()`. Rendering uses `useConfig()`, `useProductContext()` and `requestConfluence()` in the viewer context:

- `GET /wiki/api/v2/pages/{id}` reads page title/link metadata.
- `GET /wiki/rest/api/content/{id}/state` reads its content status.

The two read requests run in parallel. The app does not request page bodies or write pages.

```yaml
permissions:
  scopes:
    - read:confluence-content.summary
    - read:page:confluence
```

`read:page:confluence` permits page metadata reads; `read:confluence-content.summary` permits the content-state read. There are no write scopes, app backend functions, resolver, remotes, Forge Storage, external datastore, events, scheduled triggers or external egress.

## Privacy

The pasted URL and stable page ID are saved as Confluence macro configuration, which can remain in page history. That configuration is ordinary page content, not a secret store: a restricted target's URL/ID may still be visible to people who can access the containing page. The app does not bypass permissions to fetch the target's title/status. Do not paste URLs containing secrets. There is no app logging, analytics or external service. Confluence/Forge platform data handling still applies; this is not a compliance certification.

## Setup: register and deploy your own copy

Prerequisites: Node.js **24.x**, its bundled npm, a supported [Forge CLI](https://developer.atlassian.com/platform/forge/getting-started/), your own Atlassian developer account/Developer Space and a Confluence Cloud development site where you can install apps. Atlassian's current CLI supports Node 22/24; this repository targets 24.

1. Fork this repository and clone your fork (or clone this repository to work locally):

   ```sh
   git clone https://github.com/anthonypaddison/confluence-page-status-link.git
   cd confluence-page-status-link
   npm ci --ignore-scripts
   npm test
   ```

2. Install the CLI if needed with `npm install -g @forge/cli`. Run `forge login` and `forge whoami` using **your own** account. Never put tokens in this repository. Review any provider terms/billing prompts yourself; this project does not require buying a service.

3. Register **your copy once**:

   ```sh
   forge developer-spaces list --json
   forge register --developer-space-id YOUR_DEVELOPER_SPACE_ID "My Page Status Link"
   ```

   The ID in `manifest.yml` is a non-secret reference identity, **not an app you should deploy or install**. Registration must replace it with your own app ARI. Read back the manifest and confirm it differs from `cf73e829-df10-4123-811d-a03fa4cf47a3` before continuing. Do not run registration again after success: [re-registering creates a new identity](https://developer.atlassian.com/platform/forge/cli-reference/register/) and disconnects this checkout from its previous environments/settings. Do not commit credentials.

4. Validate, then deploy/install only to your own development site:

   ```sh
   forge lint
   forge deploy --environment development
   forge install --environment development --site YOUR_SITE.atlassian.net --product confluence
   ```

5. On disposable pages, check pasting/saving a URL, editing the target URL, a page with a status, one without a status, an invalid/cross-site URL and a target the viewer cannot access. Subsequent changes use `forge deploy --environment development`; use `forge install --upgrade` with the same environment/site/product when required. Do not register again.

There is no paid Marketplace licence check, hosted service or shared installation link. You own your fork, Forge app and platform usage. Stay within your provider's free limits; no free-hosting guarantee is made.

## Local checks

```sh
npm test
npm run lint:forge
npm audit
```

Tests cover URL/ID validation, page/status reads, missing status, denied requests and malformed responses. See [dependency notes](docs/dependencies.md) for the understood moderate advisory and dependency licence boundaries.

## Screenshots

Old Marketplace captures contain personal development-site details and are not included. Use the short development-site checks above to view your own installation.

## Status and maintenance

Open-source reference implementation. No commercial Marketplace listing is maintained.

Originally developed as a Caffeine & Cashflow Forge utility. Commercial Marketplace publication was discontinued and the source is now provided as an open-source reference implementation.

This project is provided as-is. There is no guaranteed support, maintenance schedule, SLA or feature roadmap. Forks are welcome; pull requests may be reviewed at the owner's discretion, without a response or merge commitment. Issues are disabled to avoid implying a support service.

This is an independent project, not an official Atlassian product or an endorsement by Atlassian.

## Licence

Original project source and documentation: [MIT](LICENSE), copyright Anthony Paddison. Dependencies remain under their own licences, including Atlassian Developer Terms for the Forge SDK; they are not relicensed as MIT. No SDK code, third-party artwork or fonts are vendored here.
