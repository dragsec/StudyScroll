const MUTATION_HEADER = "x-studyscroll-request";

export class RequestSecurityError extends Error {
  constructor(
    public readonly code: "invalid_request" | "payload_too_large",
    message: string,
    public readonly status: 400 | 403 | 413 | 415,
  ) {
    super(message);
    this.name = "RequestSecurityError";
  }
}

export function hasJsonContentType(request: Request) {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  return mediaType === "application/json";
}

export function assertTrustedMutation(request: Request) {
  if (request.headers.get(MUTATION_HEADER) !== "1") {
    throw new RequestSecurityError("invalid_request", "Request verification failed.", 403);
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    throw new RequestSecurityError("invalid_request", "Cross-origin requests are not allowed.", 403);
  }

  const sourceOrigin = request.headers.get("origin");
  if (!sourceOrigin) {
    throw new RequestSecurityError("invalid_request", "Request origin is required.", 403);
  }

  let normalizedSource: string;
  try {
    normalizedSource = new URL(sourceOrigin).origin;
  } catch {
    throw new RequestSecurityError("invalid_request", "Request origin is invalid.", 403);
  }

  const configuredOrigin = process.env.APP_ORIGIN?.trim();
  const requestUrl = new URL(request.url);
  const allowedOrigins = new Set<string>();
  if (configuredOrigin) {
    allowedOrigins.add(new URL(configuredOrigin).origin);
  } else if (process.env.NODE_ENV === "production") {
    throw new RequestSecurityError("invalid_request", "Application origin is not configured.", 403);
  } else {
    allowedOrigins.add(requestUrl.origin);
    const host = request.headers.get("host");
    if (host) allowedOrigins.add(`${requestUrl.protocol}//${host}`);
  }

  if (!allowedOrigins.has(normalizedSource)) {
    throw new RequestSecurityError("invalid_request", "Cross-origin requests are not allowed.", 403);
  }
}

export async function readLimitedJson(request: Request, maxBytes: number): Promise<unknown> {
  if (!hasJsonContentType(request)) {
    throw new RequestSecurityError("invalid_request", "Send a JSON request body.", 415);
  }

  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const declaredBytes = Number(contentLength);
    if (!Number.isSafeInteger(declaredBytes) || declaredBytes < 0) {
      throw new RequestSecurityError("invalid_request", "Content-Length is invalid.", 400);
    }
    if (declaredBytes > maxBytes) {
      throw new RequestSecurityError("payload_too_large", "Request body is too large.", 413);
    }
  }

  if (!request.body) {
    throw new RequestSecurityError("invalid_request", "Request body is required.", 400);
  }

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    receivedBytes += value.byteLength;
    if (receivedBytes > maxBytes) {
      await reader.cancel();
      throw new RequestSecurityError("payload_too_large", "Request body is too large.", 413);
    }
    chunks.push(value);
  }

  const body = new Uint8Array(receivedBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(body));
  } catch {
    throw new RequestSecurityError("invalid_request", "Request body is not valid JSON.", 400);
  }
}
