/**
 * __tests__/screening.test.js
 *
 * Sleep Light additions:
 *   1. getScreeningStatus() — progress through the screening battery, which
 *      decides when the morning and evening diaries unlock
 *   2. The extra daily-diary questionnaires (KSS, media usage, PANAS, PROMIS)
 *   3. CSV export of the new object-valued answers and scores
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getScreeningStatus } from '../utils/screening';
import { SCREENING_IDS, PANAS } from '../data/questionnaires';
import { MORNING_QUESTIONS, EVENING_QUESTIONS } from '../data/questions';
import { saveQuestionnaire, exportToCSV } from '../storage/storage';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

// ─── 1. Screening status ──────────────────────────────────────────────────────

describe('getScreeningStatus', () => {
  const results = (ids) => ids.map((id) => ({ id }));

  it('starts at the first instrument when nothing is done', () => {
    expect(getScreeningStatus([])).toEqual({ done: 0, total: 8, complete: false, nextId: 'demographics' });
  });

  it('defaults to nothing done when called without arguments', () => {
    expect(getScreeningStatus().done).toBe(0);
  });

  it('points at the first unfinished instrument in battery order, not completion order', () => {
    const status = getScreeningStatus(results(['ess', 'demographics', 'ghq12']));
    expect(status.done).toBe(3);
    expect(status.complete).toBe(false);
    expect(status.nextId).toBe('mctq');
  });

  it('is complete, with no next instrument, once every instrument is done', () => {
    const status = getScreeningStatus(results(SCREENING_IDS));
    expect(status).toEqual({ done: 8, total: 8, complete: true, nextId: null });
  });

  it('ignores stored results that are not part of the battery', () => {
    const status = getScreeningStatus(results(['isi', 'dbas16', 'ghq12']));
    expect(status.done).toBe(1);
  });

  it('is not complete when only the last instrument is missing', () => {
    const status = getScreeningStatus(results(SCREENING_IDS.slice(0, -1)));
    expect(status.complete).toBe(false);
    expect(status.nextId).toBe('socialmedia');
  });
});

// ─── 2. Daily diary additions ─────────────────────────────────────────────────

const sectionItems = (questions, section) => questions.filter((q) => q.section === section);

describe('daily diaries — ids and order', () => {
  it.each([
    ['morning', MORNING_QUESTIONS],
    ['evening', EVENING_QUESTIONS],
  ])('%s question ids are unique', (_, questions) => {
    const ids = questions.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('morning: the new sections follow the sleep diary and the comments box stays last', () => {
    const ids = MORNING_QUESTIONS.map((q) => q.id);
    expect(ids.indexOf('mq_kss')).toBeGreaterThan(ids.indexOf('mq12'));
    expect(ids[ids.length - 1]).toBe('mq13');
    expect(ids.indexOf('mq_call')).toBeLessThan(ids.indexOf('mq13'));
  });

  it('evening: the new sections come first and the sleep diary follows', () => {
    const ids = EVENING_QUESTIONS.map((q) => q.id);
    expect(ids[0]).toBe('eq_kss');
    expect(ids.indexOf('eq_p8a_8')).toBeLessThan(ids.indexOf('eq1'));
  });
});

describe('daily diaries — morning additions', () => {
  it('KSS is the 9-point scale, valued 1–9', () => {
    const [kss] = sectionItems(MORNING_QUESTIONS, 'KSS');
    expect(kss.options.map((o) => o.value)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(kss.options[0].label).toBe('Extremely alert');
    expect(kss.options[8].label).toBe('Very sleepy, great effort to keep awake, fighting sleep');
  });

  it('media usage is six duration items, then a text-message and a call question', () => {
    const media = sectionItems(MORNING_QUESTIONS, 'Media usage');
    expect(media).toHaveLength(8);
    expect(media.slice(0, 6).every((q) => q.type === 'rating' && q.options.length === 5)).toBe(true);
    expect(media.slice(0, 6).every((q) => q.preface.startsWith('Two hours before going to sleep'))).toBe(true);
    expect(media.slice(6).map((q) => [q.id, q.type])).toEqual([['mq_text', 'yes_no'], ['mq_call', 'yes_no']]);
  });
});

describe('daily diaries — evening additions', () => {
  it('adds KSS, 20 PANAS items and the four PROMIS forms (4 + 6 + 7 + 8 items)', () => {
    expect(sectionItems(EVENING_QUESTIONS, 'KSS')).toHaveLength(1);
    expect(sectionItems(EVENING_QUESTIONS, 'PANAS')).toHaveLength(20);
    expect(sectionItems(EVENING_QUESTIONS, 'PROMIS 4a')).toHaveLength(4);
    expect(sectionItems(EVENING_QUESTIONS, 'PROMIS 6a')).toHaveLength(6);
    expect(sectionItems(EVENING_QUESTIONS, 'PROMIS 7a')).toHaveLength(7);
    expect(sectionItems(EVENING_QUESTIONS, 'PROMIS 8a')).toHaveLength(8);
  });

  it('daily PANAS uses the same terms, in the same order, as the screening PANAS', () => {
    const daily = sectionItems(EVENING_QUESTIONS, 'PANAS').map((q) => q.text);
    expect(daily).toEqual(PANAS.items.map((i) => i.text));
  });

  it('PROMIS 6a runs Always → Never; the other forms run Not at all → Very much', () => {
    const labels = (section) => sectionItems(EVENING_QUESTIONS, section)[0].options.map((o) => o.label);
    expect(labels('PROMIS 6a')).toEqual(['Always', 'Usually', 'Sometimes', 'Rarely', 'Never']);
    for (const s of ['PROMIS 4a', 'PROMIS 7a', 'PROMIS 8a']) {
      expect(labels(s)).toEqual(['Not at all', 'A little bit', 'Somewhat', 'Quite a bit', 'Very much']);
    }
  });

  it('every item is numbered 1..n within its section', () => {
    const sections = [...new Set(EVENING_QUESTIONS.filter((q) => q.section).map((q) => q.section))];
    for (const s of sections) {
      expect(sectionItems(EVENING_QUESTIONS, s).map((q) => q.number)).toEqual(
        sectionItems(EVENING_QUESTIONS, s).map((_, i) => i + 1),
      );
    }
  });
});

// ─── 3. CSV export of object-valued results ───────────────────────────────────

describe('exportToCSV — Light History and object scores', () => {
  it('writes readable text instead of [object Object]', async () => {
    await saveQuestionnaire('lighthistory', {
      lh_country: 'Brazil',
      lh_home_years: { from: 1995, to: 2018 },
      lh_arrival: { month: 3, year: 2018 },
      lh_uk_duration: { months: 30 },
      lh_study_date: { month: 10, year: 2026 },
    }, null);
    await saveQuestionnaire('ghq12', { ghq1: 0 }, { likert: 14, ghq: 4 });
    await saveQuestionnaire('psqi', { psqi1: { hour: 23, minute: 5 } }, 3);

    const csv = await exportToCSV('P1');
    expect(csv).not.toContain('[object Object]');
    expect(csv).toContain('"Brazil"');
    expect(csv).toContain('"1995-2018"');
    expect(csv).toContain('"2018-03"');
    expect(csv).toContain('"30"');
    expect(csv).toContain('"2026-10"');
    expect(csv).toContain('"likert=14;ghq=4"');
    expect(csv).toContain('"23:05"');
  });

  it('writes the date of birth as YYYY-MM-DD and the gender as readable text', async () => {
    await saveQuestionnaire('demographics', {
      dem_dob: { day: 5, month: 3, year: 1990 },
      dem_gender: 'non_binary',
    }, null);

    const csv = await exportToCSV('P1');
    expect(csv).not.toContain('[object Object]');
    expect(csv).toContain('"1990-03-05"');
    expect(csv).toContain('"non_binary"');
  });

  it('writes whole_life when the participant chose "Whole life"', async () => {
    await saveQuestionnaire('lighthistory', { lh_uk_duration: { wholeLife: true } }, null);
    expect(await exportToCSV('P1')).toContain('"whole_life"');
  });
});
