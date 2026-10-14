const main = document.querySelector('#owner-main');
const login = document.querySelector('#owner-login');
const content = document.querySelector('#owner-content');
const passcode = document.querySelector('#owner-passcode');
const status = document.querySelector('#owner-status');
const list = document.querySelector('#owner-post-list');
const posting = document.querySelector('#owner-posting');
const inviteResult = document.querySelector('#owner-invite-result');
const inviteCode = document.querySelector('#owner-invite-code');
const older = document.querySelector('#owner-older');
const state = { busy: false, authenticated: false, postingEnabled: true, posts: [], nextCursor: null, deleteId: null, inviteCode: '', sessionRevision: 0, recheckPending: false, concealed: false };
const authChannel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('mythos-owner-session') : null;

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

function setBusy(value) {
  state.busy = value;
  main.setAttribute('aria-busy', String(value));
  main.querySelectorAll('button, input').forEach((item) => { item.disabled = value; });
}

async function request(method = 'GET', body, cursor) {
  const revision = state.sessionRevision;
  let response;
  try {
    const path = cursor ? `/api/admin?${new URLSearchParams({ cursor })}` : '/api/admin';
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
    throw error;
  }
  return data;
}

function clearPrivateData() {
  state.concealed = false;
  state.authenticated = false;
  state.posts = [];
  state.nextCursor = null;
  state.deleteId = null;
  state.inviteCode = '';
  content.hidden = true;
  login.hidden = false;
  list.replaceChildren();
  older.hidden = true;
  passcode.value = '';
  inviteResult.hidden = true;
  inviteCode.textContent = '';
  document.querySelector('#owner-invite-expiry').textContent = '';
}

function safeMessage(error, kind) {
  if (error.status === 429) return 'Please wait a moment before trying again. Requests made too quickly are ignored.';
  if (error.status === 401 || error.status === 403) return kind === 'login'
    ? 'That passcode was not recognized. Paste your private owner passcode and try again.'
    : 'Your owner session has ended. Paste your passcode to log in again.';
  if (error.status === 503) return 'Owner tools are unavailable. Please try again in a moment.';
  return 'We could not complete that action. Please try again in a moment.';
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
  older.hidden = !state.nextCursor;
  if (!state.posts.length) {
    list.replaceChildren(node('p', 'post-empty', 'There are no member posts to moderate.'));
    return;
  }
  const cards = state.posts.map((post, index) => {
    const card = node('article', 'post-card');
    card.setAttribute('aria-label', `Member post ${index + 1}`);
    const meta = node('div', 'post-meta');
    meta.append(node('span', 'owner-post-nickname', post.nickname), node('span', '', readableDate(post.createdAt)));
    card.append(meta, node('p', 'post-text', post.text));
    const actions = node('div', 'post-actions');
    if (state.deleteId === post.id) {
      card.append(node('p', 'post-confirmation', 'Delete this member’s post permanently? You cannot undo this.'));
      actions.append(
        actionButton('Delete this post', 'account-danger', () => run('delete', 'Deleting the post…', async () => {
          await request('DELETE', { id: post.id });
          state.deleteId = null;
          await refresh();
          say('The post has been deleted.');
        })),
        actionButton('Cancel', 'account-secondary', () => { state.deleteId = null; renderPosts(); }),
      );
    } else {
      actions.append(actionButton('Delete post', 'account-danger', () => {
        state.deleteId = post.id;
        renderPosts();
        list.querySelector('.post-confirmation + .post-actions button')?.focus();
      }));
    }
    card.append(actions);
    return card;
  });
  list.replaceChildren(...cards);
}

function applyPosting(enabled) {
  state.postingEnabled = enabled !== false;
  posting.checked = state.postingEnabled;
  document.querySelector('#owner-posting-label').textContent = state.postingEnabled ? 'Posting on' : 'Posting off';
  document.querySelector('#owner-posting-hint').textContent = state.postingEnabled
    ? 'Members can save and edit their own posts. They can always read and delete their saved posts.'
    : 'Members cannot save or edit posts. They can still read and delete their saved posts.';
}

async function refresh() {
  list.setAttribute('aria-busy', 'true');
  try {
    const data = await request();
    if (!Array.isArray(data.posts)) throw new Error('response');
    state.authenticated = true;
    state.posts = data.posts;
    state.nextCursor = typeof data.nextCursor === 'string' ? data.nextCursor : null;
    login.hidden = true;
    state.concealed = document.visibilityState === 'hidden';
    content.hidden = state.concealed;
    passcode.value = '';
    applyPosting(data.postingEnabled);
    renderPosts();
  } finally {
    list.setAttribute('aria-busy', 'false');
  }
}

