// ─── Question types ────────────────────────────────────────────────────────────
// time        → up/down stepper for hour:minute + am/pm
// duration    → up/down stepper for hours and minutes
// yes_no      → large Yes / No buttons
// rating      → 1–5 option buttons with labels
// number      → up/down stepper for a single integer
// medication  → add/edit/delete medication entries with dose + time
// ──────────────────────────────────────────────────────────────────────────────

import { PANAS_TERMS, PANAS_OPTIONS, PANAS_INSTRUCTION } from './panas';

// ─── Sleep Light additions ─────────────────────────────────────────────────────
// Questionnaires added to the daily diaries for the Sleep Light study.
//
// Each item carries a `section` label ("PANAS · 7/20") and is numbered within
// its section. An optional `preface` is the instruction that stays at the top of
// every page in that section.
//
// Responses are stored as the position on the scale (1 = first option shown).
// Scoring and any reversal happen at analysis time, not in the app.

const KSS_OPTIONS = [
  { value: 1, label: 'Extremely alert' },
  { value: 2, label: 'Very alert' },
  { value: 3, label: 'Alert' },
  { value: 4, label: 'Rather alert' },
  { value: 5, label: 'Neither alert nor sleepy' },
  { value: 6, label: 'Some signs of sleepiness' },
  { value: 7, label: 'Sleepy, but no effort to keep awake' },
  { value: 8, label: 'Sleepy but some effort to keep awake' },
  { value: 9, label: 'Very sleepy, great effort to keep awake, fighting sleep' },
];

const MEDIA_OPTIONS = [
  { value: 0, label: 'None' },
  { value: 1, label: '0-10 minutes' },
  { value: 2, label: '11-20 minutes' },
  { value: 3, label: '21-40 minutes' },
  { value: 4, label: 'More than 40 minutes' },
];

const PROMIS_SATISFACTION = [
  { value: 1, label: 'Not at all' },
  { value: 2, label: 'A little bit' },
  { value: 3, label: 'Somewhat' },
  { value: 4, label: 'Quite a bit' },
  { value: 5, label: 'Very much' },
];

