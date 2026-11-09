/**
 * Scene load-error classification (Phase 6.2, R1.2/R1.4). Pure function: turns a
 * caught SceneLayer load error into a category + actionable message naming the
 * cause AND the fix, with the failing URL and status. No silent fallback — a
 * clear error the user can fix fast (per the review decision).
 */

export type SceneErrorKind = 'auth' | 'cors' | 'network' | 'unknown';

export interface ClassifiedSceneError {
  kind: SceneErrorKind;
  title: string;
  /** Actionable fix text, may contain the failing URL + status. */
  detail: string;
  url?: string;
  status?: number;
}

interface RawEsriError {
  message?: string;
  name?: string;
  details?: {
    httpStatus?: number;
    url?: string;
    messages?: string[];
    raw?: unknown;
  };
}

export function classifySceneError(
  err: unknown,
  sceneUrl: string,
  origin: string,
): ClassifiedSceneError {
  const e = (err ?? {}) as RawEsriError;
  const status = e.details?.httpStatus;
  const url = e.details?.url ?? sceneUrl;
  const msg = (e.message ?? '') + ' ' + (e.details?.messages?.join(' ') ?? '');

  // Auth: 401/403/499 or token/credential wording.
  if (
    status === 401 ||
    status === 403 ||
    status === 498 ||
    status === 499 ||
    /token required|invalid token|not authorized|forbidden|credential/i.test(msg)
  ) {
    return {
      kind: 'auth',
      title: 'Authentication failed',
      detail:
        `The scene service rejected the token (HTTP ${status ?? '401/403/499'}). ` +
        `Confirm you signed in with an ArcGIS for Petroleum account that can see the ` +
        `scene item, then retry. Service: ${url}`,
      url,
      status,
    };
  }

  // CORS: browser blocks it; esri surfaces status 0 / "Failed to fetch" / CORS wording.
  if (
    status === 0 ||
    /cors|cross-origin|blocked by cors|access-control-allow-origin|failed to fetch|networkerror when attempting/i.test(
      msg,
    )
  ) {
    return {
      kind: 'cors',
      title: 'Blocked by CORS',
      detail:
        `The browser blocked the request from this origin (${origin}). ` +
        `Add ${origin} to your org's allowed origins: ArcGIS Online → Organization → ` +
        `Settings → Security → Allowed origins, then retry. Service: ${url}`,
      url,
      status,
    };
  }

  // Network: timeouts, DNS, 5xx, offline.
  if (
    (typeof status === 'number' && status >= 500) ||
    /timeout|network|offline|err_|dns|unreachable|load failed/i.test(msg)
  ) {
    return {
      kind: 'network',
      title: 'Network error',
      detail:
        `Could not reach the scene service${status ? ` (HTTP ${status})` : ''}. ` +
        `Check your connection and that the service is up, then retry. Service: ${url}`,
      url,
      status,
    };
  }

  return {
    kind: 'unknown',
    title: 'Scene failed to load',
    detail:
      `${e.message ?? 'Unknown error'}${status ? ` (HTTP ${status})` : ''}. ` +
      `Service: ${url}`,
    url,
    status,
  };
}
