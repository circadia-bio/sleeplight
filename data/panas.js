/**
 * data/panas.js — PANAS item text and scoring groups
 *
 * The PANAS appears twice in Sleep Light: once in the screening battery
 * (data/questionnaires.js) and once in the evening diary (data/questions.js).
 * Both import from here so the wording and response scale stay identical.
 *
 * Response values are the position on the scale (1–5), stored raw.
 *
 * Scoring groups follow Watson, Clark & Tellegen (1988):
 *   Positive affect (PA): items 1, 3, 5, 9, 10, 12, 14, 16, 17, 19
 *   Negative affect (NA): items 2, 4, 6, 7, 8, 11, 13, 15, 18, 20
 * Each subscale is a sum from 10 to 50. Neither subscale is reverse-scored.
 */
export const PANAS_TERMS = [
  'Interested', 'Distressed', 'Excited', 'Upset', 'Strong',
  'Guilty', 'Scared', 'Hostile', 'Enthusiastic', 'Proud',
  'Irritable', 'Alert', 'Ashamed', 'Inspired', 'Nervous',
  'Determined', 'Attentive', 'Jittery', 'Active', 'Afraid',
];

export const PANAS_OPTIONS = [
  { value: 1, label: 'Very slightly or not at all' },
  { value: 2, label: 'A little' },
  { value: 3, label: 'Moderately' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Extremely' },
];

export const PANAS_PA_ITEMS = [1, 3, 5, 9, 10, 12, 14, 16, 17, 19];
export const PANAS_NA_ITEMS = [2, 4, 6, 7, 8, 11, 13, 15, 18, 20];

export const PANAS_INSTRUCTION =
  'Read each item and indicate to what extent you have felt this way during the past day';
