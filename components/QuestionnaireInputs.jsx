/**
 * components/QuestionnaireInputs.jsx — Input types for the Light History questionnaire
 *
 * Used by app/QuestionnaireScreen.jsx (purple, one-time questionnaires):
 *
 *   country               type to search, tap a match            → 'Brazil'
 *   year_range            two year steppers (from / to)          → { from: 1995, to: 2018 }
 *   month_year            month + year steppers                  → { month: 3, year: 2021 }
 *   months_or_whole_life  months stepper OR a "Whole life" chip  → { months: 30 } | { wholeLife: true }
 *
 * All four start empty (null) so a participant cannot click through on a
 * default value by accident. The first tap on a stepper sets a sensible
 * starting value; the matching isValid* helper decides when "Next" unlocks.
 *
 * Text here is English on purpose, like the other one-time instruments.
 */
import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES } from '../data/countries';
import { FONTS } from '../theme/typography';

const C = { primary: '#6B3FA0', primaryLight: '#C4A8E0' };

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MIN_YEAR = 1900;
const MAX_MONTHS = 1200; // 100 years

const pad = (n) => String(n).padStart(2, '0');
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);
const thisYear = () => new Date().getFullYear();

// ─── Helpers shared with QuestionnaireScreen ──────────────────────────────────

export const currentMonthYear = () => {
  const d = new Date();
  return { month: d.getMonth() + 1, year: d.getFullYear() };
};

export const isValidYearRange = (v) =>
  !!v && Number.isInteger(v.from) && Number.isInteger(v.to) && v.to >= v.from;

export const isValidMonthYear = (v) =>
  !!v && Number.isInteger(v.month) && v.month >= 1 && v.month <= 12 && Number.isInteger(v.year);

export const isValidMonthsOrWholeLife = (v) =>
  !!v && (v.wholeLife === true || (Number.isInteger(v.months) && v.months >= 0));

// ─── Building blocks ──────────────────────────────────────────────────────────

/** Round/square button that fires once on tap and repeats while held. */
const RepeatButton = ({ onStep, name, round = false, accessibilityLabel }) => {
  const stepRef  = useRef(onStep);
  const timerRef = useRef(null);
  useEffect(() => { stepRef.current = onStep; }, [onStep]);

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);
  const start = useCallback(() => {
    stepRef.current();
    timerRef.current = setInterval(() => stepRef.current(), 150);
  }, []);
  useEffect(() => stop, [stop]);

  return (
    <Pressable
      style={round ? styles.roundBtn : styles.stepBtn}
      onPress={() => stepRef.current()}
      onLongPress={start}
      onPressOut={stop}
      delayLongPress={300}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Ionicons name={name} size={round ? 24 : 20} color={C.primary} />
    </Pressable>
  );
};

const StepperColumn = ({ display, label, onUp, onDown, upLabel, downLabel, width }) => (
  <View style={styles.col}>
    <RepeatButton onStep={onUp} name="caret-up" accessibilityLabel={upLabel} />
    <Text style={[styles.value, width ? { minWidth: width } : null]}>{display}</Text>
    <RepeatButton onStep={onDown} name="caret-down" accessibilityLabel={downLabel} />
    {!!label && <Text style={styles.colLabel}>{label}</Text>}
  </View>
);

// ─── Country ──────────────────────────────────────────────────────────────────