async function run(kind, loading, work) {
  if (state.busy) return;
  setBusy(true);
  say(loading);
  try {
    await work();
  } catch (error) {
    if (error.stale) return;
    if (kind === 'session') clearPrivateData();
    if (error.status === 401 || error.status === 403) clearPrivateData();
    if (kind === 'posting') applyPosting(state.postingEnabled);
    if (kind === 'session' && (error.status === 401 || error.status === 403)) say('Paste your owner passcode to open the private tools.');
    else say(safeMessage(error, kind), true);
  } finally {
    setBusy(false);
    if (state.recheckPending) verifySession();
  }
}

function notifySessionChange() {
  authChannel?.postMessage({ type: 'session-changed' });
}

function concealOwner() {
  state.concealed = true;
  content.hidden = true;
  login.hidden = true;
}

function queueSessionCheck(clear = false) {
  state.sessionRevision += 1;
  state.recheckPending = true;
  if (clear) clearPrivateData();
  concealOwner();
  say('Checking your owner session…');
  if (!state.busy) verifySession();
}

function verifySession() {
  if (state.busy || !state.recheckPending) return;
  state.recheckPending = false;
  run('session', 'Checking your owner session…', async () => {
    await refresh();
    say('Owner tools are ready.');
  });
}

authChannel?.addEventListener('message', (event) => {
  if (event.data?.type === 'session-changed') queueSessionCheck(true);
});
window.addEventListener('focus', () => queueSessionCheck());
window.addEventListener('pageshow', () => queueSessionCheck());
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') queueSessionCheck();
  else concealOwner();
});

login.addEventListener('submit', (event) => {
  event.preventDefault();
  const suppliedPasscode = passcode.value;
  passcode.value = '';
  run('login', 'Opening owner tools…', async () => {
    await request('POST', { action: 'login', passcode: suppliedPasscode });
    notifySessionChange();
    await refresh();
    say('Owner tools are ready.');
  });
});
posting.addEventListener('change', () => {
  const enabled = posting.checked;
  run('posting', 'Updating posting…', async () => {
    await request('POST', { action: 'posting', enabled });
    applyPosting(enabled);
    say(enabled ? 'Posting is on. Members can save and edit their posts.' : 'Posting is off. Members can still read and delete their saved posts.');
  });
});
document.querySelector('#owner-invite').addEventListener('click', () => run('invite', 'Creating a private invitation…', async () => {
  const data = await request('POST', { action: 'invite' });
  if (typeof data.inviteCode !== 'string' || !data.inviteCode) throw new Error('response');
  state.inviteCode = data.inviteCode;
  inviteCode.textContent = data.inviteCode;
  document.querySelector('#owner-invite-expiry').textContent = `Expires ${readableDate(data.expiresAt)}. One account only.`;
  inviteResult.hidden = false;
  say('Your invitation is ready. Give this code privately to one friend.');
}));
document.querySelector('#owner-copy-invite').addEventListener('click', async () => {
  if (state.busy || !state.inviteCode) return;
  try {
    await navigator.clipboard.writeText(state.inviteCode);
    say('Invitation code copied. Give it privately to your friend.');
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(inviteCode);
    selection?.removeAllRanges();
    selection?.addRange(range);
    inviteCode.focus();
    say('Select the invitation code above and copy it. Your browser did not allow automatic copying.');
  }
});
document.querySelector('#owner-refresh').addEventListener('click', () => run('refresh', 'Refreshing member posts…', async () => {
  state.deleteId = null;
  await refresh();
  say('Member posts are up to date.');
}));
older.addEventListener('click', () => {
  if (!state.nextCursor) return;
  run('refresh', 'Loading older member posts…', async () => {
    const data = await request('GET', undefined, state.nextCursor);
    if (!Array.isArray(data.posts)) throw new Error('response');
    const knownIds = new Set(state.posts.map((post) => post.id));
    state.posts.push(...data.posts.filter((post) => !knownIds.has(post.id)));
    state.nextCursor = typeof data.nextCursor === 'string' ? data.nextCursor : null;
    applyPosting(data.postingEnabled);
    renderPosts();
    say('Older member posts have been loaded.');
  });
});
document.querySelector('#owner-logout').addEventListener('click', () => run('logout', 'Logging out…', async () => {
  await request('POST', { action: 'logout' });
  notifySessionChange();
  clearPrivateData();
  say('You are logged out of owner tools.');
}));

queueSessionCheck();
