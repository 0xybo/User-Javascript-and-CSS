/**
 * Represents the different tabs available in the options page.
 */
export enum Tab {
    Rules = 'rules',
    Modules = 'modules',
    Settings = 'settings',
    About = 'about',
}

/**
 * Represents the different panels available in the options page.
 */
export enum Panel {
    Rule = 'rule',
    Module = 'module',
    Settings = 'settings',
}

/**
 * A mapping of tabs to their corresponding panels. This is used to determine which panel should be displayed when a specific tab is selected.
 */
export const TAB_TO_PANEL_MAP: Partial<Record<Tab, Panel>> = {
    [Tab.Rules]: Panel.Rule,
    [Tab.Modules]: Panel.Module,
    [Tab.Settings]: Panel.Settings,
};
