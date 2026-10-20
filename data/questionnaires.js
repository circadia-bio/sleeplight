/**
 * data/questionnaires.js — Screening battery definitions (Sleep Light)
 *
 * Every instrument here is part of the one-time SCREENING battery. Participants
 * must complete all of them before the morning and evening diaries unlock, and
 * each instrument locks once answered (see utils/screening.js).
 *
 * Each questionnaire object has the shape:
 *   {
 *     id:           string          — storage key suffix (e.g. 'ess')
 *     title:        string          — display title
 *     shortTitle:   string          — compact label for chips / badges
 *     credit:       string          — attribution shown on the credits screen
 *     instructions: string          — shown before the first item
 *     reference:    string          — citation string
 *     locked:       true            — cannot be redone once completed
 *     noFeedback?:  true            — no score or interpretation is shown to the
 *                                     participant (research-only data)
 *     repeatInstructions?: true     — show the instructions on every item,
 *                                     not just the first
 *     items: [
 *       {
 *         id:      string           — unique within the questionnaire
 *         number:  number|string    — display number
 *         text:    string           — question stem
 *         type:    string           — input type (see QuestionnaireScreen)
 *         options?: [{ value, label }]
 *         hint?:   string
 *         min?, max?, unit?, defaultValue?
 *       }
 *     ],
 *     score:     (answers) => number|object|null   — computes score(s) from answers
 *     interpret: (score)   => { label, color, description }
 *   }
 *
 * Input types used across instruments:
 *   scale_0_3      — 4-option labelled scale (0–3)
 *   single_choice  — pick one from a list of labelled options with explicit values
 *   frequency_4    — Not during the past month / <once/week / 1–2×/week / ≥3×/week
 *   time           — HH:MM stepper
 *   duration_min   — integer minutes stepper
 *   number         — integer stepper with min/max/unit
 *   country        — type-to-search country list           → 'Brazil'
 *   date           — day / month / year steppers          → { day, month, year }
 *   year_range     — from/to year steppers                 → { from, to }
 *   month_year     — month + year steppers                 → { month, year }
 *   months_or_whole_life — months stepper or "Whole life"  → { months } | { wholeLife: true }
 *
 * Adding a new questionnaire:
 *   1. Define it below following the same structure.
 *   2. Add it to the QUESTIONNAIRES array at the bottom. Its position there is
 *      the order participants complete it in.
 */

import {
  PANAS_TERMS, PANAS_OPTIONS, PANAS_PA_ITEMS, PANAS_NA_ITEMS, PANAS_INSTRUCTION,
} from './panas';

// ─── Shared option sets ────────────────────────────────────────────────────────

const SCALE_0_3 = [
  { value: 0, label: 'Would never doze' },
  { value: 1, label: 'Slight chance of dozing' },
  { value: 2, label: 'Moderate chance of dozing' },
  { value: 3, label: 'High chance of dozing' },
];

const FREQUENCY_4 = [
  { value: 0, label: 'Not during the past month' },
  { value: 1, label: 'Less than once a week' },
  { value: 2, label: 'Once or twice a week' },
  { value: 3, label: 'Three or more times a week' },
];

// A neutral result used by instruments that give the participant no feedback.
const RECORDED = {
  label: 'Recorded',
  color: '#6B3FA0',
  description: 'Your answers have been saved for the research team.',
};

// ─── Demographics ──────────────────────────────────────────────────────────────────────

export const DEMOGRAPHICS = {
  id:         'demographics',
  title:      'About You',
  shortTitle: 'About You',
  credit:     'Sleep Light study questions. Circadia Lab, Northumbria University.',
  locked:     true,
  noFeedback: true,
  instructions:
    'Two quick questions about you. Your answers stay on your device and are only shared ' +
    'when you export your data.',
  reference:  'Sleep Light study questions. Circadia Lab, Northumbria University.',
  items: [
    { id: 'dem_dob',    number: 1, text: 'What is your date of birth?', type: 'date',
      hint: 'Choose the day, month and year you were born.' },
    { id: 'dem_gender', number: 2, text: 'What is your gender?',        type: 'single_choice',
      // Stored as readable text rather than a number.
      options: [
        { value: 'man',               label: 'Man (including trans man)' },
        { value: 'woman',             label: 'Woman (including trans woman)' },
        { value: 'non_binary',        label: 'Non-binary' },
        { value: 'prefer_not_to_say', label: 'Prefer not to say' },
      ] },
  ],
  // Descriptive data only: nothing to score.
  score: () => null,
  interpret: () => RECORDED,
};

