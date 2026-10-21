# Mythos.Guide test results

## Overall navigation and startup — October 21, 2026

All **108 automated tests pass**. A new regression test follows the next link from each of the eight focused views, including Start here. In a fresh local browser page, Find a god led to Stories, Stories led to Quiz, direct Gods browsing loaded all 141 figures, and Create account offered a made-up nickname without creating an account. The old extra phone-only next links were removed to avoid duplicate directions.

The gods archive is requested when browsing opens instead of on every activity visit. This is a client-side loading change; the local two-user, rate-limit, owner-delete, and posting-off safety workflow passed immediately before it, and the server code was unchanged. The public app still awaits hosting setup.

## Activity menu — October 21, 2026

All **107 current automated tests pass**, including six new checks against the real menu script for new/returning visitors, all seven saved activities, unavailable/corrupt storage, back navigation, and old bookmarks.

Browser checks confirmed that all seven activity cards open the correct focused section. Returning to the menu updates **Last opened** and suggests a different activity. **Start here** opens the beginner guide; the keyboard skip link focuses the activity list. At widths 320, 390, 430, 768, and 1280 pixels, the menu has no sideways scrolling and visible links have tap areas of at least 44 pixels. Muted text colors were checked for contrast on the tinted cards.

This update changes the menu and its presentation only. The app remains local; database/account settings and server code were unchanged.

## Landing, story search, and quiz practice — October 21, 2026

The full current suite passes **100 tests**. The improvements preserve the existing account, API, content, and routing checks. New regressions cover delayed landing-search handoff, multiword/Unicode names, invalid/repeated queries, active-section keyboard skip links, combined story filters, and quiz review/practice state.

- **Landing:** browser Enter submission for **Thalia the Muse** returns the correct figure; **Discover Athena** opens Athena’s result. Queries wait for the search handler, and an explicit Stories link is not overridden by a retained god query.
- **Stories:** six cards expand to 12 and collapse to six. **kindness** returns the hospitality story and its reader opens. **Athena + Roman** shows helpful no-match guidance; **Clear filters** restores the full collection. Story searches stay in this page and are not saved.
- **Quiz:** a completed phone round shows the missed question, chosen/correct answers, explanation, and source. A one-question practice round starts at 0/1, can finish at 1/1, and then **Play again** starts a fresh 0/5 round. Automated checks also cover multiple misses, narrowing repeated practice, perfect rounds, difficulty changes, immutable review data, and answer locking.
- **Accessibility and layout:** keyboard skip from Stories keeps Stories visible and focuses that section. No sideways scrolling on the landing page at 320, 390, 430, 768, or 1280 pixels; visible landing controls have tap areas of at least 44 pixels. Story search/filter controls remain at least 46 pixels tall at checked phone/desktop widths. Quiz prompts and review cards fit a 320 × 568 phone viewport.

The app runs locally. Account/database code and private settings were not changed in this feature update; the earlier live account-safety results below remain historical evidence. No website deployment was performed.

## Fix verification — October 21, 2026

All seven main findings from the October 19 review, the additional usability issues, and the unverified Eunomia symbol have been addressed. The original findings are preserved below as historical evidence.

These results cover implementation save point `65a20b8`. Another chat began further layout/routing changes after this verification; those unfinished edits are outside this audit-fix report and were preserved.

