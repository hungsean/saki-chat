/**
 * Environment Detection Utilities
 *
 * Small, reusable helpers for detecting the runtime environment.
 */

/** Narrow shape of `window` exposing the Tauri-injected internals marker. */
type TauriWindow = { __TAURI_INTERNALS__?: unknown };

/**
 * Detect whether the app is running inside a Tauri runtime.
 *
 * Tauri injects `window.__TAURI_INTERNALS__` into the webview. When the app is
 * served in a plain browser (for example `pnpm dev` without the Tauri shell)
 * this object is absent, so any Tauri API call (Store, invoke, ...) would throw
 * `undefined is not an object (evaluating 'window.__TAURI_INTERNALS__.invoke')`.
 *
 * Use this guard to gracefully degrade Tauri-only behaviour instead of crashing.
 *
 * @returns `true` when Tauri internals are available, otherwise `false`.
 */
export function isTauri(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (window as unknown as TauriWindow).__TAURI_INTERNALS__ !==
      'undefined'
  );
}
