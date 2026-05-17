# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

**Tab Ghost** is a Chrome Extension (Manifest V3) that automatically suspends dormant browser tabs to free up RAM. It uses a patrol alarm to move inactive tabs into a collapsed "Snoozed 💤" tab group and discard them from memory.

## Development & Testing

There is no build step — this is vanilla HTML/CSS/JS loaded directly into Chrome.

**To test the extension:**
1. Open `chrome://extensions`
2. Enable "Developer mode"
3. Click "Load unpacked" and select this folder
4. Reload the extension after any change to `background.js` or `manifest.json`
5. Changes to `popup.html`/`popup.js` take effect on next popup open

**To debug the service worker:** On `chrome://extensions`, click "service worker" link under Tab Ghost to open DevTools for `background.js`.

**To open the landing page:** Open `landing.html` directly in a browser (no server needed).

## Architecture

### Extension Core (Chrome-specific files)

- **[manifest.json](manifest.json)** — MV3 manifest. Permissions: `tabs`, `tabGroups`, `storage`, `alarms`, `scripting`.
- **[background.js](background.js)** — Service worker. Contains all tab lifecycle logic:
  - `init()` loads settings from `chrome.storage.local` on startup and on any storage change
  - A 1-minute `checkTabs` alarm patrols all non-active, non-pinned, non-grouped tabs
  - Two thresholds from settings: `waitMin` (⏳ warning) and `ghostMin` (💤 suspend)
  - `moveToDormitory()` renames the tab title, groups it into "Snoozed 💤", collapses the group, then calls `chrome.tabs.discard()` after 500ms — order matters (title update must happen before discard)
  - `updateTitle()` uses `chrome.scripting.executeScript` to set `document.title` directly in the page
  - `tabs.onActivated` wakes a tab: cleans its title and ungroups it
- **[popup.html](popup.html)** / **[popup.js](popup.js)** — Extension popup (300px wide). Reads live ghost count by querying the "Snoozed 💤" group. Estimates RAM saved at 50 Mo per snoozed tab. Saves `waitMin`, `ghostMin`, `whitelist` to `chrome.storage.local`.

### Standalone HTML Pages (no extension context)

- **[landing.html](landing.html)** — Marketing landing page for Tab Ghost, styled with an Arcane/Hextech aesthetic (Cinzel + Rajdhani fonts, particle canvas, scroll reveal).
- **[arcane.html](arcane.html)** — A separate, more elaborate Arcane fan-page showcase with parallax, custom cursor, preloader, and animated SVG graffiti. Not part of the extension itself.

### Key Invariants

- `FOLDER_NAME = "Snoozed 💤"` must be identical in both `background.js` and `popup.js`.
- The `scripting` permission + `<all_urls>` host permission is required for `updateTitle()` to work on arbitrary pages.
- Tab title must be changed **before** `chrome.tabs.discard()` — the discard freezes the page and a post-discard title update will fail silently.
- `chrome.tabs.discard()` is called in a `setTimeout` of 500ms to let the group collapse animation complete first.
- Whitelist matching is case-sensitive substring: `tab.url.includes(site)` — whitelist entries should be lowercase (enforced in `popup.js` on save).
