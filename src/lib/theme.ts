import z from 'zod';

export enum Theme {
    Dark = 'dark',
    Light = 'light',
    Auto = 'auto',
}

export const zTheme = z.enum(Theme).default(Theme.Auto);

export enum LightThemePalette {
    Chrome = 'chrome',
    Dawn = 'dawn',
    Tomorrow = 'tomorrow',
    XCode = 'xcode',
    CloudEditor = 'cloud_editor',
}

export enum DarkThemePalette {
    Dracula = 'dracula',
    Monokai = 'monokai',
    OneDark = 'one_dark',
    SolarizedDark = 'solarized_dark',
    TomorrowNight = 'tomorrow_night',
    Twilight = 'twilight',
    CloudEditorDark = 'cloud_editor_dark',
}

export const ThemePalette = {
    ...LightThemePalette,
    ...DarkThemePalette,
};
export type ThemePalette = (typeof ThemePalette)[keyof typeof ThemePalette];

export const zLightThemePalette = z.enum(LightThemePalette).default(LightThemePalette.Chrome);
export const zDarkThemePalette = z.enum(DarkThemePalette).default(DarkThemePalette.Monokai);
export const zThemePalette = z.union([zLightThemePalette, zDarkThemePalette]).default(DarkThemePalette.Monokai);
