const root = document.querySelector('#account');
const entry = document.querySelector('#account-entry');
const member = document.querySelector('#account-member');
const status = document.querySelector('#account-status');
const accountForm = document.querySelector('#account-form');
const nickname = document.querySelector('#account-nickname');
const nicknameSuggest = document.querySelector('#nickname-suggest');
const password = document.querySelector('#account-password');
const loginTab = document.querySelector('#account-login-tab');
const registerTab = document.querySelector('#account-register-tab');
const postForm = document.querySelector('#post-form');
const postText = document.querySelector('#post-text');
const postList = document.querySelector('#post-list');
const postingStatus = document.querySelector('#posting-status');
const deletePassword = document.querySelector('#account-delete-password');
const recoveryResult = document.querySelector('#account-recovery-result');
const recoveryValue = document.querySelector('#account-recovery-value');
const recoveryPassword = document.querySelector('#account-recovery-password');
const recoverForm = document.querySelector('#account-recover-form');
const recoverNickname = document.querySelector('#account-recover-nickname');
const recoverCode = document.querySelector('#account-recover-code');
const recoverPassword = document.querySelector('#account-recover-password');
const state = { user: null, posts: [], postingEnabled: true, mode: 'login', busy: false, editId: null, editDraft: null, deleteId: null, sessionRevision: 0, recheckPending: false, concealed: false, focusAfterBusy: null };
const authChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('mythos-member-session') : null;

function node(tag, className, text) {
  const item = document.createElement(tag);
  if (className) item.className = className;
  if (text !== undefined) item.textContent = text;
  return item;
}

function say(message, error = false) {
  status.textContent = message;
  status.classList.toggle('is-error', error);
}

