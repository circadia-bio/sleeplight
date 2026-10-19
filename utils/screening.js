/**
 * utils/screening.js — Screening battery progress
 *
 * Participants complete the screening battery (data/questionnaires.js) once,
 * before the morning and evening diaries unlock. Each instrument is saved the
 * moment it is finished, so the battery can be resumed one instrument at a time.
 *
 * getScreeningStatus() takes the stored questionnaire results and returns:
 *   done     number of battery instruments completed
 *   total    number of instruments in the battery
 *   complete true once every instrument is done (diaries unlock)
 *   nextId   id of the first unfinished instrument, or null when complete
 */
import { SCREENING_IDS } from '../data/questionnaires';

export const getScreeningStatus = (results = []) => {
  const completed = new Set(results.map((r) => r.id));
  const done = SCREENING_IDS.filter((id) => completed.has(id)).length;
  const nextId = SCREENING_IDS.find((id) => !completed.has(id)) ?? null;
  return { done, total: SCREENING_IDS.length, complete: nextId === null, nextId };
};

/** Status used before anything has loaded: nothing done, battery starts at the first instrument. */
export const EMPTY_SCREENING = {
  done: 0,
  total: SCREENING_IDS.length,
  complete: false,
  nextId: SCREENING_IDS[0] ?? null,
};
