/* ========================================================================== *
 *                           Navigation API (Window)                          *
 * ========================================================================== */
// The Navigation API's `Window.navigation` property (and the `Navigation`
// interface) are not yet part of the TypeScript DOM lib shipped with TS 5.9.
// Only the related `NavigationActivation` / `NavigationHistoryEntry` /
// `NavigationType` types exist in lib.dom. Declare just the surface the
// content script relies on so `window.navigation` type-checks while guarded
// by a runtime feature check.
interface NavigationEventMap {
    navigatesuccess: Event;
    navigateerror: Event;
    currententrychange: Event;
}

interface Navigation {
    addEventListener<K extends keyof NavigationEventMap>(
        type: K,
        listener: (this: Navigation, ev: NavigationEventMap[K]) => unknown,
        options?: boolean | AddEventListenerOptions,
    ): void;
    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions,
    ): void;
    removeEventListener<K extends keyof NavigationEventMap>(
        type: K,
        listener: (this: Navigation, ev: NavigationEventMap[K]) => unknown,
        options?: boolean | EventListenerOptions,
    ): void;
    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
        options?: boolean | EventListenerOptions,
    ): void;
}

interface Window {
    readonly navigation?: Navigation;
}
