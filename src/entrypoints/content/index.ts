import { browser, defineContentScript } from '#imports';

export default defineContentScript({
    matches: ['http://*/*', 'https://*/*'],
    runAt: 'document_start',
    main() {
        let lastUrl = location.href;

        function notifyBackground(type: 'page:open' | 'page:update') {
            if (location.href === lastUrl && type === 'page:update') return;
            lastUrl = location.href;
            browser.runtime.sendMessage({ type, url: location.href }).catch(() => {});
        }

        // Initial page load
        notifyBackground('page:open');

        // Navigation API (modern SPA)
        if (window.navigation) {
            window.navigation.addEventListener('navigatesuccess', () => {
                notifyBackground('page:update');
            });
        }

        // History API fallback
        const originalPushState = history.pushState.bind(history);
        history.pushState = (...args) => {
            originalPushState(...args);
            notifyBackground('page:update');
        };

        const originalReplaceState = history.replaceState.bind(history);
        history.replaceState = (...args) => {
            originalReplaceState(...args);
            notifyBackground('page:update');
        };

        window.addEventListener('popstate', () => {
            notifyBackground('page:update');
        });

        // Hash change fallback
        window.addEventListener('hashchange', () => {
            notifyBackground('page:update');
        });
    },
});