// ─── GHQ-12 ───────────────────────────────────────────────────────────────────

/** GHQ response sets. Values are the position on the scale (0–3). */
const ghqOptions = (a, b, c, d) => [
  { value: 0, label: a }, { value: 1, label: b }, { value: 2, label: c }, { value: 3, label: d },
];
const GHQ_BETTER   = ghqOptions('Better than usual', 'Same as usual', 'Less than usual', 'Much less than usual');
const GHQ_MORE_SO  = ghqOptions('More so than usual', 'Same as usual', 'Less so than usual', 'Much less than usual');
const GHQ_NEGATIVE = ghqOptions('Not at all', 'No more than usual', 'Rather more than usual', 'Much more than usual');

export const GHQ12 = {
  id:         'ghq12',
  title:      'General Health Questionnaire (GHQ-12)',
  shortTitle: 'GHQ-12',
  credit:     'Goldberg, D. P., & Williams, P. (1988). A User’s Guide to the General Health Questionnaire. NFER-Nelson. Licensed instrument: permission from the publisher (GL Assessment) is required for use.',
  locked:     true,
  noFeedback: true,
  repeatInstructions: true,
  instructions: 'Have you recently:',
  reference:
    'Goldberg, D. P., & Williams, P. (1988). A User’s Guide to the General Health Questionnaire. NFER-Nelson.',
  items: [
    { id: 'ghq1',  number: 1,  text: 'Been able to concentrate on what you’re doing?',          type: 'single_choice', options: GHQ_BETTER },
    { id: 'ghq2',  number: 2,  text: 'Lost much sleep over worry?',                             type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq3',  number: 3,  text: 'Felt that you are playing a useful part in things?',      type: 'single_choice',
      options: ghqOptions('More so than usual', 'Same as usual', 'Less useful than usual', 'Much less useful') },
    { id: 'ghq4',  number: 4,  text: 'Felt capable of making decisions about things?',          type: 'single_choice',
      options: ghqOptions('More so than usual', 'Same as usual', 'Less so than usual', 'Much less capable') },
    { id: 'ghq5',  number: 5,  text: 'Felt constantly under strain?',                           type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq6',  number: 6,  text: 'Felt that you couldn’t overcome your difficulties?',      type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq7',  number: 7,  text: 'Been able to enjoy your normal day-to-day activities?',   type: 'single_choice', options: GHQ_MORE_SO },
    { id: 'ghq8',  number: 8,  text: 'Been able to face up to your problems?',                  type: 'single_choice',
      options: ghqOptions('More so than usual', 'Same as usual', 'Less able than usual', 'Much less able') },
    { id: 'ghq9',  number: 9,  text: 'Been feeling unhappy and depressed?',                     type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq10', number: 10, text: 'Been losing confidence in yourself?',                     type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq11', number: 11, text: 'Been thinking of yourself as a worthless person?',        type: 'single_choice', options: GHQ_NEGATIVE },
    { id: 'ghq12', number: 12, text: 'Been feeling reasonably happy, all things considered?',   type: 'single_choice', options: GHQ_MORE_SO },
  ],
  /**
   * Raw item values (0–3 by position) are stored in `answers`. The score holds both
   * conventional totals:
   *   likert  — sum of item values, 0–36
   *   ghq     — GHQ (bimodal) scoring: responses 3rd/4th = 1, 1st/2nd = 0, total 0–12
   */
  score: (answers) => {
    let likert = 0;
    let ghq = 0;
    for (let n = 1; n <= 12; n++) {
      const v = answers[`ghq${n}`] ?? 0;
      likert += v;
      if (v >= 2) ghq += 1;
    }
    return { likert, ghq };
  },
  // Participants are not shown a mental-health classification.
  interpret: () => RECORDED,
};

// ─── PANAS ────────────────────────────────────────────────────────────────────

