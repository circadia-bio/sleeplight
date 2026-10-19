/**
 * __tests__/questionnaires.test.js
 *
 * Unit tests for the score() and interpret() functions of every instrument in
 * the screening battery defined in data/questionnaires.js.
 *
 * Coverage strategy per instrument:
 *   1. score() with all items at their minimum value
 *   2. score() with all items at their maximum value
 *   3. One or more hand-verified reference cases (known answers → known score)
 *   4. interpret() returns the correct band label at every threshold boundary
 *
 * PSQI additionally tests each of the 7 component-score sub-calculations
 * in isolation before testing the global score.
 *
 * MCTQ tests the MSFsc and social-jetlag (SJL) derivations numerically,
 * and verifies that interpret() selects the right chronotype label.
 *
 * GHQ-12 and PANAS store raw item values and return two totals each; the
 * Light History and Social Media instruments are descriptive only.
 */

import {
  ESS, PSQI, MCTQ, GHQ12, PANAS, LIGHTHISTORY, SOCIALMEDIA,
  QUESTIONNAIRES, SCREENING_IDS, getQuestionnaire,
} from '../data/questionnaires';

// ─── Registry ─────────────────────────────────────────────────────────────────

describe('screening battery registry', () => {
  it('lists the Sleep Light instruments in completion order', () => {
    expect(SCREENING_IDS).toEqual(['ghq12', 'mctq', 'ess', 'psqi', 'panas', 'lighthistory', 'socialmedia']);
  });

  it('every instrument is locked once completed', () => {
    for (const q of QUESTIONNAIRES) expect(q.locked).toBe(true);
  });

  it('every instrument has unique item ids and a credit line', () => {
    for (const q of QUESTIONNAIRES) {
      const ids = q.items.map((i) => i.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(q.credit).toBeTruthy();
    }
  });

  it('getQuestionnaire finds an instrument by id and returns null otherwise', () => {
    expect(getQuestionnaire('ess')).toBe(ESS);
    expect(getQuestionnaire('isi')).toBeNull();
  });

  it('research-only instruments are flagged noFeedback; scored ones are not', () => {
    expect([GHQ12, PANAS, LIGHTHISTORY, SOCIALMEDIA].every((q) => q.noFeedback === true)).toBe(true);
    expect([ESS, PSQI, MCTQ].every((q) => !q.noFeedback)).toBe(true);
  });
});

// ─── GHQ-12 ───────────────────────────────────────────────────────────────────

describe('GHQ-12 — items', () => {
  it('has 12 single-choice items with four options valued 0–3', () => {
    expect(GHQ12.items).toHaveLength(12);
    for (const item of GHQ12.items) {
      expect(item.type).toBe('single_choice');
      expect(item.options.map((o) => o.value)).toEqual([0, 1, 2, 3]);
    }
  });
});

describe('GHQ-12 — score()', () => {
  const all = (v) => Object.fromEntries(GHQ12.items.map((i) => [i.id, v]));

  it('returns 0 / 0 when every item is the first option', () => {
    expect(GHQ12.score(all(0))).toEqual({ likert: 0, ghq: 0 });
  });

  it('returns 36 / 12 when every item is the last option', () => {
    expect(GHQ12.score(all(3))).toEqual({ likert: 36, ghq: 12 });
  });

  it('Likert sums the item values; GHQ scoring counts responses 2 and 3', () => {
    // 12 items: four 0s, four 1s, two 2s, two 3s → Likert 0+4+4+6 = 14; GHQ = 4
    const values = [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 3, 3];
    const a = Object.fromEntries(GHQ12.items.map((item, i) => [item.id, values[i]]));
    expect(GHQ12.score(a)).toEqual({ likert: 14, ghq: 4 });
  });

  it('treats missing items as 0', () => {
    expect(GHQ12.score({})).toEqual({ likert: 0, ghq: 0 });
  });

  it('does not show the participant a classification', () => {
    expect(GHQ12.interpret({ likert: 30, ghq: 10 }).label).toBe('Recorded');
  });
});

// ─── PANAS ────────────────────────────────────────────────────────────────────

describe('PANAS — items', () => {
  it('has 20 single-choice items valued 1–5, in the published order', () => {
    expect(PANAS.items).toHaveLength(20);
    expect(PANAS.items[0].text).toBe('Interested');
    expect(PANAS.items[19].text).toBe('Afraid');
    for (const item of PANAS.items) {
      expect(item.options.map((o) => o.value)).toEqual([1, 2, 3, 4, 5]);
    }
  });
});

describe('PANAS — score()', () => {
  const all = (v) => Object.fromEntries(PANAS.items.map((i) => [i.id, v]));

  it('returns 10 / 10 when every item is 1', () => {
    expect(PANAS.score(all(1))).toEqual({ pa: 10, na: 10 });
  });

  it('returns 50 / 50 when every item is 5', () => {
    expect(PANAS.score(all(5))).toEqual({ pa: 50, na: 50 });
  });

  it('sums positive items (1,3,5,9,10,12,14,16,17,19) and negative items (2,4,6,7,8,11,13,15,18,20) separately', () => {
    // Positive items = 5, negative items = 2 → PA 50, NA 20. No reversal.
    const positive = [1, 3, 5, 9, 10, 12, 14, 16, 17, 19];
    const a = {};
    for (let n = 1; n <= 20; n++) a[`panas${n}`] = positive.includes(n) ? 5 : 2;
    expect(PANAS.score(a)).toEqual({ pa: 50, na: 20 });
  });
});

// ─── Light History ────────────────────────────────────────────────────────────

describe('Light History — items', () => {
  it('uses the four Light History input types, in the order of the study document', () => {
    expect(LIGHTHISTORY.items.map((i) => i.type)).toEqual([
      'country', 'year_range', 'month_year', 'months_or_whole_life', 'month_year',
    ]);
  });

  it('pre-fills only the study date', () => {
    expect(LIGHTHISTORY.items.filter((i) => i.defaultValue === 'now').map((i) => i.id)).toEqual(['lh_study_date']);
  });

  it('has nothing to score', () => {
    expect(LIGHTHISTORY.score({})).toBeNull();
  });
});

// ─── Social Media Usage ───────────────────────────────────────────────────────

describe('Social Media Usage — items', () => {
  it('has 17 items on the nine-level frequency scale', () => {
    expect(SOCIALMEDIA.items).toHaveLength(17);
    for (const item of SOCIALMEDIA.items) {
      expect(item.options).toHaveLength(9);
      expect(item.options[0].label).toBe('Never');
      expect(item.options[8].label).toBe('Hourly or more');
    }
  });

  it('has nothing to score', () => {
    expect(SOCIALMEDIA.score({})).toBeNull();
  });
});

// ─── ESS ──────────────────────────────────────────────────────────────────────

describe('ESS — score()', () => {
  it('returns 0 when all items are 0', () => {
    const a = {};
    [1,2,3,4,5,6,7,8].forEach((n) => { a[`ess${n}`] = 0; });
    expect(ESS.score(a)).toBe(0);
  });

  it('returns 24 when all items are 3', () => {
    const a = {};
    [1,2,3,4,5,6,7,8].forEach((n) => { a[`ess${n}`] = 3; });
    expect(ESS.score(a)).toBe(24);
  });

  it('sums item values correctly for a mixed response set', () => {
    // ess1=2, ess2=1, ess3=3, ess4=0, ess5=2, ess6=1, ess7=2, ess8=1 → 12
    const a = { ess1:2, ess2:1, ess3:3, ess4:0, ess5:2, ess6:1, ess7:2, ess8:1 };
    expect(ESS.score(a)).toBe(12);
  });

  it('treats missing items as 0', () => {
    expect(ESS.score({})).toBe(0);
  });
});

describe('ESS — interpret()', () => {
  it('Normal at score 0', ()        => expect(ESS.interpret(0).label).toBe('Normal'));
  it('Normal at score 7', ()        => expect(ESS.interpret(7).label).toBe('Normal'));
  it('Borderline at score 8', ()    => expect(ESS.interpret(8).label).toBe('Borderline'));
  it('Borderline at score 9', ()    => expect(ESS.interpret(9).label).toBe('Borderline'));
  it('Excessive at score 10', ()    => expect(ESS.interpret(10).label).toBe('Excessive'));
  it('Excessive at score 15', ()    => expect(ESS.interpret(15).label).toBe('Excessive'));
  it('Severe at score 16', ()       => expect(ESS.interpret(16).label).toBe('Severe'));
  it('Severe at score 24', ()       => expect(ESS.interpret(24).label).toBe('Severe'));
});

// ─── PSQI ─────────────────────────────────────────────────────────────────────

/**
 * PSQI scoring reference:
 *   C1 — Subjective sleep quality (psqi9, 0–3)
 *   C2 — Sleep latency (psqi2 minutes + psqi5a, combined 0–3)
 *   C3 — Sleep duration (psqi4 hours, 0–3)
 *   C4 — Habitual sleep efficiency (derived from psqi1, psqi3, psqi4, 0–3)
 *   C5 — Sleep disturbance (sum of psqi5b–5i, 0–3)
 *   C6 — Use of sleeping medication (psqi6, 0–3)
 *   C7 — Daytime dysfunction (psqi7 + psqi8, combined 0–3)
 *   Global = C1+C2+C3+C4+C5+C6+C7 (0–21)
 */

const psqiAllGood = {
  psqi1: { hour: 23, minute: 0 },  // bedtime 23:00
  psqi2: 10,                        // SOL 10 min → solScore 0
  psqi3: { hour: 7, minute: 0 },   // rise 07:00
  psqi4: 7.5,                       // 7.5 h sleep → C3=0
  psqi5a: 0, psqi5b: 0, psqi5c: 0, psqi5d: 0,
  psqi5e: 0, psqi5f: 0, psqi5g: 0, psqi5h: 0, psqi5i: 0,
  psqi6: 0,
  psqi7: 0,
  psqi8: 0,
  psqi9: 0,  // "Very good"
};

describe('PSQI — score() component verification', () => {
  it('C1: psqi9=0 contributes 0 to global', () => {
    const a = { ...psqiAllGood, psqi9: 0 };
    // With all else at best values → global should be 0
    expect(PSQI.score(a)).toBe(0);
  });

  it('C1: psqi9=3 contributes 3 to global', () => {
    const a = { ...psqiAllGood, psqi9: 3 };
    expect(PSQI.score(a)).toBe(3);
  });

  it('C2: SOL 16–30 min + psqi5a=0 → C2=1', () => {
    // solScore=1, q5a=0, c2raw=1 → c2=1
    const a = { ...psqiAllGood, psqi2: 20, psqi5a: 0 };
    expect(PSQI.score(a)).toBe(1);
  });

  it('C2: SOL >60 min + psqi5a=3 → C2=3', () => {
    // solScore=3, q5a=3, c2raw=6 → c2=3
    const a = { ...psqiAllGood, psqi2: 90, psqi5a: 3 };
    expect(PSQI.score(a)).toBe(3);
  });

  it('C3: 7.5 h → C3=0', () => {
    const a = { ...psqiAllGood, psqi4: 7.5 };
    expect(PSQI.score(a)).toBe(0);
  });

  it('C3: 6 h → C3=1 (global=2 because C4 also degrades)', () => {
    // psqi4=6: C3=1, but HSE=(6*60/480)*100=75% also drops C4 to 1 → global=2
    const a = { ...psqiAllGood, psqi4: 6 };
    expect(PSQI.score(a)).toBe(2);
  });

  it('C3: 4.9 h → C3=3 (global=6 because C4 also degrades)', () => {
    // psqi4=4.9: C3=3, HSE=61.25% → C4=3 → global=6
    const a = { ...psqiAllGood, psqi4: 4.9 };
    expect(PSQI.score(a)).toBe(6);
  });

  it('C4: TIB=480 min, sleep=7.5h (450 min) → HSE=93.75% → C4=0', () => {
    // bedtime 23:00, rise 07:00, TIB=480 min, psqi4=7.5h
    // HSE = (7.5*60)/480 * 100 = 93.75 → C4=0
    const a = { ...psqiAllGood }; // defaults already satisfy this
    expect(PSQI.score(a)).toBe(0);
  });

  it('C4: TIB=480 min, sleep=3h → HSE=37.5% → C4=3 (global=6)', () => {
    // psqi4=3: C3=3 (<5h) and HSE=37.5% → C4=3 → global=6
    const a = { ...psqiAllGood, psqi4: 3 };
    expect(PSQI.score(a)).toBe(6);
  });

  it('C5: all disturbance items=0 → C5=0', () => {
    expect(PSQI.score(psqiAllGood)).toBe(0);
  });

  it('C5: all 8 disturbance items=3 → distSum=24 → C5=3', () => {
    const a = {
      ...psqiAllGood,
      psqi5b:3, psqi5c:3, psqi5d:3, psqi5e:3,
      psqi5f:3, psqi5g:3, psqi5h:3, psqi5i:3,
    };
    expect(PSQI.score(a)).toBe(3);
  });

  it('C6: psqi6=2 contributes 2 to global', () => {
    const a = { ...psqiAllGood, psqi6: 2 };
    expect(PSQI.score(a)).toBe(2);
  });

  it('C7: psqi7=2, psqi8=2 → c7raw=4 → C7=2', () => {
    const a = { ...psqiAllGood, psqi7: 2, psqi8: 2 };
    expect(PSQI.score(a)).toBe(2);
  });

  it('C7: psqi7=3, psqi8=3 → c7raw=6 → C7=3', () => {
    const a = { ...psqiAllGood, psqi7: 3, psqi8: 3 };
    expect(PSQI.score(a)).toBe(3);
  });
});

describe('PSQI — score() global reference cases', () => {
  it('returns 0 for a best-case "very good sleeper" response', () => {
    expect(PSQI.score(psqiAllGood)).toBe(0);
  });

  it('returns 21 for a worst-case response', () => {
    // C1=3, C2=3 (sol>60+5a=3), C3=3 (<5h), C4=3 (<65%), C5=3 (dist=24),
    // C6=3, C7=3 (7+8=6)
    const worst = {
      psqi1: { hour: 23, minute: 0 },
      psqi2: 90,      // SOL >60 min → solScore=3
      psqi3: { hour: 7, minute: 0 },
      psqi4: 3,       // <5h → C3=3
      psqi5a: 3,
      psqi5b: 3, psqi5c: 3, psqi5d: 3, psqi5e: 3,
      psqi5f: 3, psqi5g: 3, psqi5h: 3, psqi5i: 3,
      psqi6: 3,
      psqi7: 3,
      psqi8: 3,
      psqi9: 3,
    };
    expect(PSQI.score(worst)).toBe(21);
  });
});

describe('PSQI — interpret()', () => {
  it('Good sleep quality at score 0', ()         => expect(PSQI.interpret(0).label).toBe('Good sleep quality'));
  it('Good sleep quality at score 4', ()         => expect(PSQI.interpret(4).label).toBe('Good sleep quality'));
  it('Poor sleep quality at score 5', ()         => expect(PSQI.interpret(5).label).toBe('Poor sleep quality'));
  it('Poor sleep quality at score 10', ()        => expect(PSQI.interpret(10).label).toBe('Poor sleep quality'));
  it('Severe sleep difficulties at score 11', () => expect(PSQI.interpret(11).label).toBe('Severe sleep difficulties'));
  it('Severe sleep difficulties at score 21', () => expect(PSQI.interpret(21).label).toBe('Severe sleep difficulties'));
});

// ─── MCTQ ─────────────────────────────────────────────────────────────────────

/**
 * Reference computation for a canonical intermediate-chronotype participant:
 *   Workdays (5/7):
 *     Bedtime  23:00, SOL 15 min → sleep onset 23:15
 *     Wake     07:00            → SD_w = 7h 45m = 7.75h, MSW = 23.25 + 7.75/2 = 27.125 → 3.125 h
 *   Free days (2/7):
 *     Bedtime  00:30 (post-midnight) → stored as hour:0, minute:30 → treated as 24.5
 *     SOL      15 min → sleep onset 24.75
 *     Wake     08:30 → 32.5 (+ 24 because <12 on raw) → SD_f = 32.5 - 24.75 = 7.75h
 *     MSF = 24.75 + 7.75/2 = 28.625 → 4.625 h
 *   SD_week = (7.75*5 + 7.75*2)/7 = 7.75, deficit = 7.75 - 7.75 = 0 → MSFsc = MSF = 4.625
 *   SJL = |MSF - MSW| = |4.625 - 3.125| = 1.5 h
 */

const mctqIntermediate = {
  mctq_wd:   5,
  mctq_bt_w: { hour: 23, minute: 0  },
  mctq_sl_w: 15,
  mctq_wt_w: { hour: 7,  minute: 0  },
  mctq_bt_f: { hour: 0,  minute: 30 },
  mctq_sl_f: 15,
  mctq_wt_f: { hour: 8,  minute: 30 },
};

describe('MCTQ — score()', () => {
  it('returns an object with msf_sc and sjl keys', () => {
    const result = MCTQ.score(mctqIntermediate);
    expect(result).toHaveProperty('msf_sc');
    expect(result).toHaveProperty('sjl');
  });

  it('computes MSFsc ≈ 4.63 for the intermediate reference case', () => {
    const { msf_sc } = MCTQ.score(mctqIntermediate);
    expect(msf_sc).toBeCloseTo(4.63, 1);
  });

  it('computes SJL ≈ 1.5 h for the intermediate reference case', () => {
    const { sjl } = MCTQ.score(mctqIntermediate);
    expect(sjl).toBeCloseTo(1.5, 1);
  });

  it('returns zero SJL when workday and free-day schedules are identical', () => {
    const a = {
      mctq_wd:   5,
      mctq_bt_w: { hour: 23, minute: 0 },
      mctq_sl_w: 15,
      mctq_wt_w: { hour: 7,  minute: 0 },
      mctq_bt_f: { hour: 23, minute: 0 },
      mctq_sl_f: 15,
      mctq_wt_f: { hour: 7,  minute: 0 },
    };
    // Both schedules identical → SJL should be 0
    expect(MCTQ.score(a).sjl).toBeCloseTo(0, 2);
  });

  it('handles 0 workdays (only free days) without crashing', () => {
    const a = { ...mctqIntermediate, mctq_wd: 0 };
    expect(() => MCTQ.score(a)).not.toThrow();
  });

  it('handles 7 workdays (no free days) without crashing', () => {
    const a = { ...mctqIntermediate, mctq_wd: 7 };
    expect(() => MCTQ.score(a)).not.toThrow();
  });

  it('MSFsc is within the 0–24 clock range', () => {
    const { msf_sc } = MCTQ.score(mctqIntermediate);
    expect(msf_sc).toBeGreaterThanOrEqual(0);
    expect(msf_sc).toBeLessThan(24);
  });
});

describe('MCTQ — interpret()', () => {
  // interpret receives the score object { msf_sc, sjl }
  it('Extremely early chronotype when msf_sc < 0.5', () => {
    expect(MCTQ.interpret({ msf_sc: 0.3, sjl: 0 }).label).toBe('Extremely early chronotype');
  });

  it('Early chronotype when msf_sc = 1.5', () => {
    expect(MCTQ.interpret({ msf_sc: 1.5, sjl: 0 }).label).toBe('Early chronotype');
  });

  it('Intermediate chronotype when msf_sc = 3.0', () => {
    expect(MCTQ.interpret({ msf_sc: 3.0, sjl: 0 }).label).toBe('Intermediate chronotype');
  });

  it('Late chronotype when msf_sc = 4.63 (reference case)', () => {
    expect(MCTQ.interpret({ msf_sc: 4.63, sjl: 1.5 }).label).toBe('Late chronotype');
  });

  it('Extremely late chronotype when msf_sc = 6.0', () => {
    expect(MCTQ.interpret({ msf_sc: 6.0, sjl: 2 }).label).toBe('Extremely late chronotype');
  });

  it('description mentions social jetlag value', () => {
    const { description } = MCTQ.interpret({ msf_sc: 3.0, sjl: 2.5 });
    expect(description).toContain('2.5');
  });
});
