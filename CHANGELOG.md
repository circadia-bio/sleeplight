# Changelog

All notable changes to Sleep Light will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

Sleep Light was forked from [SleepDiaries v1.2.0](https://github.com/circadia-bio/SleepDiaries/releases/tag/v1.2.0). The history of the original app is in that repository's changelog.

---

## [0.1.0] — 2026-10-19

First version of Sleep Light.

### Added

- **Screening battery**: seven one-time questionnaires completed before the diaries unlock, in this order: GHQ-12, MCTQ, ESS, PSQI, PANAS, Light History Information and Social Media Usage. Each is saved as soon as it is finished, so a participant can stop and resume at the next unfinished questionnaire
- **Screening card on Home** (purple, matching the questionnaire screens) showing progress ("3 of 7 questionnaires done") and opening the next unfinished questionnaire. It stays on Home as a locked, completed card afterwards
- **Diary gate**: the morning and evening diaries stay locked until the screening battery is complete. This applies on Home, on the Diary tab and when opening a diary directly
- **Locked once answered**: a completed screening questionnaire cannot be redone. The questionnaire list shows a lock instead of "Redo", and re-opening one shows a notice
- **Light History inputs**: type-to-search country list, from/to year steppers, month and year steppers, and months-or-"Whole life". They start empty so they cannot be clicked through on a default. The study date is pre-filled with the current month
- **GHQ-12** stores the raw item values and computes both the Likert total (0–36) and the GHQ-scored total (0–12). Participants are not shown a classification
- **PANAS** (screening and evening diary) stores the raw 1–5 answers and computes positive-affect and negative-affect totals (10–50 each), with no reversal. The wording and scale are shared between both uses (`data/panas.js`)
- **Morning diary additions**: KSS (9-point), media use in the two hours before sleep (six items), and yes/no questions about texts and calls after lights-out. The comments box stays last
- **Evening diary additions**: KSS, PANAS and PROMIS social function short forms 4a, 6a, 7a and 8a, followed by the sleep diary. Each section shows a label such as "PANAS · 7/20" and keeps its instruction at the top of every page
- **Tests**: scoring and structure for the new instruments, screening progress, the extra diary questions and CSV export of the new answer shapes

### Changed

- **App renamed to Sleep Light**: app name, slug, URL scheme, bundle identifiers (`com.circadia.sleeplight`), PWA manifest, service-worker cache name, web page tags and the brand text in the English, Portuguese and Swedish strings
- **Deploy script** (`scripts/deploy.sh`) added for Sleep Light. It takes the app name and site address from two variables at the top and does not include analytics
- **Past entries** label questionnaire items by section and show the chosen option instead of "n/5"
- **Final report** lists only the scored screening questionnaires (ESS, PSQI, MCTQ). GHQ-12, PANAS, Light History and Social Media Usage are research-only and are not shown back to participants
- **Swedish and Portuguese**: the new questionnaire items stay in English, like the other research instruments. The Swedish test now expects this

### Fixed

- **CSV export of time and range answers**: object-valued answers and scores (PSQI and MCTQ times, for example) were written as `[object Object]`. They now export as readable text such as `23:05`, `1995-2018`, `2018-03` or `whole_life`

### Removed

- ISI, DBAS-16, MEQ, RU-SATED, STOP-BANG and the one-time KSS from the questionnaire list. The KSS is now part of the daily diaries