export const PANAS = {
  id:         'panas',
  title:      'Positive and Negative Affect Schedule (PANAS)',
  shortTitle: 'PANAS',
  credit:     'Watson, D., Clark, L. A., & Tellegen, A. (1988). Journal of Personality and Social Psychology, 54(6), 1063–1070.',
  locked:     true,
  noFeedback: true,
  repeatInstructions: true,
  instructions: PANAS_INSTRUCTION,
  reference:
    'Watson, D., Clark, L. A., & Tellegen, A. (1988). Journal of Personality and Social Psychology, 54(6), 1063–1070.',
  items: PANAS_TERMS.map((term, i) => ({
    id:      `panas${i + 1}`,
    number:  i + 1,
    text:    term,
    type:    'single_choice',
    options: PANAS_OPTIONS,
  })),
  /** Raw 1–5 responses are stored. Score = { pa, na }, each 10–50. See data/panas.js. */
  score: (answers) => {
    const sum = (ids) => ids.reduce((s, n) => s + (answers[`panas${n}`] ?? 0), 0);
    return { pa: sum(PANAS_PA_ITEMS), na: sum(PANAS_NA_ITEMS) };
  },
  interpret: () => RECORDED,
};

// ─── ESS ──────────────────────────────────────────────────────────────────────

export const ESS = {
  id:         'ess',
  title:      'Epworth Sleepiness Scale',
  shortTitle: 'ESS',
  credit:     'Johns, M. W. (1991). Sleep, 14(6), 540–545. © Murray W. Johns. Permission required for commercial use.',
  locked:     true,
  instructions:
    'How likely are you to doze off or fall asleep in the following situations, ' +
    'in contrast to feeling just tired? This refers to your usual way of life in ' +
    'recent times. Even if you have not done some of these things recently, try to ' +
    'work out how they would have affected you.',
  reference:
    'Johns, M. W. (1991). Sleep, 14(6), 540–545.',
  items: [
    { id: 'ess1', number: 1, text: 'Sitting and reading',                                            type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess2', number: 2, text: 'Watching TV',                                                    type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess3', number: 3, text: 'Sitting inactive in a public place (e.g. a theatre or meeting)', type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess4', number: 4, text: 'As a passenger in a car for an hour without a break',            type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess5', number: 5, text: 'Lying down to rest in the afternoon when circumstances permit',  type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess6', number: 6, text: 'Sitting and talking to someone',                                 type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess7', number: 7, text: 'Sitting quietly after a lunch without alcohol',                  type: 'scale_0_3', options: SCALE_0_3 },
    { id: 'ess8', number: 8, text: 'In a car, while stopped for a few minutes in traffic',           type: 'scale_0_3', options: SCALE_0_3 },
  ],
  score: (answers) =>
    [1,2,3,4,5,6,7,8].reduce((s, n) => s + (answers[`ess${n}`] ?? 0), 0),
  interpret: (score) => {
    if (score <= 7)  return { label: 'Normal',    color: '#2E7D32', description: 'Your daytime sleepiness is within the normal range.' };
    if (score <= 9)  return { label: 'Borderline',color: '#F59E0B', description: 'Your score is at the borderline. Consider monitoring your sleep.' };
    if (score <= 15) return { label: 'Excessive', color: '#EA580C', description: 'You may be experiencing excessive daytime sleepiness. Consider discussing this with a clinician.' };
    return              { label: 'Severe',     color: '#DC2626', description: 'Your score indicates severe excessive daytime sleepiness. We recommend seeking medical advice.' };
  },
};

// ─── PSQI ─────────────────────────────────────────────────────────────────────