const fold = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const CountryInput = ({ value, onChange }) => {
  const [query, setQuery] = useState('');

  const matches = useMemo(() => {
    const q = fold(query.trim());
    if (!q) return [];
    return COUNTRIES
      .filter((c) => fold(c).includes(q))
      .sort((a, b) => Number(fold(b).startsWith(q)) - Number(fold(a).startsWith(q)))
      .slice(0, 8);
  }, [query]);

  if (value) {
    return (
      <View style={styles.countryChosen}>
        <Ionicons name="location-outline" size={22} color={C.primary} />
        <Text style={styles.countryChosenText}>{value}</Text>
        <TouchableOpacity
          onPress={() => { onChange(null); setQuery(''); }}
          style={styles.changeBtn}
          accessibilityRole="button"
          accessibilityLabel="Change country"
        >
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.countryWrap}>
      <TextInput
        style={styles.searchInput}
        value={query}
        onChangeText={setQuery}
        placeholder="Start typing a country name"
        placeholderTextColor="#94A3B8"
        autoCorrect={false}
        autoCapitalize="words"
        accessibilityLabel="Search for a country"
      />
      {matches.map((c) => (
        <TouchableOpacity
          key={c}
          style={styles.matchRow}
          onPress={() => onChange(c)}
          activeOpacity={0.8}
          accessibilityRole="button"
        >
          <Text style={styles.matchText}>{c}</Text>
        </TouchableOpacity>
      ))}
      {!!query.trim() && matches.length === 0 && (
        <Text style={styles.helper}>No match. Check the spelling, or search for “Other”.</Text>
      )}
    </View>
  );
};

// ─── Year range ───────────────────────────────────────────────────────────────

export const YearRangeInput = ({ value, onChange }) => {
  const v = value ?? { from: null, to: null };
  const max = thisYear();
  const DEFAULT_FROM = 2000;

  const step = (field, delta) => {
    const dflt = field === 'from' ? DEFAULT_FROM : max;
    const next = v[field] == null ? dflt : clamp(v[field] + delta, MIN_YEAR, max);
    onChange({ ...v, [field]: next });
  };

  const bad = v.from != null && v.to != null && v.to < v.from;

  return (
    <View style={styles.centre}>
      <View style={styles.row}>
        <StepperColumn
          display={v.from == null ? '----' : String(v.from)}
          label="From"
          onUp={() => step('from', 1)} onDown={() => step('from', -1)}
          upLabel="Start year, later" downLabel="Start year, earlier"
        />
        <Text style={styles.sep}>to</Text>
        <StepperColumn
          display={v.to == null ? '----' : String(v.to)}
          label="To"
          onUp={() => step('to', 1)} onDown={() => step('to', -1)}
          upLabel="End year, later" downLabel="End year, earlier"
        />
      </View>
      {bad && <Text style={styles.warning}>The end year can’t be before the start year.</Text>}
    </View>
  );
};

// ─── Month + year ─────────────────────────────────────────────────────────────

export const MonthYearInput = ({ value, onChange }) => {
  const now = currentMonthYear();
  const v = value ?? { month: null, year: null };
  const empty = v.month == null || v.year == null;

  const stepMonth = (d) => {
    if (empty) { onChange({ month: now.month, year: now.year }); return; }
    let month = ((v.month - 1 + d + 12) % 12) + 1;
    if (v.year === now.year && month > now.month) month = d > 0 ? 1 : now.month;
    onChange({ month, year: v.year });
  };

  const stepYear = (d) => {
    if (empty) { onChange({ month: now.month, year: now.year }); return; }
    const year = clamp(v.year + d, MIN_YEAR, now.year);
    const month = year === now.year && v.month > now.month ? now.month : v.month;
    onChange({ month, year });
  };

  return (
    <View style={styles.row}>
      <StepperColumn
        display={empty ? '--' : pad(v.month)}
        label={empty ? 'Month' : MONTHS[v.month - 1]}
        onUp={() => stepMonth(1)} onDown={() => stepMonth(-1)}
        upLabel="Next month" downLabel="Previous month"
      />
      <Text style={styles.sep}>:</Text>
      <StepperColumn
        display={empty ? '----' : String(v.year)}
        label="Year"
        onUp={() => stepYear(1)} onDown={() => stepYear(-1)}
        upLabel="Next year" downLabel="Previous year"
      />
    </View>
  );
};

// ─── Months, or whole life ────────────────────────────────────────────────────