| Area | Current result |
| --- | --- |
| Automated regression checks | All **86 tests pass** in the final full-suite run. New coverage exercises browser events, partial network failures, privacy examples, source metadata, reviewed topics, quiz visibility, and account recovery. |
| Privacy filtering | Regression and live safety checks reject colon/equal-sign name declarations and common personal introductions, while permitting historical research such as “The Academy of Athens has a statue of Athena.” Personal school disclosures remain blocked. This is a focused filter, not perfect name detection. |
| Signup and private drafts | Routine focus, pageshow, and visibility rechecks preserve unfinished signup and recovery fields. Same-account rechecks preserve post/edit drafts; account changes clear private member content. Login moves focus after the post box is enabled. |
| Save and refresh failures | With the following list request forced to return HTTP 503, successful browser saves and edits remain visible and report success with a **Refresh posts** message. The saved post exists; the page does not suggest repeating the write. Automated checks also cover deletion and a lost write response, retaining an uncertain draft and advising refresh first. |
| Phone trivia | Complete Easy, Medium, and Hard browser rounds pass at 320 × 568, with five distinct questions per round, answer locking, feedback, source links, scores, and replay. The first/next prompt and feedback are fully visible. Mid-round **Change difficulty → Keep playing** preserves progress; **End round** returns to difficulty selection. |
| Sources and myth versions | The live public API returns sources and version notes for all 141 figures, including all 42 Roman entries. All 48 quiz answers have source/version metadata, displayed with feedback. God search/detail panels and world panels expose references. Eight selected external reading links were checked and resolved; this is not a guarantee for every external page. |
| Topics and learning paths | All 141 figures have at least one reviewed named topic. All 12 topics contain Greek and Roman figures. Atlas appears in Sky, Ops in Nature, and Tartarus in Underworld. Six new connected stories and two new worlds bring the totals to 12 stories and six worlds; every figure has a targeted topic path. All six new story dialogs show references and fit a 320-pixel phone without sideways scrolling. **Show more stories** expands six to 12; **Show fewer stories** returns to six. The healing-world references and topic suggestion destination pass browser checks. Suggestions distinguish thematic connections from appearances in a story. |
| Names and nicknames | Live searches for **Thalia the Muse**, **Thalia Muse**, **Thalia the Grace**, and **Thalia Grace** return only the appropriate figure; plain **Thalia** returns both. Aether and Euterpe also pass. New nickname suggestions check availability in a curated space of over 6,000 names; a signup race gets a clear retry message. |
| Recovery and account protection | Private one-use recovery codes provide a password recovery path. Only code hashes are stored. Replacement and recovery rotate the code and revoke earlier sessions. Automated coverage includes wrong codes, replay, concurrent consumption, rate limits, and transaction rollback without replacing the browser cookie. Existing accounts can create a code while logged in with their password. |
| Live safety workflow | All groups pass with normal rate limits on the current self-service registration: two-user isolation, validation, private posts, owner moderation, posting controls, logout, password-protected deletion, recovery, code rotation, and session revocation. Tests used isolated collections with a random prefix in the permitted database; every test collection was dropped afterward. |
| Shared changes and private files | The current account UI and owner UI selectors match their HTML. The landing page continues to open the guide at `/guide`. MongoDB remains server-only, with the reused official client and `client.db()` without a name. No database link, passcode, session token, or recovery code is recorded in this report. |

Live collection evidence: **141 figures = 99 Greek + 42 Roman**, **104 distinct source URLs**, and no figure missing a source, version note, or named topic. Topic counts overlap because figures can have several roles: Sea 13, Sky 23, Arts 23, Nature 24, Underworld 14, War 14, Love 9, Healing 9, Fate 22, Home 34, Creation 33, and Sleep 4.

The unverified **Scroll** attribute is omitted from Eunomia’s public response without overwriting the stored record. Supported floral associations and Dike’s scales remain available.

The app remains local at **http://localhost:3000**; the guide is at **http://localhost:3000/guide**. Source upload to the authorized GitHub repository is separate from website hosting. No website deployment was performed. Free-text filters can still miss unusual or disguised personal information; owner review remains necessary.

## Earlier verification — October 16–19, 2026

The results in this section describe the earlier version. They are retained for comparison; the October 21 verification above supersedes their counts and resolved limitations.

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

## Historical content observation — resolved October 21