export const PSQI = {
  id:         'psqi',
  maxScore:   21,
  title:      'Pittsburgh Sleep Quality Index',
  shortTitle: 'PSQI',
  credit:     'Buysse, D. J., et al. (1989). Psychiatry Research, 28(2), 193–213. © University of Pittsburgh. Permission required; contact the authors for research use.',
  locked:     true,
  instructions:
    'The following questions relate to your usual sleep habits during the past month only. ' +
    'Your answers should indicate the most accurate reply for the majority of days and nights in the past month.',
  reference:
    'Buysse, D. J., et al. (1989). Psychiatry Research, 28(2), 193–213.',
  items: [
    { id: 'psqi1',  number: 1,  text: 'During the past month, what time have you usually gone to bed at night?',                                             type: 'time',         defaultValue: { hour: 23, minute: 0 } },
    { id: 'psqi2',  number: 2,  text: 'During the past month, how long (in minutes) has it usually taken you to fall asleep each night?',                    type: 'duration_min', defaultValue: 20, min: 0, max: 180, unit: 'min' },
    { id: 'psqi3',  number: 3,  text: 'During the past month, what time have you usually gotten up in the morning?',                                         type: 'time',         defaultValue: { hour: 7, minute: 0 } },
    { id: 'psqi4',  number: 4,  text: 'During the past month, how many hours of actual sleep did you get at night? (This may differ from hours spent in bed.)', type: 'number',      defaultValue: 7, min: 0, max: 24, unit: 'hrs' },
    {
      id: 'psqi5a', number: '5a', text: 'During the past month, how often have you had trouble sleeping because you cannot get to sleep within 30 minutes?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5b', number: '5b', text: 'How often have you had trouble sleeping because you wake up in the middle of the night or early morning?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5c', number: '5c', text: 'How often have you had trouble sleeping because you have to get up to use the bathroom?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5d', number: '5d', text: 'How often have you had trouble sleeping because you cannot breathe comfortably?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5e', number: '5e', text: 'How often have you had trouble sleeping because you cough or snore loudly?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5f', number: '5f', text: 'How often have you had trouble sleeping because you feel too cold?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5g', number: '5g', text: 'How often have you had trouble sleeping because you feel too hot?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5h', number: '5h', text: 'How often have you had trouble sleeping because you had bad dreams?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi5i', number: '5i', text: 'How often have you had trouble sleeping because you have pain?', type: 'frequency_4', options: FREQUENCY_4,
    },
    // Note: PSQI item 5j ('other reason, please describe') is intentionally omitted.
    // It is a free-text field that does not contribute to any of the 7 component scores
    // and would require a text_input item outside the standard scoring algorithm.
    {
      id: 'psqi6',  number: 6,   text: 'During the past month, how often have you taken medicine to help you sleep (prescribed or over the counter)?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi7',  number: 7,   text: 'During the past month, how often have you had trouble staying awake while driving, eating meals, or engaging in social activity?', type: 'frequency_4', options: FREQUENCY_4,
    },
    {
      id: 'psqi8',  number: 8,   text: 'During the past month, how much of a problem has it been for you to keep up enough enthusiasm to get things done?', type: 'single_choice',
      options: [{ value: 0, label: 'No problem at all' }, { value: 1, label: 'Only a very slight problem' }, { value: 2, label: 'Somewhat of a problem' }, { value: 3, label: 'A very big problem' }],
    },
    {
      id: 'psqi9',  number: 9,   text: 'During the past month, how would you rate your sleep quality overall?', type: 'single_choice',
      options: [{ value: 0, label: 'Very good' }, { value: 1, label: 'Fairly good' }, { value: 2, label: 'Fairly bad' }, { value: 3, label: 'Very bad' }],
    },
  ],
  score: (answers) => {
    // C1 — Subjective sleep quality (Q9)
    const c1 = answers['psqi9'] ?? 0;

    // C2 — Sleep latency (Q2 + Q5a)
    const sol = answers['psqi2'] ?? 0;
    const solScore = sol <= 15 ? 0 : sol <= 30 ? 1 : sol <= 60 ? 2 : 3;
    const q5a = answers['psqi5a'] ?? 0;
    const c2raw = solScore + q5a;
    const c2 = c2raw === 0 ? 0 : c2raw <= 2 ? 1 : c2raw <= 4 ? 2 : 3;

    // C3 — Sleep duration (Q4, hours)
    const sd = answers['psqi4'] ?? 7;
    const c3 = sd >= 7 ? 0 : sd >= 6 ? 1 : sd >= 5 ? 2 : 3;

    // C4 — Habitual sleep efficiency (Q1, Q3, Q4)
    const bt = answers['psqi1'] ? answers['psqi1'].hour * 60 + answers['psqi1'].minute : 23 * 60;
    const wt = answers['psqi3'] ? answers['psqi3'].hour * 60 + answers['psqi3'].minute : 7 * 60;
    let tib = wt - bt; if (tib <= 0) tib += 1440;
    const hse = tib > 0 ? (sd / (tib / 60)) * 100 : 0;
    const c4 = hse >= 85 ? 0 : hse >= 75 ? 1 : hse >= 65 ? 2 : 3;

    // C5 — Sleep disturbances (Q5b–Q5i)
    const distItems = ['psqi5b','psqi5c','psqi5d','psqi5e','psqi5f','psqi5g','psqi5h','psqi5i'];
    const distSum = distItems.reduce((s, k) => s + (answers[k] ?? 0), 0);
    const c5 = distSum === 0 ? 0 : distSum <= 9 ? 1 : distSum <= 18 ? 2 : 3;

    // C6 — Use of sleeping medication (Q6)
    const c6 = answers['psqi6'] ?? 0;

    // C7 — Daytime dysfunction (Q7 + Q8)
    const c7raw = (answers['psqi7'] ?? 0) + (answers['psqi8'] ?? 0);
    const c7 = c7raw === 0 ? 0 : c7raw <= 2 ? 1 : c7raw <= 4 ? 2 : 3;

    return c1 + c2 + c3 + c4 + c5 + c6 + c7;
  },
  interpret: (score) => {
    if (score <= 4)  return { label: 'Good sleep quality',     color: '#2E7D32', description: 'Your score suggests good overall sleep quality.' };
    if (score <= 10) return { label: 'Poor sleep quality',     color: '#F59E0B', description: 'Your score suggests poor sleep quality. Consider sleep hygiene improvements or speaking with a clinician.' };
    return               { label: 'Severe sleep difficulties', color: '#DC2626', description: 'Your score indicates severe sleep difficulties. We recommend seeking medical advice.' };
  },
};

