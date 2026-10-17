# Mythos.Guide test results

Checked October 16, 2026, on the local app. No functional failures found.

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

All disposable accounts and posts were deleted, temporary credential files removed, and the original posting setting restored. The app remains local and is open at **http://localhost:3000**.

## Content observation

Two previously saved records have symbols that differ from the current seed fixtures: Dike has **Scales**, and Eunomia has **Flowers, Scroll**, while the fixtures have empty symbol lists. Existing records are intentionally preserved by insert-only seeding. Classical passages collected for [Dike](https://www.theoi.com/Ouranios/HoraDike.html) support her balance, and those for [Eunomia](https://www.theoi.com/Ouranios/HoraEunomia.html) give floral associations; the scroll remains unverified in the consulted reference. No existing records were overwritten. This is a content-review item, not a failed search or database operation.

These checks cover the current local app; they do not certify a future deployment or externally hosted reference pages.
