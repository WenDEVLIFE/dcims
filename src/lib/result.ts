/**
 * Result type for domain operations. Services return failures instead of
 * throwing, so the UI can show a message and the store can leave state
 * untouched when a rule rejects an operation.
 */

export type DomainResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function succeed<T>(data: T): DomainResult<T> {
  return { ok: true, data };
}

export function fail<T = never>(error: string): DomainResult<T> {
  return { ok: false, error };
}

export function isFailure<T>(
  result: DomainResult<T>,
): result is { ok: false; error: string } {
  return result.ok === false;
}
