import assert from 'node:assert/strict';
import { test } from 'node:test';
import { accountUi } from './helpers/account-ui.js';

const samplePost = { id: 'a'.repeat(32), text: 'Athena represents wisdom.', createdAt: '2026-10-19T12:00:00.000Z' };

test('ordinary focus/pageshow/visibility rechecks preserve unfinished signup and recovery drafts', async () => {
  const ui = await accountUi();
  ui.get('account-register-tab').fire('click'); await ui.settled();
  ui.get('account-password').value = 'FictionalDraftPassword';
  ui.get('account-recover-nickname').value = 'Moon-Quill';
  ui.get('account-recover-code').value = 'c'.repeat(43);
  ui.get('account-recover-password').value = 'FictionalRecoveryDraft';
  for (const type of ['focus', 'pageshow']) { ui.window.fire(type); await ui.settled(); }
  ui.document.visibilityState = 'hidden'; ui.document.fire('visibilitychange');
  ui.document.visibilityState = 'visible'; ui.document.fire('visibilitychange'); await ui.settled();
  assert.equal(ui.get('account-password').value, 'FictionalDraftPassword');
  assert.equal(ui.get('account-recover-code').value, 'c'.repeat(43));
  assert.equal(ui.get('account-recover-password').value, 'FictionalRecoveryDraft');
  assert.equal(ui.get('account-entry').hidden, false);
  ui.server.failAccount = true; ui.window.fire('focus'); await ui.settled();
  assert.equal(ui.get('account-password').value, 'FictionalDraftPassword');
  assert.equal(ui.get('account-entry').hidden, false, 'a network error must not strand the form hidden');
});

test('same-account checks preserve a typed edit while an account change clears every private draft', async () => {
  const ui = await accountUi({ user: { nickname: 'CometFox' }, posts: [samplePost] });
  ui.button('Edit').fire('click');
  let editor = ui.get('post-list').querySelector('textarea'); editor.value = 'A new mythology draft.'; editor.fire('input');
  ui.get('post-text').value = 'An unfinished note.';
  ui.get('account-recovery-value').value = 'r'.repeat(43); ui.get('account-recovery-result').hidden = false;
  ui.window.fire('focus'); await ui.settled();
  editor = ui.get('post-list').querySelector('textarea');
  assert.equal(editor.value, 'A new mythology draft.');
  assert.equal(ui.get('post-text').value, 'An unfinished note.');
  assert.equal(ui.get('account-recovery-value').value, 'r'.repeat(43));
  ui.document.visibilityState = 'hidden'; ui.document.fire('visibilitychange');
  assert.equal(ui.get('account-member').hidden, true, 'sensitive content is concealed in the background');
  ui.document.visibilityState = 'visible'; ui.document.fire('visibilitychange'); await ui.settled();
  assert.equal(ui.get('account-recovery-result').hidden, false);
  ui.server.failList = true; ui.window.fire('focus'); await ui.settled();
  assert.equal(ui.get('post-list').querySelector('textarea').value, 'A new mythology draft.');
  assert.equal(ui.get('account-recovery-value').value, 'r'.repeat(43));
  assert.match(ui.get('account-status').textContent, /account is open.*drafts are still here/i);
  ui.server.failList = false;
  ui.server.user = { nickname: 'MoonOtter' }; ui.server.posts = []; ui.broadcast(); await ui.settled();
  assert.equal(ui.state().editDraft, null);
  assert.equal(ui.get('post-text').value, '');
  assert.equal(ui.get('account-recovery-value').value, '');
  assert.equal(ui.get('account-recovery-result').hidden, true);
  assert.equal(ui.get('post-list').querySelector('textarea'), null);
});

test('successful create/edit/delete are not reported as failures when their list refresh fails', async () => {
  const ui = await accountUi({ user: { nickname: 'CometFox' }, posts: [samplePost] });
  ui.server.failList = true;
  ui.get('post-text').value = 'The Academy of Athens has a statue of Athena.';
  ui.get('post-form').fire('submit'); await ui.settled();
  assert.equal(ui.server.writes, 1);
  assert.equal(ui.get('post-text').value, '');
  assert.match(ui.get('account-status').textContent, /saved.*could not refresh.*Refresh posts.*do not save again/i);
  assert.equal(ui.get('account-status').classList.contains('is-error'), false);
  assert.equal(ui.state().posts.length, 2, 'the acknowledged post stays visible');
  ui.button('Edit').fire('click');
  const editor = ui.get('post-list').querySelector('textarea'); editor.value = 'Athena is a Greek goddess.'; editor.fire('input');
  ui.get('post-list').querySelector('form').fire('submit'); await ui.settled();
  assert.match(ui.get('account-status').textContent, /changes have been saved.*Refresh posts/i);
  assert.equal(ui.state().posts[0].text, 'Athena is a Greek goddess.');
  ui.button('Delete').fire('click'); ui.button('Delete this post').fire('click'); await ui.settled();
  assert.match(ui.get('account-status').textContent, /post has been deleted.*Refresh posts/i);
  assert.equal(ui.state().posts.length, 1);
  assert.equal(ui.server.writes, 3);
});