const PROMIS_FREQUENCY = [
  { value: 1, label: 'Always' },
  { value: 2, label: 'Usually' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Rarely' },
  { value: 5, label: 'Never' },
];

/** Build one rating question per text, all sharing a section, preface and scale. */
const ratingItems = ({ idPrefix, section, preface, options, texts }) =>
  texts.map((text, i) => ({
    id: `${idPrefix}${i + 1}`,
    number: i + 1,
    section,
    preface,
    text,
    type: 'rating',
    options,
  }));

const MORNING_EXTRA = [
  {
    id: 'mq_kss',
    number: 1,
    section: 'KSS',
    text: 'Please indicate how you are feeling at this moment:',
    type: 'rating',
    options: KSS_OPTIONS,
  },
  ...ratingItems({
    idPrefix: 'mq_media',
    section: 'Media usage',
    preface: 'Two hours before going to sleep, how long (in minutes) did you…',
    options: MEDIA_OPTIONS,
    texts: [
      'Watch television or equivalent (e.g. Netflix/iPlayer/4OD)?',
      'Use a laptop/computer?',
      'Use an iPad/tablet/Kindle Fire/Fire HD/Paperwhite?',
      'Use your mobile phone/iPhone for calls/texting/FaceTime?',
      'Listen to music?',
      'Play video games?',
    ],
  }),
  {
    id: 'mq_text',
    number: 7,
    section: 'Media usage',
    text: 'Did you send or receive any text messages after lights-out?',
    type: 'yes_no',
  },
  {
    id: 'mq_call',
    number: 8,
    section: 'Media usage',
    text: 'Did you make or receive any calls after lights-out?',
    type: 'yes_no',
  },
];

const PAST_DAY = 'In the past day…';

const EVENING_EXTRA = [
  {
    id: 'eq_kss',
    number: 1,
    section: 'KSS',
    text: 'Please indicate how you are feeling at this moment:',
    type: 'rating',
    options: KSS_OPTIONS,
  },
  ...ratingItems({
    idPrefix: 'eq_panas',
    section: 'PANAS',
    preface: PANAS_INSTRUCTION,
    options: PANAS_OPTIONS,
    texts: PANAS_TERMS,
  }),
  // PROMIS social function, short forms 4a / 6a / 7a / 8a
  ...ratingItems({
    idPrefix: 'eq_p4a_',
    section: 'PROMIS 4a',
    preface: PAST_DAY,
    options: PROMIS_SATISFACTION,
    texts: [
      'I am satisfied with how much work I can do (include work at home)',
      'I am satisfied with my ability to work (include work at home)',
      'I am satisfied with my ability to do regular personal and household responsibilities',
      'I am satisfied with my ability to perform my daily routines',
    ],
  }),
  ...ratingItems({
    idPrefix: 'eq_p6a_',
    section: 'PROMIS 6a',
    preface: PAST_DAY,
    options: PROMIS_FREQUENCY,
    texts: [
      'I have trouble doing all of my regular leisure activities with others',
      'I have trouble doing all of the family activities that I want to do',
      'I have trouble doing all of my usual work (include work at home)',
      'I have trouble doing all of the activities with friends that I want to do',
      'I have to limit the things I do for fun with others',
      'I have to limit my regular activities with friends',
    ],
  }),
  ...ratingItems({
    idPrefix: 'eq_p7a_',
    section: 'PROMIS 7a',
    preface: PAST_DAY,
    options: PROMIS_SATISFACTION,
    texts: [
      'I am satisfied with my ability to do things for fun at home (like reading, listening to music, etc.)',
      'I am satisfied with my ability to do things for my friends',
      'I am satisfied with my ability to do leisure activities',
      'I am satisfied with the amount of time I spend doing leisure activities',
      'I am satisfied with my current level of activities with my friends',
      'I am satisfied with my current level of social activity',
      'I am satisfied with my ability to do things for fun outside my home',
    ],
  }),
  ...ratingItems({
    idPrefix: 'eq_p8a_',
    section: 'PROMIS 8a',
    preface: PAST_DAY,
    options: PROMIS_SATISFACTION,
    texts: [
      'I am satisfied with my ability to do things for my family',
      'I am satisfied with my ability to do things for fun with others',
      'I feel good about my ability to do things for my friends',
      'I am satisfied with my ability to perform my daily routines',
      'I am satisfied with my ability to do things for fun outside my home',
      'I am satisfied with my ability to meet the needs of my friends',
      'I am satisfied with my ability to do the work that is really important to me (include work at home)',
      'I am satisfied with my ability to meet the needs of my family',
    ],
  }),
];

export const MORNING_QUESTIONS = [
  {
    id: 'mq1',
    number: 1,
    text: 'What time did you get into bed last night?',
    type: 'time',
    defaultValue: { hour: 22, minute: 30 },
  },
  {
    id: 'mq2',
    number: 2,
    text: 'What time did you try to go to sleep?',
    type: 'time',
    defaultValue: { hour: 23, minute: 0 },
  },
  {
    id: 'mq3',
    number: 3,
    text: 'How long did it take you to fall asleep?',
    type: 'duration',
    defaultValue: { hours: 0, minutes: 30 },
  },
  {
    id: 'mq4',
    number: 4,
    text: 'Did you wake up during the night?',
    type: 'yes_no',
    followUp: 'mq4b',
  },
  {
    id: 'mq4b',
    number: '4b',
    text: 'How many times did you wake up?',
    type: 'number',
    defaultValue: 1,
    min: 1,
    max: 20,
    unit: 'times',
    conditionalOn: { id: 'mq4', value: 'yes' },
  },
  {
    id: 'mq5',
    number: 5,
    text: 'How long were you awake during the night in total?',
    type: 'duration',
    defaultValue: { hours: 0, minutes: 0 },
  },
  {
    id: 'mq6',
    number: 6,
    text: 'What time was your final awakening?',
    type: 'time',
    defaultValue: { hour: 6, minute: 30 },
  },
  {
    id: 'mq7',
    number: 7,
    text: 'What time did you get out of bed for the day?',
    type: 'time',
    defaultValue: { hour: 7, minute: 0 },
  },
  {
    id: 'mq8',
    number: 8,
    text: 'Did you wake up earlier than you planned?',
    type: 'yes_no',
    followUp: 'mq8b',
  },
  {
    id: 'mq8b',
    number: '8b',
    text: 'How much earlier did you wake up?',
    type: 'duration',
    defaultValue: { hours: 0, minutes: 30 },
    conditionalOn: { id: 'mq8', value: 'yes' },
  },
  {
    id: 'mq9',
    number: 9,
    text: 'How many alcoholic drinks did you have yesterday?',
    hint: '1 drink = 355 mL beer, 150 mL wine, or 45 mL spirits',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 30,
    unit: 'drinks',
  },
  {
    id: 'mq10',
    number: 10,
    text: 'Did you use any sleep aids (medication, supplements, etc.)?',
    type: 'yes_no',
    followUp: 'mq10b',
  },
  {
    id: 'mq10b',
    number: '10b',
    text: 'What did you use to help you sleep?',
    type: 'medication',
    conditionalOn: { id: 'mq10', value: 'yes' },
  },
  {
    id: 'mq11',
    number: 11,
    text: 'How would you rate the quality of your sleep?',
    type: 'rating',
    options: [
      { value: 1, label: 'Very poor' },
      { value: 2, label: 'Poor' },
      { value: 3, label: 'Fair' },
      { value: 4, label: 'Good' },
      { value: 5, label: 'Very good' },
    ],
  },
  {
    id: 'mq12',
    number: 12,
    text: 'How rested did you feel when you woke up for the day?',
    type: 'rating',
    options: [
      { value: 1, label: 'Not rested at all' },
      { value: 2, label: 'Slightly rested' },
      { value: 3, label: 'Somewhat rested' },
      { value: 4, label: 'Well rested' },
      { value: 5, label: 'Very well rested' },
    ],
  },
  ...MORNING_EXTRA,
  {
    id: 'mq13',
    number: 13,
    text: 'Comments (optional)',
    type: 'text_input',
    placeholder: 'Any notes about your sleep last night...',
    optional: true,
  },
];

export const EVENING_QUESTIONS = [
  ...EVENING_EXTRA,
  {
    id: 'eq1',
    number: 1,
    text: 'Did you nap today?',
    type: 'yes_no',
    followUp: 'eq1b',
  },
  {
    id: 'eq1b',
    number: '1b',
    text: 'How long did you nap?',
    type: 'duration',
    defaultValue: { hours: 0, minutes: 30 },
    conditionalOn: { id: 'eq1', value: 'yes' },
  },
  {
    id: 'eq2',
    number: 2,
    text: 'How many caffeinated drinks did you have today?',
    type: 'number',
    defaultValue: 0,
    min: 0,
    max: 20,
    unit: 'drinks',
  },
  {
    id: 'eq3',
    number: 3,
    text: 'Did you exercise today?',
    type: 'yes_no',
  },
  {
    id: 'eq4',
    number: 4,
    text: 'Did you use any medications to help you sleep?',
    type: 'yes_no',
    followUp: 'eq4b',
  },
  {
    id: 'eq4b',
    number: '4b',
    text: 'What medication do you use to help you sleep?',
    type: 'medication',
    conditionalOn: { id: 'eq4', value: 'yes' },
  },
  {
    id: 'eq5',
    number: 5,
    text: 'Comments (optional)',
    type: 'text_input',
    placeholder: 'Any notes about your day...',
    optional: true,
  },
];