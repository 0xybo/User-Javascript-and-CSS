import { _ as RuleListItem, a as RuleListItemScript } from './rule-list-item.vue_vue_type_script_setup_true_lang.js';
import {
    d as defineComponent,
    u as useStore,
    c as computed,
    r as ref,
    g as filterRulesByUrl,
    a as createElement,
    o as openBlock,
    b as createElementBlock,
    e as createCommentVNode,
    f as createTextVNode,
    t as toDisplayString,
    h as unref,
    i as translate,
    _ as i18n,
    j as hasSettingsPermission,
    k as isDevMode,
    F as Fragment,
    l as renderList,
    m as createVNode,
} from './main.js';

const templateRoot = { class: 'column divide-y w-65 max-h-100' };
const headerBox = { class: 'column center gap-3 px-4 py-3 bg-1' };
const headerRow = { class: 'flex items-center gap-1 w-full' };
const headerText = { class: 'column fz-12 grow' };
const headerVersion = { class: 'muted fz-11' };

const rulesList = { key: 1, class: 'column of-y-auto' };
const emptyRules = { key: 2, class: 'muted py-5 px-4' };

const noAccessBox = { key: 3, class: 'flex items-center gap-2 bg-red:10 py-2 px-4 fz-13' };
const noAccessText = { class: 'fz-12' };

const reloadBox = { key: 4, class: 'flex items-center gap-2 bg-blue:10 py-2 px-4 fz-13' };
const reloadText = { class: 'fz-12' };

const newRuleBox = { key: 5, class: 'flex center px-4 py-2' };
const newRuleLink = ['href'];
const newRuleLabel = { class: 'text-left truncate' };