test('login moves focus to the enabled post box and a refresh failure does not masquerade as failed login', async () => {
  const ui = await accountUi();
  ui.get('account-nickname').value = 'CometFox'; ui.get('account-password').value = 'FictionalPassword';
  ui.server.failList = true;
  ui.get('account-form').fire('submit'); await ui.settled();
  assert.equal(ui.get('account-member').hidden, false);
  assert.equal(ui.document.activeElement, ui.get('post-text'));
  assert.equal(ui.document.disabledFocusAttempts, 0);
  assert.match(ui.get('account-status').textContent, /archive is open.*Refresh posts/i);
});

test('registration shows a recovery code once, preserves it on recheck, and dismiss/logout erase it', async () => {
  const ui = await accountUi();
  ui.get('account-register-tab').fire('click'); await ui.settled();
  assert.equal(ui.get('account-invite'), null);
  assert.equal(ui.get('account-nickname').value, 'Moon-Quill');
  ui.get('account-password').value = 'FictionalPassword';
  ui.get('account-form').fire('submit'); await ui.settled();
  assert.equal(Object.hasOwn(ui.server.calls.find((call) => call.body?.action === 'register').body, 'inviteCode'), false);
  assert.equal(ui.get('account-recovery-value').value, ui.server.recoveryCode);
  assert.equal(ui.get('account-recovery-result').hidden, false);
  assert.equal(ui.document.activeElement, ui.get('account-recovery-value'));
  ui.window.fire('focus'); await ui.settled();
  assert.equal(ui.get('account-recovery-value').value, ui.server.recoveryCode);
  ui.get('account-recovery-dismiss').fire('click');
  assert.equal(ui.get('account-recovery-value').value, '');
  assert.equal(ui.get('account-recovery-result').hidden, true);
  ui.get('account-recovery-password').value = 'FictionalPassword'; ui.get('account-recovery-form').fire('submit'); await ui.settled();
  assert.equal(ui.get('account-recovery-result').hidden, false);
  ui.get('account-logout').fire('click'); await ui.settled();
  assert.equal(ui.get('account-recovery-value').value, '');
  assert.equal(ui.get('account-recovery-result').hidden, true);
});

test('recovery submits only to the account backend and shows the replacement private code', async () => {
  const ui = await accountUi();
  ui.get('account-recover-nickname').value = 'CometFox'; ui.get('account-recover-code').value = 'c'.repeat(43); ui.get('account-recover-password').value = 'FictionalNewPassword';
  ui.get('account-recover-form').fire('submit'); await ui.settled();
  assert.equal(ui.server.calls.find((call) => call.body?.action === 'recover').path, '/api/account');
  assert.equal(ui.get('account-recover-code').value, '');
  assert.equal(ui.get('account-recover-password').value, '');
  assert.equal(ui.get('account-member').hidden, false);
  assert.equal(ui.get('account-recovery-value').value, ui.server.recoveryCode);
  assert.match(ui.get('account-status').textContent, /password has been reset/);
});

test('a routine focus check during an in-flight save does not discard its success or leave a duplicate draft', async () => {
  const ui = await accountUi({ user: { nickname: 'CometFox' } });
  let release;
  ui.server.pauseWrite = new Promise((resolve) => { release = resolve; });
  ui.get('post-text').value = 'Poseidon carries a trident.';
  ui.get('post-form').fire('submit');
  ui.window.fire('focus');
  release(); await ui.settled();
  assert.equal(ui.server.writes, 1);
  assert.equal(ui.get('post-text').value, '');
  assert.equal(ui.state().posts.length, 1);
  assert.equal(ui.state().user.nickname, 'CometFox');
  assert.equal(ui.get('account-member').hidden, false);
});

test('a lost write response retains the draft and tells the user to refresh before risking a duplicate', async () => {
  const ui = await accountUi({ user: { nickname: 'CometFox' } });
  const draft = 'Apollo is associated with music.';
  ui.server.loseWriteResponse = true;
  ui.get('post-text').value = draft;
  ui.get('post-form').fire('submit'); await ui.settled();
  assert.equal(ui.server.writes, 1, 'the server saved before its response was lost');
  assert.equal(ui.get('post-text').value, draft, 'uncertain saves must preserve the draft');
  assert.match(ui.get('account-status').textContent, /could not confirm.*saved.*draft is still here.*Refresh posts before saving again/i);
  ui.server.loseWriteResponse = false;
  ui.get('account-refresh').fire('click'); await ui.settled();
  assert.equal(ui.state().posts.length, 1);
  assert.equal(ui.state().posts[0].text, draft);
  assert.equal(ui.server.writes, 1, 'refreshing does not repeat the write');
});
