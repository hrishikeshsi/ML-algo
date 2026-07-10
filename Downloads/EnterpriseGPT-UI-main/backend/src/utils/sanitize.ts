const SCRIPT_TAG_PATTERN = /<script[^>]*>[\s\S]*?<\/script>/gi;
const HTML_TAG_PATTERN = /<[^>]*>/g;
const JS_PROTOCOL_PATTERN = /javascript:/gi;
const EVENT_HANDLER_PATTERN = /on\w+\s*=\s*(["']).*?\1/gi;

/** Strips script tags, HTML markup and inline event handlers from a string to mitigate XSS. */
export function sanitizeString(value: string): string {
  return value
    .replace(SCRIPT_TAG_PATTERN, '')
    .replace(EVENT_HANDLER_PATTERN, '')
    .replace(JS_PROTOCOL_PATTERN, '')
    .replace(HTML_TAG_PATTERN, '')
    .trim();
}

export function sanitizeValue<T>(value: T): T {
  if (typeof value === 'string') {
    return sanitizeString(value) as unknown as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item)) as unknown as T;
  }

  if (value !== null && typeof value === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      sanitized[key] = sanitizeValue(val);
    }
    return sanitized as unknown as T;
  }

  return value;
}