async function request(path, method = 'GET', body) {
  const revision = state.sessionRevision;
  let response;
  try {
    response = await fetch(path, {
      method, credentials: 'same-origin', cache: 'no-store',
      headers: { Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    throw new Error('network');
  }
  const data = await response.json().catch(() => ({}));
  if (revision !== state.sessionRevision) {
    const error = new Error('stale-session');
    error.stale = true;
    throw error;
  }
  if (!response.ok) {
    const error = new Error('request');
    error.status = response.status;
    error.code = data.code;
    throw error;
  }
  return data;
}

function safeMessage(error, kind) {
  if (kind === 'post' && !error.status) return 'We could not confirm whether this note was saved. Your draft is still here. Press Refresh posts before saving again.';
  if (error.status === 429) return 'Please wait a moment before trying again. Requests made too quickly are ignored.';
  if (error.status === 401) {
    if (kind === 'recover') return 'That nickname and recovery code were not recognized. Check the private code you saved.';
    if (kind === 'recovery-code') return 'The password was not recognized. Your recovery code has not changed.';
    if (kind === 'login') return 'That nickname and password were not recognized. Please try again.';
    if (kind === 'delete-account') return 'The password was not recognized. Your account has not been deleted.';
    return 'Please log in again to see your posts.';
  }
  if (error.status === 403 && kind === 'post') return 'Posting is currently off. You can still read or delete your posts.';
  if (error.status === 400 || error.status === 422) {
    if (kind === 'register') return 'Check the suggested nickname and password. Use no real names or contact information.';
    if (kind === 'post') return 'Use 1–500 characters about mythology. Remove personal introductions, school locations, emails, phone numbers, addresses, and social handles.';
    return 'Please check the fields and try again.';
  }
  if (error.status === 409 && kind === 'register') return 'That nickname was just taken. Press Suggest another nickname, then try again. Your password is still here.';
  return 'We could not complete that action. Please try again in a moment.';
}

function setBusy(value) {
  state.busy = value;
  root.setAttribute('aria-busy', String(value));
  root.querySelectorAll('button, input, textarea').forEach((item) => { item.disabled = value; });
  document.querySelector('#account-submit').disabled = value || (state.mode === 'register' && !nickname.value);
  postText.disabled = value || !state.postingEnabled;
  document.querySelector('#post-submit').disabled = value || !state.postingEnabled;
  postList.querySelectorAll('[data-post-edit]').forEach((item) => { item.disabled = value || !state.postingEnabled; });
}

function clearPrivateData({ preserveEntry = false } = {}) {
  state.concealed = false;
  state.user = null;
  state.posts = [];
  state.editId = null;
  state.editDraft = null;
  state.deleteId = null;
  state.focusAfterBusy = null;
  member.hidden = true;
  entry.hidden = false;
  postList.replaceChildren();
  document.querySelector('#account-welcome').textContent = '';
  postText.value = '';
  if (!preserveEntry) {
    password.value = '';
    recoverForm.reset();
  }
  deletePassword.value = '';
  recoveryPassword.value = '';
  recoveryValue.value = '';
  recoveryResult.hidden = true;
  document.querySelector('#account-recovery-details').open = false;
  document.querySelector('#account-delete-details').open = false;
  updateCount();
}

function showMember(user) {
  state.user = user;
  entry.hidden = true;
  member.hidden = state.concealed;
  accountForm.reset();
  document.querySelector('#account-welcome').textContent = `Welcome, ${user.nickname}.`;
  document.querySelector('#account-delete-details').open = false;
  deletePassword.value = '';
}

function applyPosting(enabled) {
  state.postingEnabled = enabled !== false;
  postingStatus.textContent = state.postingEnabled
    ? 'Your posts belong to your account. You can edit or delete them here.'
    : 'The owner has turned posting off. You can still read or delete your saved posts.';
  if (!state.postingEnabled) {
    state.editId = null;
    state.editDraft = null;
  }
  setBusy(state.busy);
}

function readableDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Saved post' : date.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function actionButton(text, className, listener) {
  const button = node('button', className, text);
  button.type = 'button';
  button.disabled = state.busy;
  button.addEventListener('click', listener);
  return button;
}

function renderPosts() {
  if (!state.posts.length) {
    postList.replaceChildren(node('p', 'post-empty', 'Your archive is ready. Save a short thought about a god or story above.'));
    return;
  }
  const cards = state.posts.map((post, index) => {
    const card = node('article', 'post-card');
    card.setAttribute('aria-label', `Your post ${index + 1}`);
    card.append(node('p', 'post-meta', readableDate(post.createdAt)));
    if (state.editId === post.id && state.postingEnabled) {
      const form = node('form', 'account-form');
      const field = node('div', 'account-field');
      const label = node('label', '', 'Edit your post');
      const text = node('textarea');
      text.id = `post-edit-${index}`;
      label.htmlFor = text.id;
      text.rows = 4;
      text.maxLength = 500;
      text.required = true;
      text.value = state.editDraft?.id === post.id ? state.editDraft.text : post.text;
      text.disabled = state.busy;
      const hint = node('p', 'account-hint', 'Keep real names and all contact information out of your post.');
      const count = node('span', 'account-count', `${text.value.length} / 500`);
      count.id = `post-edit-count-${index}`;
      hint.id = `post-edit-hint-${index}`;
      text.setAttribute('aria-describedby', `${hint.id} ${count.id}`);
      text.addEventListener('input', () => {
        count.textContent = `${text.value.length} / 500`;
        state.editDraft = { id: post.id, text: text.value };
      });
      field.append(label, text, hint, count);
      const actions = node('div', 'post-actions');
      const save = node('button', 'account-primary', 'Save changes');
      save.type = 'submit';
      save.disabled = state.busy;
      save.dataset.postEdit = '';
      actions.append(save, actionButton('Cancel', 'account-secondary', () => { state.editId = null; state.editDraft = null; renderPosts(); }));
      form.append(field, actions);
      form.addEventListener('submit', (event) => {
        event.preventDefault();
        run('post', 'Saving your changes…', async () => {
          const savedText = text.value;
          await request('/api/posts', 'PATCH', { id: post.id, text: savedText });
          state.posts = state.posts.map((item) => item.id === post.id ? { ...item, text: savedText } : item);
          state.editId = null;
          state.editDraft = null;
          renderPosts();
          await refreshAfterSuccess('Your changes have been saved.');
        });
      });
      card.append(form);
    } else {
      card.append(node('p', 'post-text', post.text));
      const actions = node('div', 'post-actions');
      if (state.deleteId === post.id) {
        card.append(node('p', 'post-confirmation', 'Delete this post permanently? You cannot undo this.'));
        actions.append(
          actionButton('Delete this post', 'account-danger', () => run('posts', 'Deleting your post…', async () => {
            await request('/api/posts', 'DELETE', { id: post.id });
            state.deleteId = null;
            state.posts = state.posts.filter((item) => item.id !== post.id);
            renderPosts();
            await refreshAfterSuccess('Your post has been deleted.');
          })),
          actionButton('Cancel', 'account-secondary', () => { state.deleteId = null; renderPosts(); }),
        );
      } else {
        const edit = actionButton('Edit', 'account-secondary', () => {
          state.editId = post.id;
          state.editDraft = { id: post.id, text: post.text };
          state.deleteId = null;
          renderPosts();
          postList.querySelector('textarea')?.focus();
        });
        edit.dataset.postEdit = '';
        edit.disabled = state.busy || !state.postingEnabled;
        actions.append(edit, actionButton('Delete', 'account-danger', () => {
          state.editId = null;
          state.editDraft = null;
          state.deleteId = post.id;
          renderPosts();
          postList.querySelector('.post-confirmation + .post-actions button')?.focus();
        }));
      }
      card.append(actions);
    }
    return card;
  });
  postList.replaceChildren(...cards);
}

async function loadPosts() {
  postList.setAttribute('aria-busy', 'true');
  try {
    const data = await request('/api/posts');
    if (!Array.isArray(data.posts)) throw new Error('response');
    state.posts = data.posts;
    applyPosting(data.postingEnabled);
    renderPosts();
  } catch (error) {
    if (error.status === 401) clearPrivateData();
    throw error;
  } finally {
    postList.setAttribute('aria-busy', 'false');
  }
}

async function refreshAfterSuccess(message) {
  try {
    await loadPosts();
    say(message);
  } catch (error) {
    if (error.stale) return;
    if (error.status === 401) say(`${message} Log in again to view your saved posts.`);
    else say(`${message} The list could not refresh. Press Refresh posts to update it; do not save again.`);
  }
}

function showRecoveryCode(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) return;
  recoveryValue.value = value;
  recoveryResult.hidden = false;
}

async function run(kind, loading, work) {
  if (state.busy) return;
  setBusy(true);
  say(loading);
  try {
    await work();
  } catch (error) {
    if (error.stale) return;
    if (kind === 'session') {
      if (state.user) clearPrivateData();
      else {
        state.concealed = false;
        entry.hidden = false;
      }
    }
    if (error.status === 401 && !['login', 'register', 'recover', 'recovery-code', 'delete-account'].includes(kind)) clearPrivateData();
    if (error.status === 403 && kind === 'post') {
      applyPosting(false);
      renderPosts();
    }
    say(safeMessage(error, kind), true);
  } finally {
    setBusy(false);
    if (state.recheckPending) verifySession();
    else if (state.focusAfterBusy && !state.concealed && !state.focusAfterBusy.disabled) {
      state.focusAfterBusy.focus({ preventScroll: true });
      state.focusAfterBusy = null;
    }
  }
}

function notifySessionChange() {
  authChannel?.postMessage({ type: 'session-changed' });
}

function concealAccount() {
  state.concealed = true;
  member.hidden = true;
  entry.hidden = true;
}

function queueSessionCheck(clear = false) {
  // Routine focus checks wait for in-flight work. Only an explicit session
  // change makes its response stale; otherwise a successful save could be lost.
  if (clear) state.sessionRevision += 1;
  state.recheckPending = true;
  if (clear) clearPrivateData();
  concealAccount();
  say('Checking your account…');
  if (!state.busy) verifySession();
}

function verifySession() {
  if (state.busy || !state.recheckPending) return;
  state.recheckPending = false;
  const previousNickname = state.user?.nickname;
  run('session', 'Checking your account…', async () => {
    const data = await request('/api/account');
    applyPosting(data.postingEnabled);
    if (data.user?.nickname) {
      if (previousNickname !== data.user.nickname) clearPrivateData();
      showMember(data.user);
      let refreshed = true;
      try { await loadPosts(); } catch (error) {
        if (error.stale || error.status === 401) throw error;
        refreshed = false;
      }
      state.concealed = document.visibilityState === 'hidden';
      member.hidden = state.concealed;
      say(refreshed ? 'Your own archive is open.' : 'Your account is open, but the list could not refresh. Your drafts are still here. Press Refresh posts to try again.', !refreshed);
    } else {
      // A routine focus check must not erase an unfinished signup.
      if (previousNickname) clearPrivateData();
      else entry.hidden = false;
      state.concealed = false;
      say('Accounts are ready. Create your own account with a made-up nickname.');
    }
  });
}

authChannel?.addEventListener('message', (event) => {
  if (event.data?.type === 'session-changed') queueSessionCheck(true);
});
window.addEventListener('focus', () => queueSessionCheck());
window.addEventListener('pageshow', () => queueSessionCheck());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') queueSessionCheck();
  else concealAccount();
});

