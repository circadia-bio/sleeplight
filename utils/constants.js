/**
 * utils/constants.js — Shared app-wide constants
 *
 * Single source of truth for thresholds and magic numbers used across
 * multiple screens. Update here and every consumer automatically picks
 * up the change.
 */

/**
 * Minimum number of morning diary entries required to:
 *  - unlock the Final Report screen
 *  - reveal one-time questionnaire results in the Profile modal
 *  - show the sleep stats dashboard on the Entry tab
 *
 * Used by: home.jsx, entry.jsx, final-report.jsx, ProfileModal.jsx
 */
export const MIN_ENTRIES_FOR_REPORT = 14;

/**
 * Name shown in the browser tab, bookmarks and the "Add to Home Screen" prompt.
 * Expo Router rewrites document.title on every navigation, so every screen sets
 * its `title` option to this (see app/_layout.jsx and app/(tabs)/_layout.jsx).
 */
export const APP_NAME = 'Sleep Light';
