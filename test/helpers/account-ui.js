import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

// A small DOM/event/request harness for account failure paths. It runs the real
// browser module and follows its events, rather than reimplementing its logic.
class Element {
  constructor(tag, document) {
    this.tagName = tag.toLowerCase(); this.document = document;
    this.children = []; this.attributes = {}; this.dataset = {}; this.listeners = {};
    this.value = ''; this.hidden = false; this.disabled = false; this.textContent = '';
    this.className = ''; this.open = false;
    this.classList = {
      toggle: (name, enabled) => { const names = new Set(this.className.split(/\s+/).filter(Boolean)); if (enabled) names.add(name); else names.delete(name); this.className = [...names].join(' '); },
      contains: (name) => this.className.split(/\s+/).includes(name),
    };
  }
  append(...items) { for (const item of items) { item.parentElement = this; this.children.push(item); } }
  replaceChildren(...items) { this.children = []; this.append(...items); }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  getAttribute(name) { return this.attributes[name]; }
  addEventListener(type, listener) { (this.listeners[type] ??= []).push(listener); }
  fire(type) { for (const listener of this.listeners[type] || []) listener({ preventDefault() {}, target: this }); }
  matches(selector) {
    if (selector.startsWith('#')) return this.id === selector.slice(1);
    if (selector.startsWith('.')) return this.classList.contains(selector.slice(1));
    if (selector === '[data-post-edit]') return Object.hasOwn(this.dataset, 'postEdit');
    return this.tagName === selector;
  }
  querySelectorAll(selector) {
    const selectors = selector.split(',').map((part) => part.trim());
    const descendants = this.children.flatMap((child) => [child, ...child.querySelectorAll('*')]);
    if (selector === '*') return descendants;
    return descendants.filter((child) => selectors.some((part) => child.matches(part)));
  }
  querySelector(selector) {
    if (selector === '.post-confirmation + .post-actions button') return this.querySelectorAll('button').find((item) => item.textContent === 'Delete this post');
    return this.querySelectorAll(selector)[0] || null;
  }
  reset() { this.querySelectorAll('input, textarea').forEach((item) => { item.value = ''; }); }
  focus() {
    if (this.disabled) { this.document.disabledFocusAttempts += 1; return; }
    for (let item = this; item; item = item.parentElement) if (item.hidden) return;
    this.document.activeElement = this;
  }
}

function miniDocument(html) {
  const document = { visibilityState: 'visible', activeElement: null, disabledFocusAttempts: 0, listeners: {}, ids: new Map() };
  document.body = new Element('body', document);
  document.createElement = (tag) => new Element(tag, document);
  document.querySelector = (selector) => selector.startsWith('#') ? document.ids.get(selector.slice(1)) || null : document.body.querySelector(selector);
  document.addEventListener = (type, listener) => (document.listeners[type] ??= []).push(listener);
  document.fire = (type) => { for (const listener of document.listeners[type] || []) listener({}); };
  const stack = [document.body];
  for (const token of html.match(/<[^>]+>/g) || []) {
    if (/^<\//.test(token)) { if (stack.length > 1) stack.pop(); continue; }
    const tag = token.match(/^<([a-z][a-z0-9-]*)\b/i)?.[1];
    if (!tag) continue;
    const element = document.createElement(tag);
    for (const match of token.matchAll(/([\w-]+)(?:="([^"]*)")?/g)) {
      const [, key, value = ''] = match;
      if (key === tag) continue;
      element.setAttribute(key, value);
      if (key === 'id') { element.id = value; document.ids.set(value, element); }
      if (key === 'class') element.className = value;
      if (key === 'hidden') element.hidden = true;
      if (key === 'disabled') element.disabled = true;
    }
    stack.at(-1).append(element);
    if (!['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'].includes(tag)) stack.push(element);
  }
  return document;
}

export async function accountUi({ user = null, posts = [] } = {}) {
  const [html, source] = await Promise.all([readFile(new URL('../../public/index.html', import.meta.url), 'utf8'), readFile(new URL('../../public/accounts.js', import.meta.url), 'utf8')]);
  const document = miniDocument(html);
  const window = { listeners: {}, confirm: () => true, addEventListener(type, listener) { (this.listeners[type] ??= []).push(listener); }, fire(type) { (this.listeners[type] || []).forEach((listener) => listener({})); } };
  const server = { user, posts: structuredClone(posts), failList: false, failAccount: false, writes: 0, recoveryCode: 'r'.repeat(43), nicknameIndex: 0, calls: [] };
  const channels = [];
  class BroadcastChannel {
    constructor() { this.listeners = []; channels.push(this); }
    addEventListener(type, listener) { if (type === 'message') this.listeners.push(listener); }
    postMessage() {}
  }
  const fetch = async (path, options) => {
    const method = options.method; const body = options.body ? JSON.parse(options.body) : null;
    server.calls.push({ path, method, body });
    let status = 200; let data;
    if (path.includes('mode=nickname')) data = { nickname: ['Moon-Quill', 'Comet-Fox'][server.nicknameIndex++ % 2] };
    else if (path === '/api/account') {
      if (method === 'GET') { status = server.failAccount ? 503 : 200; data = { user: server.user, postingEnabled: true }; }
      else if (body?.action === 'logout' || method === 'DELETE') { server.user = null; data = { user: null }; }
      else if (body?.action === 'recovery-code') data = { recoveryCode: server.recoveryCode };
      else { server.user = { nickname: body.nickname }; data = { user: server.user, ...(body.action !== 'login' && { recoveryCode: server.recoveryCode }) }; }
    } else if (path === '/api/posts') {
      if (method === 'GET') { status = server.failList ? 503 : 200; data = { posts: server.posts, postingEnabled: true }; }
      else if (method === 'POST') { if (server.pauseWrite) await server.pauseWrite; server.writes += 1; const post = { id: String(server.writes).padStart(32, 'a'), text: body.text, createdAt: '2026-10-19T12:00:00.000Z' }; server.posts = [post, ...server.posts]; status = 201; data = { post }; }
      else if (method === 'PATCH') { server.writes += 1; server.posts = server.posts.map((post) => post.id === body.id ? { ...post, text: body.text } : post); data = { updated: true }; }
      else { server.writes += 1; server.posts = server.posts.filter((post) => post.id !== body.id); data = { deleted: true }; }
    } else throw new Error(`Unexpected fixture request: ${path}`);
    if (path === '/api/posts' && method !== 'GET' && server.loseWriteResponse) throw new Error('Fixture connection lost after acknowledgement');
    return { ok: status >= 200 && status < 300, status, json: async () => structuredClone(data) };
  };
  const context = vm.createContext({ document, window, fetch, BroadcastChannel, TextEncoder, console });
  vm.runInContext(`${source}\n globalThis.inspectState = () => state;`, context);
  async function settled() {
    for (let tries = 0; tries < 30; tries += 1) { await new Promise((resolve) => setImmediate(resolve)); if (!context.inspectState().busy && !context.inspectState().recheckPending) return; }
    throw new Error('Account UI did not settle');
  }
  await settled();
  return {
    document, window, server, settled, state: () => context.inspectState(),
    get: (id) => document.querySelector(`#${id}`),
    button: (text) => document.body.querySelectorAll('button').find((item) => item.textContent === text),
    broadcast() { channels.forEach((channel) => channel.listeners.forEach((listener) => listener({ data: { type: 'session-changed' } }))); },
  };
}
