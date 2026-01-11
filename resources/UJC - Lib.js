(function () {
    if (window.UJC?.name == 'UJC') return;

    class UJCStore {
        #items = {};

        store(name, obj) {
            if (name in this.#items) throw `Item named '${name}' already stored.`;
            this.#items[name] = obj;
        }

        unstore(name, obj) {
            if (!(name in this.#items)) throw `Item named '${name}' not found.`;
            delete this.#items[name];
        }

        update(name, obj) {
            if (!(name in this.#items)) throw `Item named '${name}' not found.`;
            Object.assign(this.#items[name], obj);
        }

        retrieve(name) {
            if (!(name in this.#items)) throw `Item named '${name}' not found.`;
            return this.#items[name];
        }
    }

    class UJCLogger {
        static #loggers = {};

        static get(name) {
            if (!(name in UJCLogger.#loggers)) throw `Logger named '${name}' not found.`;
            return UJCLogger.#loggers[name];
        }

        #name;
        #parent;

        constructor(name, parent) {
            this.#name = name;
            this.#parent = parent;
        }

        new(name, child = true) {
            return (UJCLogger.#loggers[name] = new UJCLogger(name, child ? this : undefined));
        }

        get parent() {
            return this.#parent;
        }

        get name() {
            return this.#name;
        }

        #log(type, style, ...messages) {
            if (!UJC.settings.LOGS.includes(type)) return;

            const names = [];
            let current = this;
            while (current) {
                names.push(current.name);
                current = current.parent;
            }

            const header = `%c[UJC][${names.reverse().join('.')}]`;
            console.log(header, style, ...messages);
        }

        error(...messages) {
            this.#log('error', 'background:red; color:white; padding:2px 4px; border-radius:3px;', ...messages);

            if (UJC.settings.DEBUG) debugger;
        }

        warning(...messages) {
            this.#log('warning', 'background:orange; color:black; padding:2px 4px; border-radius:3px;', ...messages);
        }

        info(...messages) {
            this.#log('info', 'background:blue; color:white; padding:2px 4px; border-radius:3px;', ...messages);
        }

        success(...messages) {
            this.#log('success', 'background:green; color:white; padding:2px 4px; border-radius:3px;', ...messages);
        }

        message(...messages) {
            this.#log('message', 'background:gray; color:white; padding:2px 4px; border-radius:3px;', ...messages);
        }

        debug(...messages) {
            this.#log('debug', 'background:purple; color:white; padding:2px 4px; border-radius:3px;', ...messages);
        }
    }

    class UJCEventListener {
        static #symbol = Symbol('UJCEventListener');
        /** @type {string} */
        #name;
        /** @type {(Event) => any} */
        #callback;
        /** @type {EventTarget} */
        #target;
        /** @type {EventListenerOptions} */
        #options;
        /** @type {string} */
        #id = Math.random().toString(36).substring(2, 12);
        /** @type {UJCEventListener[]} */
        #children = [];

        get name() {
            return this.#name;
        }

        get callback() {
            return this.#callback;
        }

        get target() {
            return this.#target;
        }

        get options() {
            return this.#options;
        }

        get children() {
            return this.#children;
        }

        set target(newTarget) {
            if (this.isAdded()) {
                this.remove();
                this.#target = newTarget;
                this.add();
            } else this.#target = newTarget;
        }

        /**
         *
         * @param {string} name
         * @param {(Event) => any} callback
         * @param {EventTarget} target
         * @param {AddEventListenerOptions} options
         */
        constructor(name, callback, target, options) {
            this.#name = name;
            this.#callback = callback;
            this.#target = target || window;
            this.#options = options || {};
        }

        isAdded() {
            return Boolean(this.#target[UJCEventListener.#symbol]?.[this.#id]);
        }

        add() {
            this.#target.addEventListener(this.#name, this.#callback, this.#options);
            if (!this.#target[UJCEventListener.#symbol]) this.#target[UJCEventListener.#symbol] = {};
            this.#target[UJCEventListener.#symbol][this.#id] = this;

            for (let child of this.#children) {
                child.add();
            }
        }

        remove() {
            if (!this.isAdded()) return;
            this.#target.removeEventListener(this.#name, this.#callback, this.#options);
            delete this.#target[UJCEventListener.#symbol][this.#id];

            for (let child of this.#children) {
                child.remove();
            }
        }

        /**
         * @returns {UJCEventListener}
         */
        clone() {
            return new UJCEventListener(this.#name, this.#callback, this.#target, this.#options);
        }
    }

    class UJCBinding {
        /** @type {string} */
        #key;
        /** @type {(event: KeyboardEvent) => any} */
        #callback;
        /** @type {string} */
        #name;
        /** @type {string} */
        #description;

        get key() {
            return this.#key;
        }

        get callback() {
            return this.#callback;
        }

        get name() {
            return this.#name;
        }

        get description() {
            return this.#description;
        }

        constructor(key, callback, name, description) {
            this.#key = key;
            this.#callback = callback;
            this.#name = name;
            this.#description = description;
        }
    }

    /** @typedef {{[cssSelectorOrPropertyName: string]: CSSObject | string}} CSSObject */
    /** @typedef {{[cssSelector: string]: CSSObject}} CSSRootObject */

    class UJCStyle {
        /** @type {string} */
        #name;
        /** @type {(CSSRootObject | string)?} */
        #source;
        /** @type {string} */
        #css;
        /** @type {HTMLStyleElement} */
        #$;

        get name() {
            return this.#name;
        }

        get source() {
            return this.#source;
        }

        get css() {
            return this.#css;
        }

        get $() {
            return this.#$;
        }

        get id() {
            return `UJC-style-${this.#name}`;
        }

        get isLoaded() {
            return Boolean(this.#$.parentElement);
        }

        constructor(name, source) {
            this.#name = name;
            this.#source = source;
            this.#css = this.#parse(source);

            this.#$ = UJC.Utils.createElement('style', { id: this.id }, this.#css);
        }

        #parse(source) {
            if (typeof source == 'string') return source;
            return this.#parseObject(source);
        }

        #parseObject(sourceObject) {
            let result = '';
            for (let selectorOrProperty in sourceObject) {
                if (typeof sourceObject[selectorOrProperty] == 'object')
                    result += `${selectorOrProperty}{${this.#parseObject(sourceObject[selectorOrProperty])}}`;
                else result += `${this.#camelToKebab(selectorOrProperty)}:${sourceObject[selectorOrProperty]};`;
            }
            return result;
        }

        #camelToKebab(str) {
            return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        }

        load() {
            if (this.isLoaded) return;

            document.head.append(this.#$);
        }

        unload() {
            if (!this.isLoaded) return;

            this.#$.remove();
        }

        toggle() {
            if (this.isLoaded) this.unload();
            else this.load();
        }
    }

    class UJCAddon {
        /** @type {string} */
        #name;
        /** @type {UJCLogger} */
        #logger;
        /** @type {{}} */
        #settings = {};
        /** @type {{[name: string]: UJCStyle}} */
        #styles = {};
        /** @type {{[key: string]: UJCBinding[]}} */
        #bindings = {};
        /** @type {{[event: string]: UJCEventListener[]}} */
        #eventListeners = {};
        /** @type {boolean} */
        #loaded = false;

        get name() {
            return this.#name || this.constructor.name;
        }

        get logger() {
            return this.#logger;
        }

        get settings() {
            return this.#settings;
        }

        get loaded() {
            return this.#loaded;
        }

        get bindings() {
            return Object.fromEntries(
                Object.entries(this.#bindings).map(([k, bindings]) => [
                    k,
                    bindings.map((b) => ({
                        name: b.name,
                        description: b.description,
                    })),
                ]),
            );
        }

        get styles() {
            return Object.values(this.#styles).map((s) => ({
                name: s.name,
                loaded: s.isLoaded,
            }));
        }

        get eventListeners() {
            return Object.values(this.#eventListeners).map((l) =>
                l.map((e) => ({
                    target: e.target,
                    name: e.name,
                    options: e.options,
                })),
            );
        }

        constructor(name) {
            this.#name = name || this.constructor.name || Math.random().toString(36).substring(2, 10);
            this.#logger = UJC.logger.new(this.#name);

            this.on('keydown', this.#onKeydown, window, { capture: true });
        }

        #onKeydown = (/** @type {KeyboardEvent} */ event) => {
            const key =
                (event.ctrlKey ? 'CTRL+' : '') +
                (event.altKey ? 'ALT+' : '') +
                (event.shiftKey ? 'SHIFT+' : '') +
                event.key.toUpperCase();
            // this.#logger.debug('Key pressed : ' + key);
            // this.#logger.debug(e);

            if (key in this.#bindings) {
                this.#logger.debug(`Shortcut triggered '${key}' !`);
                for (let { callback } of this.#bindings[key]) {
                    try {
                        callback(event);
                    } catch (e) {
                        this.#logger.error(e);
                        break;
                    }
                }
            }
        };

        bind(key, callback, name, description) {
            if (!(key in this.#bindings)) this.#bindings[key] = [];

            this.#bindings[key].push(new UJCBinding(key, callback, name, description));
        }

        unbind(key, callback) {
            if (!(key in this.#bindings)) throw `No shortcut bind to '${key}'.`;

            this.#bindings[key] = this.#bindings[key].filter((binding) => binding.callback == callback);
        }

        /**
         * @param {string} name
         * @param {(event: Event) => any} callback
         * @param {AddEventListenerOptions} options
         * @returns {() => null} Off method
         */
        on(name, callback, target = window, options = {}) {
            if (!(name in this.#eventListeners)) this.#eventListeners[name] = [];

            const eventListener = new UJCEventListener(name, callback, target, options);

            this.#eventListeners[name].push(eventListener);

            if (this.#loaded) eventListener.add();

            return () => this.off(name, callback, target, options);
        }

        /**
         * @param {string} name
         * @param {(event: Event) => any} callback
         * @param {AddEventListenerOptions} options
         */
        off(name, callback, target = window, options = {}) {
            if (!(name in this.#eventListeners)) throw `No event listener registered with event name '${name}' !`;

            const eventIndex = this.#eventListeners[name].findIndex(
                (l) =>
                    l.name == name &&
                    l.callback == callback &&
                    l.target == target &&
                    JSON.stringify(l.options) == JSON.stringify(options),
            );

            if (eventIndex == -1)
                throw `Enable to find event listener with event name '${name}', callback '${callback}', target ${target} and options ${options}`;

            if (this.#loaded) this.#eventListeners[name][eventIndex].remove();
            this.#eventListeners[name] = this.#eventListeners[name].filter((_, i) => i != eventIndex);
        }

        /**
         * @param {Window} newWindow
         */
        reBindEventListeners(newWindow) {
            for (let eventName in this.#eventListeners) {
                for (let eventListener of this.#eventListeners[eventName]) {
                    if (!(eventListener.target instanceof Window)) continue;

                    const clone = eventListener.clone();
                    clone.target = newWindow;
                    clone.add();

                    eventListener.children.push(clone);
                }
            }
        }

        load() {
            try {
                this.loadMethod();
                this.#logger.info(`Script '${this.#name}' loaded !`);
            } catch (e) {
                this.#logger.error(e);
            }

            for (let key in this.#eventListeners) {
                for (let eventListener of this.#eventListeners[key]) {
                    eventListener.add();
                }
            }
            // for (let styleName in this.#styles) {
            // \tthis.#styles[styleName].load();
            // }

            this.#loaded = true;
        }

        unload() {
            try {
                this.unloadMethod();
                this.#logger.info(`Script '${this.#name}' unloaded !`);
            } catch (e) {
                this.#logger.error(e);
            }

            for (let key in this.#eventListeners) {
                for (let eventListener of this.#eventListeners[key]) {
                    eventListener.remove();
                }
            }
            for (let styleName in this.#styles) {
                this.#styles[styleName].unload();
            }

            this.#loaded = false;
        }

        loadMethod() {
            this.#logger.debug('No load method provided');
        }

        unloadMethod() {
            this.#logger.debug('No unload method provided');
        }

        addStyle(name, source, shortcut, description) {
            if (name in this.#styles) throw `Style named '${name}' already exists.`;

            const fullName = this.#getStyleFullName(name);
            const style = new UJCStyle(fullName, source);

            this.#styles[fullName] = style;

            if (shortcut) this.bind(shortcut, () => style.toggle(), `${fullName}Style`, description);

            return style;
        }

        getStyle(name) {
            if (!(name in this.#styles)) throw `Style name '${name}' not found !`;

            const fullName = this.#getStyleFullName(name);

            return this.#styles[fullName];
        }

        removeStyle(name) {
            if (!(name in this.#styles)) throw `Style name '${name}' not found !`;

            const fullName = this.#getStyleFullName(name);

            this.#styles[fullName].unload();
            delete this.#styles[fullName];
        }

        #getStyleFullName(name) {
            return this.#name + name[0].toUpperCase() + name.substring(1);
        }
    }

    /**
     * @template T
     * @typedef {0 extends (1 & T) ? true : false} IsAny
     */

    /**
     * @template A
     * @template B
     * @typedef {IsAny<A> extends true ? false : IsAny<B> extends true ? false : A extends B ? (B extends A ? true : false) : false} Equal
     */

    /**
     * @template A
     * @template B
     * @typedef {IsAny<A> extends true ? false : IsAny<B> extends true ? false : [A] extends [B] ? ([B] extends [A] ? true : false) : false} StrictEqual
     */

    /**
     * @template {{}} T
     * @template U
     * @typedef {{
     *   [P in keyof T as Equal<T[P], U> extends true ? P : never]: T[P]
     * }} PickByType
     */

    /**
     * @template {{}} T
     * @template U
     * @typedef {{
     *     [P in keyof T as StrictEqual<T[P], U> extends true ? P : never]: T[P]
     * }} PickByStrictType
     */

    class UJC {
        /** @type {{[name: string]: UJCAddon}} */
        static #addons = {};
        /** @type {UJCStore} */
        static #store = new UJCStore();
        /** @type {UJCLogger} */
        static #logger = new UJCLogger('Main');
        /**
         * @type {{
         *   DEBUG: boolean,
         *   LOGS: (keyof PickByType<UJCLogger, (...messages: any[]) => void>)[],
         *   REPLICATE_IN_FRAMES: boolean
         * }}
         */
        static #settings = {
            DEBUG: false,
            LOGS: ['error', 'warning', 'info', 'success', 'message', 'debug'],
            REPLICATE_IN_FRAMES: true,
        };
        /** @type {Window[]} */
        static #windows = [window];
        /** @type {MutationObserver?} */
        static #mutationObserver;
        /** @type {boolean} */
        static #isInitialized = false;

        static get settings() {
            return this.#settings;
        }

        static get store() {
            return this.#store;
        }

        static get logger() {
            return this.#logger;
        }

        static get addons() {
            return Object.entries(this.#addons).map(([name, addon]) => ({
                name,
                bindings: addon.bindings,
                loaded: addon.loaded,
                styles: addon.styles,
            }));
        }

        static init() {
            if (this.#isInitialized) throw 'UJC is already initialized !';

            if (this.#settings.REPLICATE_IN_FRAMES) {
                this.#mutationObserver = new MutationObserver(this.#onMutation);
                this.#mutationObserver.observe(document.body, {
                    subtree: true,
                    childList: true,
                });
            }
        }

        /** @type {MutationCallback} */
        static #onMutation = (mutation, observer) => {
            /** @type {NodeListOf<HTMLIFrameElement>} */
            const $frames = document.querySelectorAll('iframe[srcdoc]');
            /** @type {Window[]} */
            const newWindows = [window];

            for (let $frame of $frames) {
                newWindows.push($frame.contentWindow);
                if ($frame.contentWindow in this.#windows) continue;

                $frame.addEventListener('load', () => {
                    this.#logger.debug('New window found and loaded in frame ', $frame);

                    $frame.contentWindow.UJC = window.UJC;

                    for (let addonName in this.#addons) {
                        this.#addons[addonName].reBindEventListeners($frame.contentWindow);
                    }
                });
            }

            this.#windows = newWindows;
        };

        /**
         * @template {Function} F
         * @param {F} fn
         * @param {UJCLogger} logger
         * @returns {F}
         */
        static makeFunctionErrorSafe(fn, logger = this.#logger) {
            return function (...args) {
                try {
                    return fn.call(this, ...args);
                } catch (e) {
                    logger.error(e);
                }
            };
        }

        /**
         * @param {typeof UJCAddon} addon
         * @returns {UJCAddon}
         */
        static #register(addon) {
            const instance = new addon();

            if (instance.name in this.#addons) throw `Addon named '${instance.name}' already exists.`;

            this.#addons[addon.name] = instance;

            return instance;
        }

        static register = this.makeFunctionErrorSafe(this.#register);

        /**
         * @param {string} name
         */
        static #unregister(name) {
            if ((!name) in this.#addons) throw `Addon named '${name}' not found !`;

            this.#addons[name].unload();
            delete this.#addons[name];
        }

        static unregister = this.makeFunctionErrorSafe(this.#unregister);

        /**
         * @param {UJCAddon} addon
         * @returns {UJCAddon}
         */
        static #load(addon) {
            const instance = this.#register(addon);
            instance.load();

            return addon;
        }

        static load = this.makeFunctionErrorSafe(this.#load);
    }

    Object.assign(UJC, {
        UJCAddon,
        UJCEventListener,
        UJCLogger,
        UJCStore,
        UJCBinding,
        UJCStyle,
    });

    if (!window.UJC) window.UJC = UJC;
    else window.UJC = Object.assign(UJC, window.UJC);

    UJC.init();
})();
