import { browser } from '#imports';
import { filterRulesByUrl } from '../rules';
import { storage } from '../storage';
import { Theme, ThemeBadgeColors, ThemePalette } from '../storage/theme';
import { BadgeColorMode, IRule } from '../storage/types';

/**
 * The background color of the badge shown on the extension icon.
 */
export const BADGE_COLOR = '#e11d48';

/**
 * Resolves the badge background color from the current settings. When {@link BadgeColorMode.Theme}
 * is selected, the color follows the current extension theme by using the color associated with
 * the active palette. Otherwise the manually chosen color is used.
 *
 * @returns The badge background color as a hex string.
 */
export function resolveBadgeColor(): string {
    if (storage.settings.badgeColorMode === BadgeColorMode.Custom) {
        return storage.settings.badgeColor || BADGE_COLOR;
    }

    const theme: Theme.Light | Theme.Dark = storage.info.theme;
    const palette: ThemePalette | undefined = storage.settings.themePalette?.[theme];
    return (palette && ThemeBadgeColors[palette]) || BADGE_COLOR;
}

/**
 * Applies the resolved badge background color of the extension icon to all tabs.
 */
export async function applyBadgeColor() {
    await browser.action.setBadgeBackgroundColor({ color: resolveBadgeColor() });
}

/**
 * Sets the badge of the extension icon for the given tab to the number of enabled rules that match
 * the tab URL. The badge is cleared when the badge count setting is disabled or when no rule
 * matches the URL.
 *
 * @param tabId The identifier of the tab for which to update the badge.
 * @param url The URL of the tab, if known.
 */
export async function updateBadgeForTab(tabId: number, url?: string) {
    let text = '';

    if (storage.settings.badgeCount && url) {
        const count = filterRulesByUrl(storage.rules as IRule[], url).filter(
            (rule) => rule.enabled,
        ).length;
        text = count ? String(count) : '';
    }

    await browser.action.setBadgeText({ tabId, text });
}

/**
 * Updates the badge of the extension icon for the currently active tab. When the badge count
 * setting is disabled, the badge is cleared on every tab.
 */
export async function updateActiveTabBadge() {
    if (!storage.settings.badgeCount) {
        const tabs = await browser.tabs.query({});
        for (const tab of tabs) {
            if (tab.id) await browser.action.setBadgeText({ tabId: tab.id, text: '' });
        }
        return;
    }

    const [tab] = await browser.tabs.query({ active: true, lastFocusedWindow: true });
    if (tab?.id) await updateBadgeForTab(tab.id, tab.url);
}

/**
 * Initializes the badge: sets its background color and updates the count for the active tab.
 */
export async function setupBadge() {
    await applyBadgeColor();
    await updateActiveTabBadge();
}