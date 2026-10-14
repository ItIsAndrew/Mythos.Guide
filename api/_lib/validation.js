export class HttpError extends Error {
  constructor(status, message, retryAfter) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

export function validateNickname(value) {
  if (typeof value !== "string" || !/^[A-Za-z][A-Za-z-]{1,22}[A-Za-z]$/.test(value)
      || value.includes("--")) {
    throw new HttpError(400, "Choose a made-up nickname with 3 to 24 letters or dashes. No real names or contact information.");
  }
  return value;
}

export function validatePassword(value) {
  if (typeof value !== "string" || value.length < 10 || Buffer.byteLength(value, "utf8") > 72
      || value.includes("\0")) {
    throw new HttpError(400, "Use a password with at least 10 characters and at most 72 bytes.");
  }
  return value;
}

// Reject recognizable contact details before storage and again before output.
// NFKC also exposes full-width @ signs, digits, and URL punctuation.
export function containsContactInformation(value) {
  if (typeof value !== "string") return true;
  const text = value.normalize("NFKC");
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f\u200b-\u200f\u202a-\u202e\u2060-\u206f]/u.test(text)) return true;
  if (/@|(?:https?|ftp):|www\s*[.\[(]|\b[a-z0-9-]+\s*\.\s*(?:com|net|org|edu|gov|io|co|me|app|uk|us|info|dev|gg|social|xyz)\b/iu.test(text)) return true;
  if (/\b\w[\w.-]*\s*(?:\(\s*at\s*\)|\[\s*at\s*\]|\bat\b)\s*\w[\w.-]*\s*(?:\(\s*dot\s*\)|\[\s*dot\s*\]|\bdot\b|\.)\s*[a-z]{2,}\b/iu.test(text)) return true;
  if ((text.match(/\p{N}/gu) || []).length >= 7 || /\p{N}{5}(?:-\p{N}{4})?/u.test(text)) return true;
  if (/(?:\b(?:zero|oh|one|two|three|four|five|six|seven|eight|nine)\b[\s,.-]*){7,}/iu.test(text)) return true;
  if (/\b(?:phone|telephone|mobile|cell|email|e-mail|contact|call|text|dm|message)\s*(?:me|number|is|at|:)/iu.test(text)) return true;
  if (/\b(?:instagram|facebook|snapchat|tiktok|twitter|discord|telegram|whatsapp|signal|linkedin|youtube|reddit|bluesky|mastodon)\s*(?:[:=]|is\b|as\b|handle\b|username\b|account\b|me\b)/iu.test(text)) return true;
  if (/\b(?:x|ig|fb|snap)\s*(?:[:=]|handle\b|username\b)\s*\S/iu.test(text)) return true;
  if (/(?:^|\s)(?:\p{N}{1,6}[a-z]?|one|two|three|four|five|six|seven|eight|nine|ten)\s+(?:[\p{L}\p{N}.'-]+\s+){0,6}(?:street|st\.?|avenue|ave\.?|road|rd\.?|lane|ln\.?|drive|dr\.?|boulevard|blvd\.?|court|ct\.?|way|place|pl\.?|terrace|ter\.?|circle|close|crescent|parkway|highway|hwy\.?)(?:\b|$)/iu.test(text)) return true;
  if (/(?:^|\s)\p{N}{1,6}[a-z]?\s+(?:rue|rua|calle|strasse|straße|via|piazza)\b|\b(?:rue|rua|calle|strasse|straße|via|piazza)\s+(?:[\p{L}.'-]+\s+){0,5}\p{N}{1,6}|\b(?:apt\.?|apartment|suite|unit)\s*#?\s*\p{N}+/iu.test(text)) return true;
  if (/\b(?:p\.?\s*o\.?\s*box|postal\s+address|home\s+address|my\s+address|i\s+live\s+(?:at|on))\b/iu.test(text)) return true;
  // Personal introductions are outside the mythology notebook's purpose.
  if (/\b(?:my\s+(?:real\s+)?name\s+is|real\s+name\s*[:=]|full\s+name\s*[:=])\b/iu.test(text)) return true;
  return false;
}

export function validatePostText(value) {
  if (typeof value !== "string" || value.length > 500 || !value.trim()
      || containsContactInformation(value)) {
    throw new HttpError(400, "Write 1 to 500 characters about mythology. No real names, emails, phone numbers, addresses, social handles, or links.");
  }
  return value.trim();
}

export function safePostText(value) {
  try { return validatePostText(value); } catch { return null; }
}

export function validateId(value) {
  if (typeof value !== "string" || !/^[a-f0-9]{32}$/.test(value)) {
    throw new HttpError(400, "Choose a saved post.");
  }
  return value;
}

export function validateInviteCode(value) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value)) {
    throw new HttpError(400, "Use a valid invitation from the owner.");
  }
  return value;
}

export function schema(body, required) {
  if (!body || typeof body !== "object" || Array.isArray(body)
      || ![Object.prototype, null].includes(Object.getPrototypeOf(body))
      || Object.keys(body).length !== required.length
      || required.some((key) => !Object.hasOwn(body, key))) {
    throw new HttpError(400, "This request is not valid. Please use the page controls.");
  }
  return body;
}