// ─── MCTQ ─────────────────────────────────────────────────────────────────────

export const MCTQ = {
  id:         'mctq',
  title:      'Munich Chronotype Questionnaire',
  shortTitle: 'MCTQ',
  credit:     'Roenneberg, T., et al. (2003). Journal of Biological Rhythms, 18(1), 80–90. © Till Roenneberg, LMU Munich. Free for non-commercial research; contact thewep.org for permission.',
  locked:     true,
  instructions:
    'Please answer the following questions about your typical sleep behaviour on workdays ' +
    'and on free days (days without work, school, or early appointments). ' +
    'Answer for the most common pattern in the past four weeks.',
  reference:
    'Roenneberg, T., et al. (2003). Journal of Biological Rhythms, 18(1), 80–90.',
  items: [
    { id: 'mctq_wd',   number: 'C1', text: 'How many days per week do you work or have mandatory social commitments?',           type: 'number',      defaultValue: 5, min: 0, max: 7, unit: 'days/week' },
    { id: 'mctq_bt_w', number: 'A2', text: 'Workdays — What time do you usually go to bed? (when you turn off the lights to sleep)', type: 'time',     defaultValue: { hour: 23, minute: 0 } },
    { id: 'mctq_sl_w', number: 'A3', text: 'Workdays — How many minutes does it usually take you to fall asleep?',               type: 'duration_min', defaultValue: 15, min: 0, max: 120, unit: 'min' },
    { id: 'mctq_wt_w', number: 'A4', text: 'Workdays — What time do you usually wake up?',                                       type: 'time',         defaultValue: { hour: 7, minute: 0 } },
    { id: 'mctq_bt_f', number: 'B1', text: 'Free days — What time do you usually go to bed?',
      // Note: bedtimes before noon are treated as post-midnight (e.g. 01:00 AM).
      // This assumption covers the vast majority of sleep schedules but would
      // misinterpret a genuine late-morning bedtime (e.g. 11:00 AM shift worker).
      hint: 'If you go to bed after midnight, simply enter the time as shown — e.g. 01:30 for half past one in the morning.',
      type: 'time', defaultValue: { hour: 0, minute: 0 } },
    { id: 'mctq_sl_f', number: 'B2', text: 'Free days — How many minutes does it usually take you to fall asleep?',              type: 'duration_min', defaultValue: 15, min: 0, max: 120, unit: 'min' },
    { id: 'mctq_wt_f', number: 'B4', text: 'Free days — What time do you usually wake up?',                                      type: 'time',         defaultValue: { hour: 8, minute: 30 } },
  ],
  score: (answers) => {
    // All times converted to decimal hours
    const toH = (t) => t ? t.hour + t.minute / 60 : null;

    const wd = answers['mctq_wd'] ?? 5;
    const fd = 7 - wd;

    // Workday sleep onset & duration
    let bt_w = toH(answers['mctq_bt_w'] ?? { hour: 23, minute: 0 });
    const sl_w = (answers['mctq_sl_w'] ?? 15) / 60;
    let so_w = bt_w + sl_w;
    let wt_w = toH(answers['mctq_wt_w'] ?? { hour: 7, minute: 0 });
    if (wt_w <= so_w) wt_w += 24; // handle midnight wrap
    const sd_w = wt_w - so_w;
    const msw = (so_w + sd_w / 2) % 24;

    // Free day sleep onset & duration
    let bt_f = toH(answers['mctq_bt_f'] ?? { hour: 0, minute: 0 });
    if (bt_f < 12) bt_f += 24; // treat early-AM bedtimes as post-midnight
    const sl_f = (answers['mctq_sl_f'] ?? 15) / 60;
    let so_f = bt_f + sl_f;
    let wt_f = toH(answers['mctq_wt_f'] ?? { hour: 8, minute: 30 });
    if (wt_f < 12) wt_f += 24;
    if (wt_f <= so_f) wt_f += 24;
    const sd_f = wt_f - so_f;
    const msf = (so_f + sd_f / 2) % 24;

    // MSFsc — sleep-corrected mid-sleep on free days
    // Per Roenneberg et al.: if SD_F <= SD_W, no correction needed.
    // Otherwise: MSFsc = MSF - (SD_F - SD_week) / 2
    const sd_week = (sd_w * wd + sd_f * fd) / 7;
    let msf_sc;
    if (sd_f <= sd_w) {
      msf_sc = msf;
    } else {
      msf_sc = msf - (sd_f - sd_week) / 2;
    }
    // Normalise to 0–24 clock range
    msf_sc = ((msf_sc % 24) + 24) % 24;

    // SJL — absolute social jetlag using circular (shorter arc) difference
    // |MSF - MSW| on a 24h clock, taking the shorter of the two arcs
    let diff = Math.abs(msf - msw);
    if (diff > 12) diff = 24 - diff;
    const sjl = diff;

    return { msf_sc: Math.round(msf_sc * 100) / 100, sjl: Math.round(sjl * 100) / 100 };
  },
  interpret: (score) => {
    // score is { msf_sc, sjl }
    const h = typeof score === 'object' ? score.msf_sc : score;
    let label, color, description;
    if (h < 0.5)      { label = 'Extremely early chronotype'; color = '#F59E0B'; description = `Your mid-sleep on free days (corrected) is at ${fmtH(h)}, indicating an extremely early chronotype.`; }
    else if (h < 2.5) { label = 'Early chronotype';           color = '#84CC16'; description = `Your mid-sleep on free days (corrected) is at ${fmtH(h)}, indicating an early chronotype.`; }
    else if (h < 3.5) { label = 'Intermediate chronotype';    color = '#2E7D32'; description = `Your mid-sleep on free days (corrected) is at ${fmtH(h)}, indicating an intermediate chronotype.`; }
    else if (h < 5.5) { label = 'Late chronotype';            color = '#6366F1'; description = `Your mid-sleep on free days (corrected) is at ${fmtH(h)}, indicating a late chronotype.`; }
    else               { label = 'Extremely late chronotype'; color = '#7C3AED'; description = `Your mid-sleep on free days (corrected) is at ${fmtH(h)}, indicating an extremely late chronotype.`; }

    if (typeof score === 'object' && score.sjl !== undefined) {
      const sjlStr = score.sjl < 1 ? 'low' : score.sjl < 2 ? 'moderate' : 'high';
      description += ` Your social jetlag is ${score.sjl.toFixed(1)} h (${sjlStr}).`;
    }
    return { label, color, description };
  },
};