function chooseMode(mode) {
  if (state.busy) return;
  state.mode = mode;
  loginTab.setAttribute('aria-pressed', String(mode === 'login'));
  registerTab.setAttribute('aria-pressed', String(mode === 'register'));
  nicknameSuggest.hidden = mode !== 'register';
  nickname.readOnly = mode === 'register';
  if (mode === 'register') nickname.value = '';
  password.autocomplete = mode === 'register' ? 'new-password' : 'current-password';
  password.value = '';
  document.querySelector('#account-submit').textContent = mode === 'register' ? 'Create my account' : 'Log in';
  say(mode === 'register' ? 'Choose a made-up nickname and a password to create your account.' : 'Log in to open your own archive.');
  nickname.focus({ preventScroll: true });
  if (mode === 'register') suggestNickname(false);
}

async function suggestNickname(announce = true) {
  if (state.busy) return;
  await run('nickname', 'Finding an available made-up nickname…', async () => {
    const data = await request('/api/account?mode=nickname');
    if (typeof data.nickname !== 'string' || !/^[A-Za-z-]{3,24}$/.test(data.nickname)) throw new Error('response');
    nickname.value = data.nickname;
    state.focusAfterBusy = nickname;
    if (announce) say('This made-up nickname is available now. You can use it, or ask for another suggestion.');
    else say('Choose a made-up nickname and a password to create your account.');
  });
}

