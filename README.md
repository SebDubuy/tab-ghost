# Tab Ghost 👻

**Tab Ghost** is a Chrome extension that automatically suspends inactive tabs to free up RAM — without losing them.

## How it works

Tabs you haven't touched for a while go through two stages:

1. **⏳ Warning** — the tab title gets a warning indicator
2. **💤 Snoozed** — the tab is grouped into a collapsed "Snoozed 💤" group and discarded from memory

Click any snoozed tab to wake it up instantly. Your tab bar stays clean, your RAM stays free.

## Features

- Automatic tab suspension based on inactivity
- Configurable thresholds (warning delay, suspend delay)
- Whitelist to protect specific sites (e.g. your music player, emails)
- RAM savings estimate in the popup
- One click to wake a tab back up

## Installation

1. Download or clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select this folder

## Settings

Open the extension popup to configure:

| Setting | Description |
|---|---|
| Wait (min) | Minutes before the ⏳ warning appears |
| Ghost (min) | Minutes before the tab is snoozed 💤 |
| Whitelist | Sites that should never be suspended (one per line) |

## Tech

Vanilla JS Chrome Extension — Manifest V3. No build step, no dependencies.
