# BlockLab

**Crack the secret math behind Bitcoin.** BlockLab is a free, hands-on website that teaches middle school students (ages 11–14) the cryptography that makes Bitcoin work: keys, hashing, signatures, chains of blocks and mining. Students learn by playing with toys in the browser, in **English, Thai and Burmese**.

This is the **pilot**: Units 1 and 2 (six lessons) are ready. Units 3–6 come next.

## What's inside

| Unit | Lesson | Activity |
| --- | --- | --- |
| 1 · Secret messages | 1.1 Caesar's secret | Turning cipher wheel, letter tiles, secret note swap with a friend |
| | 1.2 Crack the code | Try all 25 keys, letter-frequency chart, codebreaker race |
| | 1.3 Bigger keys | Bike lock with dials, key size from 1 to 256 bits |
| 2 · Fingerprints for data | 2.1 The hash machine | Hash machine that prints SHA-256 receipts, matching challenge |
| | 2.2 The avalanche | Change one letter and see which bits flip |
| | 2.3 No way back | Guess the word behind a hash, hash slot machine (find `00`) |

Every lesson follows the same steps: hook, try it, what just happened, in real Bitcoin, quick check. Finishing a lesson adds a real mined block to the student's own 3D chain on the home page.

**Safe for kids:** no accounts, no personal data, no trackers, no real money. Progress is saved only in the student's own browser.

## Run it

You need [Node.js](https://nodejs.org) 20 or newer. There are no packages to install.

```bash
npm start      # open http://localhost:5173
npm test       # run the tests
```

Any static file server works too, for example `python3 -m http.server`. Opening `index.html` directly from disk does not work, because browsers block JavaScript modules on `file://`.

## Project structure

```
index.html            page shell: header, language switch, <main id="app">
src/
  main.js             router (#home, #map, #about, #l-1-1 …) and language switching
  styles/main.css     all styles; light and dark themes
  lib/
    sha256.js         SHA-256 written from scratch, tested against Node's crypto
    util.js           Caesar shift and small DOM helpers
  state/progress.js   lesson progress, stored in localStorage
  content/course.js   units, lessons, hooks, quizzes (English)
  i18n/
    strings.js        interface text and lesson titles in English, Thai, Burmese
    explain.js        "Explained simply" sections in all three languages
  views/              home, course map, lesson, quiz, about, 3D chain, note swap
  toys/               one file per lesson toy
tests/                node:test suites (no dependencies)
tools/serve.js        tiny local dev server
```

## Adding or changing content

- **Lesson text and quizzes:** `src/content/course.js`. Each quiz question lists its options and the index of the right answer (`a`).
- **Translations:** `src/i18n/strings.js` (interface, lesson titles and hooks) and `src/i18n/explain.js` (kid-friendly explanations). `npm test` fails if a Thai or Burmese string is missing.
- **A new toy:** add `src/toys/<name>.js` exporting `function <name>(root)`, register it in `src/toys/index.js`, and set `toy: '<name>'` on the lesson.

The Thai and Burmese text is a draft and should be reviewed by native-speaking teachers before classroom use.

## Deploy

Pushing to `main` runs the tests and publishes the site to **GitHub Pages** through `.github/workflows/deploy.yml`. One-time setup: in the repository go to **Settings → Pages** and set **Source** to **GitHub Actions**.

Because the site is plain static files, it also works on Cloudflare Pages, Netlify or Vercel: publish the repository root with no build command.

## Licence

Code is released under the [MIT Licence](LICENSE). The licence for lesson content is still to be decided.

---

Made by [Saw Nyan Lin Tun](https://github.com/SawNyanLinTun), Digital Innovation, Chiang Mai University.