export default defineComponent({
    name: 'the-popup',

    setup() {
        const store = useStore();
        let activeTabId = null;

        const rules = computed(() => store.rules);
        const optionsUrl = chrome.runtime.getURL('src/options.html');
        const manifest = chrome.runtime.getManifest();

        const hasAccess = ref(false);
        const needsReload = ref(false);
        const currentUrl = ref('');

        const getHost = (url) => new URL(url).host;

        const newRuleQuery = computed(() => {
            if (!currentUrl.value) return '';
            const url = new URL(currentUrl.value);
            return '?urls=' + encodeURIComponent(`${url.protocol}//${url.host}/*`);
        });

        const filteredRules = computed(() => (currentUrl.value ? filterRulesByUrl(rules.value, currentUrl.value) : []));

        const reloadPage = () => {
            if (activeTabId) {
                chrome.tabs.reload(activeTabId);
                needsReload.value = false;
            }
        };

        const toggleRule = (rule) => {
            needsReload.value = true;
            chrome.runtime.sendMessage({ action: 'update:rules', rules: [rule] });
        };

        // Detect active tab + check access
        chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
            if (!tab?.id || !tab.url) return;

            activeTabId = tab.id;
            currentUrl.value = tab.url;

            if (currentUrl.value.startsWith('http')) {
                chrome.scripting
                    .executeScript({
                        target: { tabId: activeTabId },
                        func: () => 1,
                    })
                    .then((result) => {
                        if (result && result[0]) hasAccess.value = true;
                    })
                    .catch((err) => console.warn(err));
            }
        });

        const openOptions = () => {
            if (chrome.runtime.openOptionsPage) chrome.runtime.openOptionsPage();
            else window.open(optionsUrl);
        };

        return (ctx, cache) => (
            openBlock(),
            createElement('div', templateRoot, [
                // Header
                createElement('div', headerBox, [
                    createElement('div', headerRow, [
                        createElement('div', headerText, [
                            createTextVNode('User JavaScript and CSS'),
                            createElement('span', headerVersion, 'V ' + toDisplayString(unref(manifest).version)),
                        ]),
                        createElement('a', { onClick: cache[0] || (cache[0] = () => openOptions()) }, [
                            createVNode(RuleListItem, {
                                icon: 'i-solar:settings-minimalistic-bold',
                                'btn-class': '',
                                tooltip: unref(i18n)(['Settings', 'Настройки']),
                            }),
                        ]),
                    ]),
                ]),

                // Permissions warning
                unref(hasSettingsPermission)(unref(store).settings)
                    ? createCommentVNode('')
                    : createElement(
                          'a',
                          {
                              key: 0,
                              class: 'flex items-center gap-1 p-1 justify-center bg-amber c-black cursor-pointer hover:bg-amber-300',
                              onClick: cache[1] || (cache[1] = () => openOptions()),
                          },
                          [
                              createElement('div', { class: 'i-solar:danger-triangle-linear c-black fz-20' }),
                              createElement(
                                  'div',
                                  null,
                                  toDisplayString(
                                      unref(isDevMode)()
                                          ? unref(i18n)(['Allow User Script required', 'Требуется разрешение скриптов'])
                                          : unref(i18n)(['Developer mode required', 'Требуется режим разработчика']),
                                  ),
                              ),
                          ],
                      ),

                // Rules list
                filteredRules.value.length
                    ? createElement('div', rulesList, [
                          openBlock(true),
                          createElement(
                              Fragment,
                              null,
                              renderList(filteredRules.value, (rule, index) =>
                                  createVNode(RuleListItemScript, {
                                      key: rule.id,
                                      modelValue: filteredRules.value[index],
                                      'onUpdate:modelValue': (v) => (filteredRules.value[index] = v),
                                      'base-url': unref(optionsUrl),
                                      onToggle: cache[2] || (cache[2] = (v) => toggleRule(v)),
                                  }),
                              ),
                          ),
                      ])
                    : createElement(
                          'div',
                          emptyRules,
                          toDisplayString(
                              unref(i18n)(['No rules yet, add a new one', 'Правил пока нет, добавьте новое']),
                          ),
                      ),

                // No access warning
                hasAccess.value
                    ? createCommentVNode('')
                    : createElement('div', noAccessBox, [
                          createElement('div', { class: 'i-solar:danger-triangle-linear bg-red fz-24 shrink-0' }),
                          createElement(
                              'span',
                              noAccessText,
                              toDisplayString(
                                  unref(i18n)([
                                      "Looks like the extension doesn't have access to this page",
                                      'Похоже у расширения нет доступа к этой странице',
                                  ]),
                              ),
                          ),
                      ]),

                // Reload notice
                needsReload.value && hasAccess.value
                    ? createElement('div', reloadBox, [
                          createElement('div', { class: 'i-solar:refresh-linear fz-24 shrink-0' }),
                          createElement('span', reloadText, [
                              createTextVNode(
                                  toDisplayString(
                                      unref(i18n)(['To apply changes, you need to', 'Для применения изменений']),
                                  ) + ' ',
                              ),
                              createElement(
                                  'a',
                                  {
                                      class: 'link cursor-pointer',
                                      onClick: cache[3] || (cache[3] = () => reloadPage()),
                                  },
                                  toDisplayString(unref(i18n)(['refresh the page', 'обновите страницу'])),
                              ),
                          ]),
                      ])
                    : createCommentVNode(''),

                // Add new rule
                hasAccess.value
                    ? createElement('div', newRuleBox, [
                          createElement(
                              'a',
                              {
                                  href: unref(optionsUrl) + newRuleQuery.value,
                                  target: '_blank',
                                  class: 'btn bg-amber c-stone-900 w-full',
                              },
                              [
                                  createElement('span', { class: 'i-solar:clipboard-add-linear fz-10' }),
                                  createElement(
                                      'div',
                                      newRuleLabel,
                                      toDisplayString(unref(i18n)(['New rule', 'Добавить'])) +
                                          ': ' +
                                          toDisplayString(getHost(currentUrl.value)),
                                  ),
                              ],
                          ),
                      ])
                    : createCommentVNode(''),
            ])
        );
    },
});
