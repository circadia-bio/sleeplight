# Sleep Light — fork setup status

This repo was seeded from the SleepDiaries protocol template (v1.2.0). This file tracks what has been done to make it Sleep Light and what is still open. Delete it when the open items are closed.

Legend: ✅ done · ⬜ still to do

## 1. Rename the app

- ✅ `app.json`: `name` "Sleep Light", `slug` `sleep-light`, `scheme` `sleep-light`, bundle identifiers `com.circadia.sleeplight`
- ✅ `package.json`: `name` `sleeplight`, version `0.1.0`
- ✅ Brand text in `i18n/en.js`, `i18n/pt-BR.js`, `i18n/sv.js`, the PWA manifest, `web/index.html`, the service-worker cache name and the shareable report image
- ⬜ Search the code for any remaining old names (the strings above were found by reading, not by search):
  ```bash
  grep -rniE "sleep ?diaries|sleep-diaries" --include=*.js --include=*.jsx --include=*.json --include=*.html . \
    --exclude-dir=node_modules --exclude-dir=docs --exclude=package-lock.json
  ```
  Mentions that credit SleepDiaries as the source (README citation, CHANGELOG, this file) are intentional.
- ⬜ Run `npm install` once so `package-lock.json` picks up the new name and version
- ⬜ Keep only the languages you need, or leave all three. Dropping one means deleting its files in `i18n/` and `data/` and updating `i18n/index.js`, `data/useQuestions.js`, `__tests__/swedish.test.js` and `__tests__/i18nKeys.test.js`

## 2. README

- ✅ Rewritten for Sleep Light, with SleepDiaries credited as the source
- ⬜ Confirm the repository URL used in the clone command (`github.com/circadia-bio/sleeplight`)
- ⬜ Add a Zenodo DOI and badge once Sleep Light has its own

## 3. Rebrand

- ✅ `theme/colors.js` has the purple screening look next to the morning (amber) and evening (blue) looks
- ⬜ Replace `header.png`, `screens.png` (used in the README) and `assets/images/social.png` (social preview) if they still show SleepDiaries
- ⬜ Replace the app icon and splash images in `assets/` and the PWA icons and splash screens in `web/` if you want Sleep Light artwork

## 4. Deployment

- ✅ `scripts/deploy.sh` written. App name and site address are the variables at the top
- ⬜ Confirm the site address. It is currently `https://sleeplight.circadia-lab.uk` in three places: `scripts/deploy.sh`, `web/index.html` (preview tags) and `app/final-report.jsx` (`SITE_HOST`, printed on the shareable report image)
- ⬜ `app.json` still has `web.baseUrl` set to `/SleepDiaries` and `scripts/fix-paths.js` still uses the same base. They were inherited unchanged; check them against the way you host the app
- ✅ `netlify.toml` runs `npm run deploy` on Netlify (Node 20) and publishes `docs/`, so the site is built there rather than committed
- ⬜ Decide on analytics (the original used Fathom; none is configured here)

## 5. CI (optional)

- ⬜ No GitHub Actions are set up. If you want them, add a workflow that runs `npm test` and a web build check (`npx expo export -p web`)

## 6. Questionnaires

- ✅ The one-time questionnaires are now the screening battery: About You (date of birth and gender), GHQ-12, MCTQ, ESS, PSQI, PANAS, Light History and Social Media Usage. They are defined in `data/questionnaires.js`, run by `app/QuestionnaireScreen.jsx`, and gate the diaries (`utils/screening.js`)
- ✅ ISI, DBAS-16, MEQ, RU-SATED, STOP-BANG and the one-time KSS were removed. KSS is now in the diaries
- ⬜ **GHQ-12 licence**: it is a licensed instrument (GL Assessment). Get permission before using it in the study
- ⬜ **Social Media Usage source**: the study document does not name the instrument. Fill in `credit` and `reference` in `data/questionnaires.js`
- ⬜ **Credits for the diary scales**: add KSS and PROMIS attribution. The credits screen only lists the screening instruments
- ⬜ **PANAS scoring**: the app stores raw answers and totals positive and negative affect separately. The study document lists items to reverse-score (2, 4, 7, 8, 11, 13, 15, 18, 20, with item 6 missing); decide how that should be applied at analysis time
- ⬜ **PROMIS 8a** repeats two items that are also in 4a and 7a. Check this against the official item banks

## 7. Reference ranges and age group

Unchanged from the template. The final report colours sleep duration, onset latency and WASO against published ranges (`utils/referenceRanges.js`), chosen by an optional age group that is stored on the device only and is not exported.

- ⬜ Check the ranges suit your population. With no age group set, the 18–64 ranges are used (`DEFAULT_AGE_BAND`)
- ⬜ Decide whether to keep the age question in onboarding and the Profile

## 8. Data-safety reminders

Unchanged from the template. The Home tab nudges participants to install the PWA and to export a backup (rules in `utils/dataSafety.js`, card in `components/DataSafetyBanner.jsx`).

- ⬜ Adjust the thresholds or remove `<DataSafetyBanner />` from `app/(tabs)/home.jsx` if participants will not export

## 9. Citation

The original `CITATION.cff` was removed during seeding. The README cites SleepDiaries (`10.5281/zenodo.19683378`).

- ⬜ Add a `CITATION.cff` for Sleep Light once you have a DOI, and keep crediting SleepDiaries

## 10. Known behaviour to be aware of

- The screening lock lives on the device. Logging out, deleting the account or importing with *Replace* clears or overwrites the results, which unlocks the diaries again
- The new questionnaire sections in the diaries stay in English in Swedish and Portuguese
- The evening diary now has about 46 extra one-per-screen questions (KSS, PANAS and PROMIS)

---

Questions about the underlying app structure? See the [SleepDiaries repo](https://github.com/circadia-bio/SleepDiaries).
