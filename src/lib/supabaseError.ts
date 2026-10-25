const NETWORK_ERROR_PATTERNS = ['Failed to fetch', 'NetworkError', 'Network request failed'];
const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Please check your internet connection and try again. If the problem persists, the service may be temporarily unavailable.';

function isNetworkError(message: string): boolean {
  return NETWORK_ERROR_PATTERNS.some((p) => message.includes(p));
}

/**
 * Wraps a Supabase promise so that network-level failures (TypeError: Failed to fetch)
 * are caught and converted to a user-friendly error message instead of crashing the app.
 *
 * The Supabase postgrest client catches fetch errors internally and returns them as
 * { error: { message: "TypeError: Failed to fetch", status: 0 }, data: null } rather
 * than throwing. So in addition to catching thrown TypeErrors (from auth calls), we
 * also inspect the returned error object and replace its message with a friendly one.
 *
 * Normal API errors (RLS denial, missing table, validation) have non-zero status and
 * a PostgREST error message — those pass through unchanged so the UI can show the
 * specific reason.
 */
export async function safeSupabaseCall<T>(
  thenable: PromiseLike<T> | Promise<T>,
): Promise<T> {
  try {
    const result = await Promise.resolve(thenable);
    if (
      result &&
      typeof result === 'object' &&
      'error' in result &&
      result.error &&
      typeof result.error === 'object' &&
      'message' in result.error
    ) {
      const err = result.error as { message: string; status?: number };
      if (isNetworkError(err.message)) {
        (result as Record<string, unknown>).error = {
          ...err,
          message: NETWORK_ERROR_MESSAGE,
          status: 0,
        };
      }
    }
    return result;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (isNetworkError(message)) {
      throw new Error(NETWORK_ERROR_MESSAGE);
    }
    throw err;
  }
}
