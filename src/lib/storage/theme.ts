import z from 'zod';

/**
 * Enum representing the available themes for the extension.
 */
export enum Theme {
    Dark = 'dark',
    Light = 'light',
    Auto = 'auto',
}

/**
 * Zod schema for validating the Theme enum values. It ensures that the value is one of the defined
 * themes and provides a default value of {@link Theme.Auto}.
 */
export const zTheme = z.enum(Theme).default(Theme.Auto);

/**
 * Enum representing the available light theme palettes for the extension.
 */
export enum LightThemePalette {
    Chrome = 'chrome',
    Dawn = 'dawn',
    Tomorrow = 'tomorrow',
    XCode = 'xcode',
    CloudEditor = 'cloud_editor',
}

/**
 * Enum representing the available dark theme palettes for the extension.
 */
export enum DarkThemePalette {
    Dracula = 'dracula',
    Monokai = 'monokai',
    OneDark = 'one_dark',
    SolarizedDark = 'solarized_dark',
    TomorrowNight = 'tomorrow_night',
    Twilight = 'twilight',
    CloudEditorDark = 'cloud_editor_dark',
}

/**
 * Combines the light and dark theme palettes into a single object, allowing for easy access to
 * all available theme palettes.
 */
export const ThemePalette = {
    ...LightThemePalette,
    ...DarkThemePalette,
};

/**
 * Type representing the combined theme palettes, allowing for type-safe usage of any defined
 * palette.
 */
export type ThemePalette = (typeof ThemePalette)[keyof typeof ThemePalette];

/**
 * Zod schema for validating the light theme palette values. It ensures that the value is one of the defined
 * light theme palettes and provides a default value of {@link LightThemePalette.Chrome}.
 */
export const zLightThemePalette = z.enum(LightThemePalette).default(LightThemePalette.Chrome);
/**
 * Zod schema for validating the dark theme palette values. It ensures that the value is one of the defined
 * dark theme palettes and provides a default value of {@link DarkThemePalette.Monokai}.
 */
export const zDarkThemePalette = z.enum(DarkThemePalette).default(DarkThemePalette.Monokai);
/**
 * Zod schema for validating the combined theme palette values. It ensures that the value is one of the defined
 * theme palettes and provides a default value of {@link DarkThemePalette.Monokai}.
 */
export const zThemePalette = z
    .union([zLightThemePalette, zDarkThemePalette])
    .default(DarkThemePalette.Monokai);

/**
 * A color for the extension icon badge for each theme palette, so that the badge can follow the
 * current extension theme when {@link BadgeColorMode.Theme} is selected.
 */
export const ThemeBadgeColors: Record<ThemePalette, string> = {
    [LightThemePalette.Chrome]: '#e11d48',
    [LightThemePalette.Dawn]: '#d0604f',
    [LightThemePalette.Tomorrow]: '#e15b55',
    [LightThemePalette.XCode]: '#4285f4',
    [LightThemePalette.CloudEditor]: '#1a73e8',
    [DarkThemePalette.Dracula]: '#bd93f9',
    [DarkThemePalette.Monokai]: '#ff6188',
    [DarkThemePalette.OneDark]: '#61afef',
    [DarkThemePalette.SolarizedDark]: '#2aa198',
    [DarkThemePalette.TomorrowNight]: '#cc6666',
    [DarkThemePalette.Twilight]: '#c8834a',
    [DarkThemePalette.CloudEditorDark]: '#5f7ddb',
};
