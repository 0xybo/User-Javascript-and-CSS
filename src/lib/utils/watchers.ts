import type { WatchHandle } from 'vue';
import { watch } from 'vue';

export class WatchersHandler {
    private watchers: WatchHandle[] = [];
    private isPaused: boolean = false;

    addWatcher(watcher: WatchHandle) {
        this.watchers.push(watcher);
    }

    /**
     * A wrapper around Vue's `watch` function that automatically adds the created watcher to the
     * internal list of watchers.
     * This allows for centralized management of watchers, enabling pausing, resuming, or stopping
     * all watchers at once.
     *
     * /!\ Note: This wrapper sets the `flush` option to `'sync'`, which may affect the
     * timing of the callback execution.
     *
     * Type definition: {@linkcode watch vue.watch}
     *
     * Documentation: {@link https://vuejs.org/api/reactivity-core.html#watch Vue's watch function}
     *
     * @param source The reactive source to watch.
     * @param cb The callback function to execute when the source changes.
     * @param options Optional watch options, such as `immediate` or `deep`.
     * @returns The created watcher handle.
     */
    watch: typeof watch = ((...args: Parameters<typeof watch>) => {
        let [source, cb, options] = args;

        if (!options) options = {};
        options.flush = 'sync';

        const watcher = watch(source, (...args) => !this.isPaused && cb(...args), options);
        this.addWatcher(watcher);
        return watcher;
    }) as typeof watch;

    pauseWatchers() {
        this.isPaused = true;
    }

    resumeWatchers() {
        this.isPaused = false;
    }

    stopWatchers() {
        this.watchers.forEach((w) => w.stop());
        this.watchers = [];
    }

    whileWatchersPaused(callback: () => void) {
        this.pauseWatchers();
        try {
            callback();
        } finally {
            this.resumeWatchers();
        }
    }
}
