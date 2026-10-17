import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

// False during the server render and hydration, true once running in the
// browser. Pages that read browser storage use it to avoid a flash of
// "empty" content before the saved data loads.
export function useIsClient() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