export const MonthsOrWholeLifeInput = ({ value, onChange }) => {
  const whole  = value?.wholeLife === true;
  const months = Number.isInteger(value?.months) ? value.months : null;

  const step = (d) => onChange({ months: clamp((months ?? 0) + d, 0, MAX_MONTHS) });
  const years = months != null && months >= 12
    ? `${Math.floor(months / 12)} y ${months % 12} m`
    : null;

  return (
    <View style={styles.centre}>
      <View style={[styles.centre, whole && styles.dimmed]} pointerEvents={whole ? 'none' : 'auto'}>
        <View style={styles.numberRow}>
          <RepeatButton round onStep={() => step(-1)} name="remove" accessibilityLabel="One month less" />
          <Text style={styles.numValue}>{months == null ? '—' : months}</Text>
          <RepeatButton round onStep={() => step(1)} name="add" accessibilityLabel="One month more" />
          <Text style={styles.numUnit}>months</Text>
        </View>
        <View style={styles.yearRow}>
          <TouchableOpacity style={styles.yearBtn} onPress={() => step(-12)} accessibilityRole="button">
            <Text style={styles.yearBtnText}>− 1 year</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.yearBtn} onPress={() => step(12)} accessibilityRole="button">
            <Text style={styles.yearBtnText}>+ 1 year</Text>
          </TouchableOpacity>
        </View>
        {!!years && <Text style={styles.helper}>{years}</Text>}
      </View>

      <Text style={styles.orText}>OR</Text>

      <TouchableOpacity
        style={[styles.wholeChip, whole && styles.wholeChipOn]}
        onPress={() => onChange(whole ? null : { wholeLife: true })}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityState={{ selected: whole }}
      >
        {whole && <Ionicons name="checkmark" size={20} color="#fff" />}
        <Text style={[styles.wholeChipText, whole && { color: '#fff' }]}>Whole life</Text>
      </TouchableOpacity>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const glass = {
  backgroundColor: 'rgba(255,255,255,0.72)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.9)',
  shadowColor: C.primary,
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.18,
  shadowRadius: 8,
  elevation: 5,
};

const styles = StyleSheet.create({
  centre:   { alignItems: 'center', gap: 14 },
  row:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  col:      { alignItems: 'center', gap: 12 },
  stepBtn:  { width: 52, height: 44, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: C.primaryLight },
  roundBtn: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', ...glass },
  value:    { fontSize: 36, fontFamily: FONTS.heading, color: C.primary, minWidth: 110, textAlign: 'center' },
  colLabel: { fontSize: 13, fontFamily: FONTS.bodyMedium, color: C.primary },
  sep:      { fontSize: 24, fontFamily: FONTS.heading, color: C.primary, marginTop: -14 },
  warning:  { fontSize: 14, fontFamily: FONTS.bodyMedium, color: '#B91C1C', textAlign: 'center' },
  helper:   { fontSize: 14, fontFamily: FONTS.bodyMedium, color: '#64748B', textAlign: 'center' },
  dimmed:   { opacity: 0.35 },

  countryWrap: { gap: 8, alignSelf: 'stretch' },
  searchInput: { ...glass, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, fontSize: 18, fontFamily: FONTS.bodyMedium, color: C.primary },
  matchRow:    { ...glass, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, shadowOpacity: 0.08, elevation: 2 },
  matchText:   { fontSize: 17, fontFamily: FONTS.bodyMedium, color: C.primary },
  countryChosen:     { ...glass, alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12 },
  countryChosenText: { flex: 1, fontSize: 18, fontFamily: FONTS.heading, color: C.primary },
  changeBtn:         { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: C.primaryLight },
  changeBtnText:     { fontSize: 14, fontFamily: FONTS.body, color: C.primary },

  numberRow: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  numValue:  { fontSize: 48, fontFamily: FONTS.heading, color: C.primary, minWidth: 80, textAlign: 'center' },
  numUnit:   { fontSize: 16, fontFamily: FONTS.bodyMedium, color: C.primary },
  yearRow:   { flexDirection: 'row', gap: 12 },
  yearBtn:   { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 18, backgroundColor: C.primaryLight },
  yearBtnText: { fontSize: 15, fontFamily: FONTS.body, color: C.primary },
  orText:    { fontSize: 14, fontFamily: FONTS.heading, color: '#64748B', letterSpacing: 1 },
  wholeChip: { ...glass, flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 28, paddingHorizontal: 28, paddingVertical: 14 },
  wholeChipOn:   { backgroundColor: C.primary, borderColor: C.primary },
  wholeChipText: { fontSize: 18, fontFamily: FONTS.body, color: C.primary },
});

// ─── Date (day / month / year) ───────────────────────────────────────────────────

const daysInMonth = (month, year) => new Date(year, month, 0).getDate();

/** Valid calendar date, not in the future, from MIN_YEAR onwards. */
export const isValidDate = (v) => {
  if (!v || !Number.isInteger(v.day) || !Number.isInteger(v.month) || !Number.isInteger(v.year)) return false;
  if (v.month < 1 || v.month > 12 || v.year < MIN_YEAR) return false;
  if (v.day < 1 || v.day > daysInMonth(v.month, v.year)) return false;
  return new Date(v.year, v.month - 1, v.day) <= new Date();
};

/**
 * Day / month / year steppers, e.g. for a date of birth.
 * Starts empty; the first tap fills in a starting date 30 years back, and
 * ±10-year buttons make large jumps quick. Stepping never produces an
 * impossible date (31 February) or a date in the future.
 */
export const DateInput = ({ value, onChange }) => {
  const today = new Date();
  const thisY = today.getFullYear();
  const v = value ?? { day: null, month: null, year: null };
  const empty = v.day == null || v.month == null || v.year == null;

  // Largest day allowed in a month, never later than today.
  const maxDay = (month, year) => {
    const max = daysInMonth(month, year);
    return year === thisY && month === today.getMonth() + 1 ? Math.min(max, today.getDate()) : max;
  };

  // Pull any combination back to a real date that is not in the future.
  const fit = (day, month, year) => {
    const y = clamp(year, MIN_YEAR, thisY);
    let m = clamp(month, 1, 12);
    if (y === thisY && m > today.getMonth() + 1) m = today.getMonth() + 1;
    return { day: clamp(day, 1, maxDay(m, y)), month: m, year: y };
  };

  const step = (field, d) => {
    if (empty) { onChange(fit(1, 1, thisY - 30)); return; }
    if (field === 'day') {
      const max = maxDay(v.month, v.year);
      const next = v.day + d;
      onChange({ ...v, day: next > max ? 1 : next < 1 ? max : next });
    } else if (field === 'month') {
      const month = ((v.month - 1 + d + 12) % 12) + 1;
      onChange(fit(v.day, month, v.year));
    } else {
      onChange(fit(v.day, v.month, v.year + d));
    }
  };

  return (
    <View style={styles.centre}>
      <View style={[styles.row, { gap: 8 }]}>
        <StepperColumn
          display={empty ? '--' : pad(v.day)} label="Day" width={64}
          onUp={() => step('day', 1)} onDown={() => step('day', -1)}
          upLabel="Next day" downLabel="Previous day"
        />
        <Text style={styles.sep}>/</Text>
        <StepperColumn
          display={empty ? '--' : pad(v.month)} label={empty ? 'Month' : MONTHS[v.month - 1]} width={64}
          onUp={() => step('month', 1)} onDown={() => step('month', -1)}
          upLabel="Next month" downLabel="Previous month"
        />
        <Text style={styles.sep}>/</Text>
        <StepperColumn
          display={empty ? '----' : String(v.year)} label="Year" width={96}
          onUp={() => step('year', 1)} onDown={() => step('year', -1)}
          upLabel="Next year" downLabel="Previous year"
        />
      </View>
      <View style={styles.yearRow}>
        <TouchableOpacity style={styles.yearBtn} onPress={() => step('year', -10)} accessibilityRole="button">
          <Text style={styles.yearBtnText}>− 10 years</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.yearBtn} onPress={() => step('year', 10)} accessibilityRole="button">
          <Text style={styles.yearBtnText}>+ 10 years</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
