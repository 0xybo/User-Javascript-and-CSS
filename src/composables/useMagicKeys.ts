import { watch } from '#imports';
import { omit } from '@/lib/utils';
import {
    useMagicKeys as _useMagicKeys,
    UseMagicKeysOptions,
    UseMagicKeysReturn,
} from '@vueuse/core';
import { computed, ref, toValue } from 'vue';

export interface ExtendedUseMagicKeysOptions<
    TReactive extends boolean,
    TPreventDefault extends boolean,
> extends UseMagicKeysOptions<TReactive> {
    preventDefault?: TPreventDefault;
    passive?: TPreventDefault extends true ? true : boolean;
}

export function useMagicKeys<
    TReactive extends boolean = false,
    TPreventDefault extends boolean = false,
>(
    _options: ExtendedUseMagicKeysOptions<TReactive, TPreventDefault> = {},
): UseMagicKeysReturn<TReactive> {
    const event = ref<KeyboardEvent | null>(null);
    const options = computed(() => ({
        ...omit(_options, ['preventDefault']),
        passive: !_options.preventDefault && _options.passive,
        onEventFired: _options.preventDefault
            ? (e: KeyboardEvent) => {
                  event.value = e;
                  return _options.onEventFired?.(e);
              }
            : _options.onEventFired,
    }));

    const result = _useMagicKeys(toValue(options));

    return _options.preventDefault
        ? new Proxy(result, {
              get: (target, prop, rec) => {
                  const ref = Reflect.get(target, prop, rec);
                  if (prop !== 'current')
                      watch(ref, () => {
                          event.value?.preventDefault();
                          event.value = null;
                      });

                  return ref;
              },
          })
        : (result as UseMagicKeysReturn<TReactive>);
}
