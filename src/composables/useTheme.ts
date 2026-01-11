import { Theme, ThemePalette as ThemePaletteT } from '@/lib/theme';
import { usePreferredColorScheme } from '@vueuse/core';
import { useSettings } from './useStorage';

export function useTheme(): Ref<Theme.Light | Theme.Dark> {
    const settings = useSettings();
    const preferredColor = usePreferredColorScheme();

    return computed(() => {
        if (settings.theme === Theme.Auto && preferredColor.value !== 'no-preference')
            return preferredColor.value as Theme.Light | Theme.Dark;
        else return settings.theme as Theme.Light | Theme.Dark;
    });
}

export function watchTheme() {
    const theme = useTheme();

    watchEffect(() => {
        document.documentElement.dataset.theme = theme.value;
    });
}

export function useThemePalette(): Ref<ThemePaletteT> {
    const settings = useSettings();
    const theme = useTheme();
    const themePalette = computed(() => settings.themePalette[theme.value]);

    return themePalette;
}

export function watchThemePalette() {
    const themePalette = useThemePalette();
    watchEffect(() => (document.documentElement.dataset.themePalette = themePalette.value));
}
