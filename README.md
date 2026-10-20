# 🌙 Sleep Light

**A research app that pairs a one-time screening battery with daily morning and evening sleep diaries, built with React Native and Expo.**

[![Version](https://img.shields.io/badge/version-0.1.1-blue)](./CHANGELOG.md)
[![Status](https://img.shields.io/badge/status-in%20development-orange)](#)
[![Expo](https://img.shields.io/badge/Expo-55-000020?logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.83-61DAFB?logo=react&logoColor=white)](https://reactnative.dev)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
![PWA](https://img.shields.io/badge/PWA-ready-5A0FC8?logo=pwa&logoColor=white)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web-lightgrey)](#)
[![License: MIT](https://img.shields.io/badge/licence-MIT-yellow)](./LICENSE)

---

![](header.png)

## 📖 What is Sleep Light?

Sleep Light is a cross-platform app (iOS, Android and web) for the Sleep Light study at Circadia Lab, Northumbria University. Participants first complete a set of screening questionnaires. That unlocks two daily diaries: a morning entry about the night just gone and an evening entry about the day.

It is a fork of the [SleepDiaries](https://github.com/circadia-bio/SleepDiaries) protocol template (v1.2.0). The diary engine, final report, export and localisation come from that project. The screening battery, the diary gate and the extra diary questionnaires are specific to Sleep Light.

All data stays on the participant's device until they export it.

---

## ✨ Features

- 🟣 **Screening battery** — eight one-time questionnaires, completed in order and saved one at a time so a participant can stop and resume
- 🔒 **Gated and locked** — the diaries stay locked until screening is complete, and each answered questionnaire is locked against edits
- 🌅 **Morning diary** — the sleep diary, then KSS, media use before sleep, and texts and calls after lights-out
- 🌙 **Evening diary** — KSS, PANAS and PROMIS social function (4a, 6a, 7a, 8a), then the evening sleep diary
- 🔀 **Conditional questions** — follow-ups appear based on earlier answers
- 🧭 **Light History inputs** — country search, year range, month and year, and months-or-"Whole life"
- 📋 **Past entries** — history grouped by date with expandable answers
- 📊 **Final report** — unlocks after 14 morning entries, with colour-coded reference bands and a sleep-pattern actogram
- 🎯 **Age-aware reference ranges** — optional age group adjusts the report bands (stored on the device only)
- 📤 **Data export** — CSV and JSON, including screening results, with JSON import (merge or replace)
- 🛟 **Data-safety reminders** — nudges to install the PWA and to export a backup
- 🔔 **Reminders** — daily morning and evening notifications
- 🌍 **Localisation** — English, Portuguese (Brazil) and Swedish, detected from the device
- 📲 **Installable** — runs as a PWA on iOS, Android and desktop with offline support

---

## 🗂️ Project Structure

```
sleeplight/
├── app/                           # expo-router file-based navigation
│   ├── _layout.jsx                # Root stack, asset preloading, PWA splash
│   ├── index.jsx                  # Onboarding (name, research code, age group)
│   ├── questionnaire.jsx          # Daily diary runner (morning or evening)
│   ├── QuestionnaireScreen.jsx    # ⭐ Screening runner (purple): chaining, locking, result cards
│   ├── QuestionnairesScreen.jsx   # Screening list with progress and locks
│   ├── QuestionnaireCreditsScreen.jsx
│   ├── past-entries.jsx
│   ├── final-report.jsx
│   ├── export.jsx                 # CSV / JSON export and JSON import
│   ├── EntryDatePrompt.jsx        # "Which night is this for?" after midnight
│   └── (tabs)/                    # home.jsx, entry.jsx, settings.jsx
├── components/
│   ├── QuestionnaireInputs.jsx    # Light History inputs: country, year range, month/year, months-or-whole-life
│   ├── EntryCardContent.jsx       # Screening, morning and evening cards (drawn in code)
│   └── …                          # ActogramChart, BottomCards, DataSafetyBanner, NavButtons, …
├── data/
│   ├── questionnaires.js          # ⭐ Screening battery definitions and order
│   ├── questions.js               # ⭐ Daily diary questions, including the Sleep Light sections
│   ├── panas.js                   # PANAS wording, scale and scoring groups (used in both places)
│   ├── countries.js               # Country list for Light History
│   └── questions.pt-BR.js · questions.sv.js · useQuestions.js
├── i18n/                          # en.js · pt-BR.js · sv.js · index.js
├── storage/
│   ├── storage.js                 # AsyncStorage helpers, CSV/JSON export, import
│   ├── EntriesContext.jsx         # Shared cache: entries, today's status, screening progress
│   └── notifications.js
├── utils/
│   ├── screening.js               # ⭐ Screening progress (decides when the diaries unlock)
│   ├── constants.js               # MIN_ENTRIES_FOR_REPORT
│   ├── referenceRanges.js         # Age-banded reference ranges
│   └── …                          # dataSafety, dateEntry, metrics, stats, alert
├── theme/                         # colors.js (morning, evening and screening looks), typography.js
├── web/                           # manifest.json, sw.js, icons, splash screens
├── scripts/
│   ├── deploy.sh                  # Web export, PWA injection, output to docs/
│   └── fix-paths.js
├── __tests__/                     # Jest tests
├── CHANGELOG.md
└── TEMPLATE_SETUP.md              # Fork setup status; delete when finished
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 20 (for example with `fnm use 20`)
- To run on a phone: the Expo development build tooling, Xcode (iOS simulator) or Android Studio (Android emulator)

### Installation

```bash
git clone https://github.com/circadia-bio/sleeplight.git
cd sleeplight
npm install
```

### Run

```bash
npm run web       # browser, usually http://localhost:8081
npm start         # Expo dev server (scan the QR code, or press i / a)
npm run ios       # iOS simulator (needs Xcode)
npm run android   # Android emulator (needs Android Studio)
```

Use a private window (or clear site data) to see the app as a first-time participant, because everything is kept in browser storage.

### Tests

```bash
npm test -- --forceExit
```

### Deploying to the web

```bash
npm run deploy
```

This exports the web build, injects the PWA tags and writes everything to `docs/`. The app name and site address are set at the top of `scripts/deploy.sh`.

---

## 🟣 Screening battery

Participants complete these once, in this order, before the diaries unlock. Progress is saved after each one.

| Instrument | Items | Stored and scored | Shown back to the participant |
|------------|-------|-------------------|-------------------------------|
| About You | 2 | Date of birth and gender (descriptive only) | No |
| GHQ-12 | 12 | Raw 0–3 per item; Likert total (0–36) and GHQ-scored total (0–12) | No |
| MCTQ | 7 | MSFsc (clock time) and social jetlag (hours) | Yes, after 14 morning entries |
| ESS | 8 | 0–24 | Yes, after 14 morning entries |
| PSQI | 17 | Global 0–21 | Yes, after 14 morning entries |
| PANAS | 20 | Raw 1–5; positive and negative affect totals (10–50 each), no reversal | No |
| Light History | 5 | Descriptive answers only | No |
| Social Media Usage | 17 | Raw frequency 0–8 per item | No |

An instrument can set these flags in `data/questionnaires.js`:

| Flag | Effect |
|------|--------|
| `locked` | Cannot be redone once completed |
| `noFeedback` | No score or interpretation is shown; the participant sees a thank-you card |
| `repeatInstructions` | The instructions stay at the top of every item (GHQ-12, PANAS) |

> **Permissions.** GHQ-12 is a licensed instrument (GL Assessment); get permission before using it in a study. The source of the Social Media Usage items is not yet recorded, so its credit line is a placeholder. Several of the other instruments are also under copyright. See the `credit` field in `data/questionnaires.js`, or **Settings → Questionnaire credits** in the app. It is the responsibility of the researcher deploying the app to obtain permissions.

### Input types

| Type | Description |
|------|-------------|
| `scale_0_3`, `scale_0_4`, `scale_1_10`, `single_choice`, `frequency_3`, `frequency_4` | Labelled option lists with explicit values |
| `scale_0_10` | 0–10 picker |
| `yes_no` | Yes / No |
| `time` | HH:MM stepper |
| `duration_min` | Integer minutes stepper |
| `number` | Integer stepper with min, max and unit |
| `country` | Type-to-search country list → `'Brazil'` |
| `date` | Day, month and year steppers → `{ day, month, year }` (cannot be in the future) |
| `year_range` | From/to year steppers → `{ from, to }` |
| `month_year` | Month and year steppers → `{ month, year }` (`defaultValue: 'now'` pre-fills this month) |
| `months_or_whole_life` | Months stepper or "Whole life" → `{ months }` or `{ wholeLife: true }` |

Any item can include a `hint`, shown as a small info box under the question.

### Adding a questionnaire

Define the instrument in `data/questionnaires.js` and add it to `QUESTIONNAIRES`. Its position in that array is the order participants complete it in, and the diaries unlock only when every instrument in the array is done.

---

## 📝 Daily diaries

The sleep diary questions come from SleepDiaries. Sleep Light adds the following sections (`data/questions.js`).

| Diary | Section | Items |
|-------|---------|-------|
| Morning | KSS | 1 (9-point scale) |
| Morning | Media usage | 6 duration items (two hours before sleep), then texts and calls after lights-out (yes/no) |
| Evening | KSS | 1 |
| Evening | PANAS | 20 (past day) |
| Evening | PROMIS 4a, 6a, 7a, 8a | 4 + 6 + 7 + 8 |

- The morning diary runs: sleep diary, the new sections, then the comments box. The evening diary runs: the new sections, then the sleep diary.
- Answers are stored as the position on each scale. Scoring and any reverse-scoring happen at analysis time.
- Items in a section carry a `section` label and an optional `preface` (the instruction repeated at the top of each page).

---

## 🌍 Localisation

| Language | Locale code | Status |
|----------|-------------|--------|
| 🇬🇧 English | `en` | ✅ Complete |
| 🇧🇷 Portuguese (Brazil) | `pt-BR` | UI and sleep diary |
| 🇸🇪 Swedish | `sv`, `sv-SE`, `sv-FI` | UI and sleep diary (unvalidated app translation) |

The research instruments, including the new diary sections (KSS, media usage, PANAS, PROMIS), stay in English in every locale. Stored values, scoring and CSV/JSON keys are unchanged. All other locales fall back to English.

Strings live in `i18n/*.js`; diary question text is translated in `data/questions.<locale>.js` and merged over the English base by `data/useQuestions.js`. A test checks that every language has every key.

---

## 💾 Data storage and export

Data is stored locally with `@react-native-async-storage/async-storage`. No data is sent to a server.

```js
// Stored keys:
// 'user_name', 'research_code'      participant details
// 'age_band'                        optional; device-only, not exported
// 'entries'                         diary entries
// 'questionnaire_{id}'              one result per completed screening questionnaire
// 'medication_presets'              saved medications
// 'seen_instructions', 'last_export_at', 'data_safety_dismissals'

// Screening result:
{ id: 'panas', completedAt: '2026-10-19T09:00:00Z', answers: { panas1: 3, /* … */ }, score: { pa: 31, na: 14 } }
```

Scores can be numbers, objects (`{ msf_sc, sjl }`, `{ pa, na }`, `{ likert, ghq }`) or `null` for descriptive instruments. In the CSV export, object answers and scores are written as readable text (`23:05`, `1995-2018`, `2018-03`, `1990-03-05`, `30`, `whole_life`, `pa=31;na=14`). Date of birth is part of the export, so treat exported files as personal data.

Exports and imports work from **Settings → Export Data**. Importing offers *Merge* (existing entries and results win) or *Replace*.

> **The lock is on the device.** Logging out, deleting the account or importing with *Replace* clears or overwrites screening results, which unlocks the diaries again.

---

## 🔧 Customising

- **Diary questions** — edit `data/questions.js`. Each question has an `id`, `number`, `text` and `type` (`time`, `duration`, `yes_no`, `rating`, `number`, `medication`, `text_input`), plus optional `followUp`, `conditionalOn`, `section` and `preface`.
- **Unlock threshold** — `MIN_ENTRIES_FOR_REPORT` in `utils/constants.js` (14). It governs the final report and when scored results are shown.
- **Colours** — `theme/colors.js` holds the morning (amber), evening (blue) and screening (purple) looks, the report status colours and the muted-text grey. Check contrast if you change them.
- **Reference ranges** — `utils/referenceRanges.js`.

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `expo` | ~55.0.0 | Core Expo SDK |
| `expo-router` | ~55.0.0 | File-based navigation |
| `expo-localization` | ~55.0.12 | Device locale detection |
| `react-native` | 0.83.2 | Cross-platform framework |
| `react` | 19.2.0 | React |
| `@expo/vector-icons` | ^15.0.2 | Ionicons |
| `@react-native-async-storage/async-storage` | 2.2.0 | Local persistence |
| `expo-notifications` | ~55.0.0 | Reminders |
| `expo-font` | ~55.0.4 | Custom fonts |
| `react-native-paper` | ^5.12.0 | UI components |
| `react-native-safe-area-context` | 5.6.2 | Safe areas |
| `react-native-screens` | 4.23.0 | Native screens |
| `react-native-svg` | 15.15.3 | Backgrounds, entry cards, actogram |
| `react-native-svg-transformer` | ^1.5.3 | SVG imports |
| `expo-document-picker` | ~55.0.9 | JSON import |
| `react-native-view-shot` | 4.0.3 | Share card capture |
| `expo-sharing` | ~55.0.18 | Native sharing |
| `expo-blur` | ~55.0.14 | Blur effects |

---

## 📄 Citation

Sleep Light builds on SleepDiaries. If you publish work using this app, please cite the original software:

```bibtex
@software{franca2026sleepdiaries,
  author    = {França, Lucas G. S. and Baehl, Bri and Howard, Jacob and Kussow, Frederic and Luna Colón, Yuliana and Leocadio-Miguel, Mario},
  title     = {Sleep Diaries},
  version   = {1.2.0},
  year      = {2026},
  publisher = {Circadia Lab},
  doi       = {10.5281/zenodo.19683378}
}
```

---

## 👥 Authors

| Role | Names |
|------|-------|
| Principal Investigators | Lucas França, Mario Leocadio-Miguel (Circadia Lab, Northumbria University) |
| Development | Lucas França |
| App design (SleepDiaries) | Bri Baehl, Jacob Howard, Frederic Kussow, Yuliana Luna Colón |
| Swedish translation (SleepDiaries) | Jonatan Nyberg |

The app design was created by exchange students during the 7th Annual [Digital Civics Exchange (DCX)](https://www.dcx.events/home).

Development of SleepDiaries and of the Sleep Light additions was assisted by **Claude** (Anthropic's AI assistant).

---

## 🤝 Related Tools

- 🌙 [**SleepDiaries**](https://github.com/circadia-bio/SleepDiaries) — the protocol template Sleep Light is forked from
- 🧪 [**slumbR**](https://github.com/circadia-bio/slumbR) — R package for reading, scoring and analysing Sleep Diaries exports ([docs](https://slumbr.circadia-lab.uk))
- 🧮 [**ScoreMe**](https://scoreme.circadia-lab.uk) — researcher-facing web app for scoring questionnaires from JSON
- 🌱 [**Teenage Sleep Diaries**](https://teensleepdiaries.circadia-lab.uk) — fork of the protocol template for adolescent sleep research
- 🔬 [**circadia-bio**](https://github.com/circadia-bio) — the Circadia Lab GitHub organisation

---

## 📄 Licence

Released under the [MIT License](./LICENSE).

Copyright © Circadia Lab — Lucas França & Mario Leocadio-Miguel

Design by Bri Baehl, Jacob Howard, Frederic Kussow, and Yuliana Luna Colón.

> **Third-party questionnaires:** the instruments included in this app (GHQ-12, MCTQ, ESS, PSQI, PANAS, and the diary scales KSS and PROMIS) belong to their respective authors and institutions. Including them in this open-source repository does not grant any right to use them beyond what each licence permits. See **Settings → Questionnaire credits**, or the `credit` fields in `data/questionnaires.js`, for the screening instruments. Credits for the KSS and PROMIS items in the diaries are not yet listed in the app.
