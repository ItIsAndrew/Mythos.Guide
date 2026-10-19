# Mythos.Guide test results

The full app was checked October 16, 2026. Account privacy checks were repeated October 19, 2026, after the Version 2 changes.

| Area | Result |
| --- | --- |
| Automated checks | All 59 tests pass; all 30 JavaScript modules pass syntax checks. |
| Live collection | All 141 gods are searchable by name. Greek/Roman totals are 99/42. Aliases, ambiguous names, no matches, invalid inputs, and unsupported methods behave correctly. |
| Search and discovery | Browser checks pass for Aether, Euterpe, both Thalias, accented Athena, empty and unknown searches, family facts, random picks, and connected story links. |
| Collection filters | All 18 tradition/topic combinations work; show more and show fewer return the expected counts. |
| Learning content | All six story windows show their three paragraphs and reference link. All four worlds work, including arrow-key navigation. Name comparisons and glossary search, no-match, and clearing work. |
| Trivia | All 48 questions pass correct/wrong answer and answer-locking checks. Complete browser rounds pass at all three difficulties, with distinct questions, explanations, correct scores, replay, and difficulty switching. |
| Real saved posts | A disposable account can log in, save, edit, refresh, and reload a post. Canceling edits/deletion preserves it. Logging out in another tab clears the first tab's private posts. |
| Account and owner protection | Live two-user isolation, one-use invitations, validation, cooldowns, owner moderation, posting controls, logout/session revocation, and password-protected account deletion pass. Owner tools stay locked without owner access. |
| Phone and desktop | No sideways scrolling at widths 320, 390, 430, 768, and 1280 pixels. Visible phone controls have tap areas of at least 44 pixels. Keyboard answer selection, world navigation, dialog closing, and focus return work. |
| Private files and database setup | Private files/dependencies remain outside Git and the public asset whitelist. MongoDB remains server-only with a reused client and the database from the saved URL. |
| Version 2 account privacy | All 59 automated tests pass. The server rejects ordinary-name-style signups such as `SarahJones` and personal-reference notes such as “My friend Sarah likes Athena.” The browser generates an approved made-up nickname for new members and lets them request another. The live two-user, owner-delete, posting-off, rate-limit, and cleanup checks pass. |

All disposable accounts and posts were deleted, temporary credential files removed, and the original posting setting restored. The app remains local and is open at **http://localhost:3000**.

## Content observation

Two previously saved records have symbols that differ from the current seed fixtures: Dike has **Scales**, and Eunomia has **Flowers, Scroll**, while the fixtures have empty symbol lists. Existing records are intentionally preserved by insert-only seeding. Classical passages collected for [Dike](https://www.theoi.com/Ouranios/HoraDike.html) support her balance, and those for [Eunomia](https://www.theoi.com/Ouranios/HoraEunomia.html) give floral associations; the scroll remains unverified in the consulted reference. No existing records were overwritten. This is a content-review item, not a failed search or database operation.

These checks cover the current local app; they do not certify a future deployment or externally hosted reference pages.
Free-text filters can still miss an unusual or disguised real name. The owner can review and delete any post; the app does not claim perfect name detection.

## GitHub source upload check — October 19, 2026

The current app passes all 59 automated tests and syntax checks for all 31 JavaScript modules. The files and reachable Git history were scanned for the saved database URL, database password, owner passcode, and common credential patterns without displaying their values. No matches were found. Private environment files and generated dependencies are absent from the upload, and `.env*` remains the first ignore rule. GitHub source publication is authorized; website deployment is still separate.

## Deeper review — October 19, 2026

The existing 59 automated tests and the live two-user safety workflow still pass. Additional negative-path checks found the issues below, which the existing suite does not catch. This review records findings; application behavior has not been changed.

### Fix first: account reliability and the phone quiz

1. **Privacy filtering both misses personal introductions and rejects harmless study notes.** An isolated posts-handler test accepts and returns the invented text `Full name: Astra Fictional` with HTTP 201, while rejecting `The Academy of Athens has a statue of Athena.` with HTTP 400. The name-declaration regex has a word-boundary check after punctuation; the school-word rule ignores context. These tests used an in-memory database, not real personal information. Private account isolation still passed. Evidence: `api/_lib/validation.js:56` and `:63`. Add regression cases, correct the punctuation matching, and use narrower rules without claiming perfect name detection.
2. **Returning to the app erased an unfinished signup.** The original DOM/event harness confirmed that a focus/session recheck cleared the password and invitation. This is fixed: routine logged-out rechecks preserve the draft, while actual account changes still clear private member data. A browser tab-switch check kept a disposable invitation draft intact. The local signup and two-user safety workflow passed after the fix.
3. **Phone quiz questions can appear above the screen.** In the browser at 320 × 568, the first question heading was entirely above the viewport; after Next question, the new heading ended about 264 pixels above it. The code focuses headings with `preventScroll: true` after replacing the panel. Evidence: `public/quiz.js:296`. Bring the next prompt or feedback into view and verify at small phone heights. Scoring and answer locking still pass.
4. **A successful save can be reported as a failure.** A DOM/fetch-stub test confirms that when saving succeeds but the following list refresh fails, the page clears the text box and reports a generic failure. Retrying may create a duplicate of the already-saved note. Evidence: `public/accounts.js:383` and `:246`. Distinguish save success from refresh failure; offer Refresh rather than suggesting another save.

### Improve next: research and discovery

5. **Research references are incomplete.** The 141 main god records have no source fields; only 32 gods have a source through their family-facts section, leaving 109 without a per-god reference link. Roman coverage is 3 of 42, compared with 29 of 99 Greek figures. Quiz explanations have no visible reference links. Evidence: `public/app.js:264` and `public/quiz.js:279`. Add a source and version note to each figure and question.
6. **Topic filters miss 69 of 141 gods.** Nearly half the collection fits none of the five named topics. Some appropriate matches are missed: Atlas is absent from Sky, Ops from Nature, and Tartarus from Underworld. Filtering uses exact words in the short domain field; it misses related words and roles in descriptions. Evidence: `public/discovery-content.js:12` and `:27`. Use reviewed topic tags and include currently missing subjects such as war, love, and healing.
7. **Learning paths run out quickly.** Sixty gods receive only the generic stories link, including Ares, Mars, Heracles, and Morpheus. There are six short retellings and four world panels. Expand connected stories and learning paths before treating collection size as content depth.

Other observed limitations: `Thalia the Muse` and `Thalia Muse` return no match, while `Thalia the Grace` works; plain `Thalia` returns both figures. Forgotten passwords have no recovery path. A quiz round cannot change difficulty until completion. The intended post-box focus after login runs while that box is disabled. The curated nickname space is limited and suggestions do not check availability.

### Checks completed

- All 59 automated tests pass. The live safety workflow passes; disposable accounts/posts were removed and the original posting setting restored.
- Live public API audit: 174 of 175 checks pass. All 141 canonical god names, Greek/Roman totals, supported aliases, ambiguity, no-match, and malformed requests pass; the exploratory failure is the qualified Muse name above.
- Browser smoke checks pass for common/lesser-known searches, both Thalias, no-match, family details, all six story windows, all four worlds, glossary search/clearing, random picks, quiz scoring, and difficulty return.
- No sideways scrolling at widths 320, 390, 768, and 1280. The phone quiz scroll-position failure is separate from horizontal layout.
- Signup interruptions and save/refresh failure were checked with isolated DOM/request harnesses. The privacy examples used the actual handler with an in-memory database. No real credentials or personal data were exposed.

Future regression coverage should exercise browser events and partial network failures, not only successful API/session logic. No website deployment was performed.