Two previously saved records had symbols that differed from the seed fixtures: Dike had **Scales**, and Eunomia had **Flowers, Scroll**, while the fixtures had empty symbol lists. Existing records are intentionally preserved by insert-only seeding. Classical passages collected for [Dike](https://www.theoi.com/Ouranios/HoraDike.html) support her balance, and those for [Eunomia](https://www.theoi.com/Ouranios/HoraEunomia.html) give floral associations; the scroll remained unverified in the consulted reference. The October 21 fix omits that unsupported symbol in the public view. No existing records were overwritten.

These checks cover the current local app; they do not certify a future deployment or externally hosted reference pages.
Free-text filters can still miss an unusual or disguised real name. The owner can review and delete any post; the app does not claim perfect name detection.

## GitHub source upload check — October 19, 2026

The current app passes all 59 automated tests and syntax checks for all 31 JavaScript modules. The files and reachable Git history were scanned for the saved database URL, database password, owner passcode, and common credential patterns without displaying their values. No matches were found. Private environment files and generated dependencies are absent from the upload, and `.env*` remains the first ignore rule. GitHub source publication is authorized; website deployment is still separate.

## Historical deeper review — October 19, 2026

**Resolved October 21:** all seven numbered findings and the additional limitations below are addressed. This section preserves the original failure evidence; file line references refer to the October 19 snapshot. The existing 59 automated tests and live two-user workflow passed at that time, but did not catch these negative paths.

### Historical account and phone-quiz findings — resolved

1. **Privacy filtering both misses personal introductions and rejects harmless study notes.** An isolated posts-handler test accepts and returns the invented text `Full name: Astra Fictional` with HTTP 201, while rejecting `The Academy of Athens has a statue of Athena.` with HTTP 400. The name-declaration regex has a word-boundary check after punctuation; the school-word rule ignores context. These tests used an in-memory database, not real personal information. Private account isolation still passed. Evidence: `api/_lib/validation.js:56` and `:63`. Add regression cases, correct the punctuation matching, and use narrower rules without claiming perfect name detection.
2. **Returning to the app erased an unfinished signup.** The original DOM/event harness confirmed that a focus/session recheck cleared the password and invitation. This is fixed: routine logged-out rechecks preserve the draft, while actual account changes still clear private member data. A browser tab-switch check kept a disposable invitation draft intact. The local signup and two-user safety workflow passed after the fix.
3. **Phone quiz questions can appear above the screen.** In the browser at 320 × 568, the first question heading was entirely above the viewport; after Next question, the new heading ended about 264 pixels above it. The code focuses headings with `preventScroll: true` after replacing the panel. Evidence: `public/quiz.js:296`. Bring the next prompt or feedback into view and verify at small phone heights. Scoring and answer locking still pass.
4. **A successful save can be reported as a failure.** A DOM/fetch-stub test confirms that when saving succeeds but the following list refresh fails, the page clears the text box and reports a generic failure. Retrying may create a duplicate of the already-saved note. Evidence: `public/accounts.js:383` and `:246`. Distinguish save success from refresh failure; offer Refresh rather than suggesting another save.

### Historical research and discovery findings — resolved

5. **Research references are incomplete.** The 141 main god records have no source fields; only 32 gods have a source through their family-facts section, leaving 109 without a per-god reference link. Roman coverage is 3 of 42, compared with 29 of 99 Greek figures. Quiz explanations have no visible reference links. Evidence: `public/app.js:264` and `public/quiz.js:279`. Add a source and version note to each figure and question.
6. **Topic filters miss 69 of 141 gods.** Nearly half the collection fits none of the five named topics. Some appropriate matches are missed: Atlas is absent from Sky, Ops from Nature, and Tartarus from Underworld. Filtering uses exact words in the short domain field; it misses related words and roles in descriptions. Evidence: `public/discovery-content.js:12` and `:27`. Use reviewed topic tags and include currently missing subjects such as war, love, and healing.
7. **Learning paths run out quickly.** Sixty gods receive only the generic stories link, including Ares, Mars, Heracles, and Morpheus. There are six short retellings and four world panels. Expand connected stories and learning paths before treating collection size as content depth.

Other limitations observed at that time, all resolved October 21: `Thalia the Muse` and `Thalia Muse` returned no match, while `Thalia the Grace` worked; plain `Thalia` returned both figures. Forgotten passwords had no recovery path. A quiz round could not change difficulty until completion. The intended post-box focus after login ran while that box was disabled. The curated nickname space was limited and suggestions did not check availability.

### Checks completed in the original October 19 review

- All 59 automated tests pass. The live safety workflow passes; disposable accounts/posts were removed and the original posting setting restored.
- Live public API audit: 174 of 175 checks pass. All 141 canonical god names, Greek/Roman totals, supported aliases, ambiguity, no-match, and malformed requests pass; the exploratory failure is the qualified Muse name above.
- Browser smoke checks pass for common/lesser-known searches, both Thalias, no-match, family details, all six story windows, all four worlds, glossary search/clearing, random picks, quiz scoring, and difficulty return.
- No sideways scrolling at widths 320, 390, 768, and 1280. The phone quiz scroll-position failure is separate from horizontal layout.
- Signup interruptions and save/refresh failure were checked with isolated DOM/request harnesses. The privacy examples used the actual handler with an in-memory database. No real credentials or personal data were exposed.

The recommended regression coverage for browser events and partial network failures has now been added. No website deployment was performed.