// Helper used inside MCTQ interpret
function fmtH(h) {
  const hh = Math.floor(h % 24);
  const mm = Math.round((h % 1) * 60);
  return `${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}`;
}

// ─── Light History ────────────────────────────────────────────────────────────

export const LIGHTHISTORY = {
  id:         'lighthistory',
  title:      'Light History Information',
  shortTitle: 'Light History',
  credit:     'Sleep Light study questions. Circadia Lab, Northumbria University.',
  locked:     true,
  noFeedback: true,
  instructions:
    'These questions are about where you lived before coming to the UK and how long you have been here.',
  reference:  'Sleep Light study questions. Circadia Lab, Northumbria University.',
  items: [
    { id: 'lh_country',     number: 1, text: 'Which country did you arrive in the UK from?',           type: 'country' },
    { id: 'lh_home_years',  number: 2, text: 'How long did you live in your home country?',            type: 'year_range',
      hint: 'Choose the first and last year you lived there.' },
    { id: 'lh_arrival',     number: 3, text: 'When did you arrive in the UK?',                         type: 'month_year' },
    { id: 'lh_uk_duration', number: 4, text: 'How long have you lived in the UK?',                     type: 'months_or_whole_life',
      hint: 'Enter the number of months, or choose “Whole life” if you have always lived here.' },
    { id: 'lh_study_date',  number: 5, text: 'When are you participating in the current study?',       type: 'month_year', defaultValue: 'now',
      hint: 'This is set to this month. Change it only if it is wrong.' },
  ],
  // Descriptive data only: nothing to score.
  score: () => null,
  interpret: () => RECORDED,
};