function validPassword(value, field) {
  if (value.length < 10 || new TextEncoder().encode(value).length > 72) {
    say('Use a password of at least 10 characters and no more than 72 bytes.', true);
    field.focus();
    return false;
  }
  return true;
}

function updateCount() {
  document.querySelector('#post-count').textContent = `${postText.value.length} / 500`;
}

loginTab.addEventListener('click', () => chooseMode('login'));
registerTab.addEventListener('click', () => chooseMode('register'));
nicknameSuggest.addEventListener('click', () => suggestNickname());
postText.addEventListener('input', updateCount);
accountForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validPassword(password.value, password)) return;
  const mode = state.mode;
  const credentials = { action: mode, nickname: nickname.value.trim(), password: password.value };
  run(mode, mode === 'register' ? 'Creating your account…' : 'Opening your archive…', async () => {
    const data = await request('/api/account', 'POST', credentials);
    if (!data.user?.nickname) throw new Error('response');
    notifySessionChange();
    showMember(data.user);
    showRecoveryCode(data.recoveryCode);
    await refreshAfterSuccess(mode === 'register' ? 'Your account is ready. Save your private recovery code below.' : 'Your own archive is open.');
    state.focusAfterBusy = mode === 'register' ? recoveryValue : postText;
  });
});
postForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!state.postingEnabled) return;
  run('post', 'Saving your post…', async () => {
    const data = await request('/api/posts', 'POST', { text: postText.value });
    if (data.post?.id) state.posts = [data.post, ...state.posts];
    postText.value = '';
    updateCount();
    renderPosts();
    await refreshAfterSuccess('Your post has been saved to your account.');
  });
});
document.querySelector('#account-refresh').addEventListener('click', () => run('posts', 'Refreshing your posts…', async () => {
  await loadPosts();
  say('Your posts are up to date.');
}));
document.querySelector('#account-logout').addEventListener('click', () => run('logout', 'Logging out…', async () => {
  await request('/api/account', 'POST', { action: 'logout' });
  notifySessionChange();
  clearPrivateData();
  say('You are logged out. Your saved posts will be here when you log in again.');
}));
document.querySelector('#account-delete-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validPassword(deletePassword.value, deletePassword)) return;
  if (!window.confirm('Permanently delete your account and every one of your posts? This cannot be undone.')) return;
  run('delete-account', 'Deleting your account and posts…', async () => {
    await request('/api/account', 'DELETE', { password: deletePassword.value });
    notifySessionChange();
    clearPrivateData();
    say('Your account and all your posts have been deleted.');
  });
});

document.querySelector('#account-recovery-dismiss').addEventListener('click', () => {
  recoveryValue.value = '';
  recoveryResult.hidden = true;
  postText.focus({ preventScroll: true });
});
document.querySelector('#account-recovery-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validPassword(recoveryPassword.value, recoveryPassword)) return;
  run('recovery-code', 'Replacing your recovery code…', async () => {
    const data = await request('/api/account', 'POST', { action: 'recovery-code', password: recoveryPassword.value });
    recoveryPassword.value = '';
    document.querySelector('#account-recovery-details').open = false;
    showRecoveryCode(data.recoveryCode);
    notifySessionChange();
    say('Save your new private recovery code. Any older code and other logins have been replaced.');
    state.focusAfterBusy = recoveryValue;
  });
});
recoverForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!validPassword(recoverPassword.value, recoverPassword)) return;
  run('recover', 'Recovering your account…', async () => {
    const data = await request('/api/account', 'POST', { action: 'recover', nickname: recoverNickname.value.trim(), recoveryCode: recoverCode.value.trim(), password: recoverPassword.value });
    if (!data.user?.nickname) throw new Error('response');
    clearPrivateData();
    showMember(data.user);
    document.querySelector('#account-recover-details').open = false;
    showRecoveryCode(data.recoveryCode);
    notifySessionChange();
    await refreshAfterSuccess('Your password has been reset. Save your replacement recovery code below.');
    state.focusAfterBusy = recoveryValue;
  });
});

queueSessionCheck();