// ─── Social Media Usage ───────────────────────────────────────────────────────

const SOCIAL_MEDIA_OPTIONS = [
  { value: 0, label: 'Never' },
  { value: 1, label: '1-2 times per week' },
  { value: 2, label: '3-4 times per week' },
  { value: 3, label: '5-6 times per week' },
  { value: 4, label: 'Once daily' },
  { value: 5, label: '2-5 times daily' },
  { value: 6, label: '6-9 times daily' },
  { value: 7, label: '10-13 times daily' },
  { value: 8, label: 'Hourly or more' },
];

const SOCIAL_MEDIA_TEXTS = [
  'Made/shared a post or story about something positive that was personally about me',
  'Looked at how many people liked, commented on, shared my content, or followed/friended me',
  'Read comments to my own content',
  'Edited and/or deleted my own social media content',
  'Played with photo filtering/photo editing',
  'Compared my body or appearance to others’',
  'Compared my life or experiences to others’',
  'Reminisced about the past',
  'Made/shared a post or story about something negative that was personally about me',
  'Made/shared a post or story about something negative that was NOT personally about me',
  'Commented unsupportively or disliked/“reacted” unsupportively on other’s post(s)',
  'Sought out content that I morally or ethically disagreed with',
  'Scrolled aimlessly through my feed(s)',
  'Looked at others’ stories',
  'Navigated to others’ profiles in my social network (e.g., friends or friends of friends)',
  'Navigated to others’ pages who I do not know (e.g., influencers or other famous people)',
  'Watched videos such as memes, news content, and how-tos/recipes.',
];

export const SOCIALMEDIA = {
  id:         'socialmedia',
  title:      'Social Media Usage',
  shortTitle: 'Social Media',
  // The source instrument is not named in the study document. Confirm before publishing.
  credit:     'Source to be confirmed by the study team.',
  locked:     true,
  noFeedback: true,
  instructions:
    'Please indicate how frequently you have engaged in each of the following social media ' +
    'activities in the PAST WEEK (7 days). Please only include activities engaged in on social ' +
    'networking sites such as Instagram and Facebook. Do not include activities related to direct ' +
    'messaging such as Facebook Messenger and Instagram direct messages.',
  reference:  'Source to be confirmed by the study team.',
  items: SOCIAL_MEDIA_TEXTS.map((text, i) => ({
    id:      `sm${i + 1}`,
    number:  i + 1,
    text,
    type:    'single_choice',
    options: SOCIAL_MEDIA_OPTIONS,
    hint:    'Past 7 days. Social networking sites only, not direct messages.',
  })),
  // Frequencies are stored raw (0–8 by position); no composite score is defined.
  score: () => null,
  interpret: () => RECORDED,
};

// ─── Registry ──────────────────────────────────────────────────────────────────

/** Screening battery, in the order participants complete it. */
export const QUESTIONNAIRES = [DEMOGRAPHICS, GHQ12, MCTQ, ESS, PSQI, PANAS, LIGHTHISTORY, SOCIALMEDIA];

export const SCREENING_IDS = QUESTIONNAIRES.map((q) => q.id);

export const getQuestionnaire = (id) => QUESTIONNAIRES.find((q) => q.id === id) ?? null;
