export default defineContentScript({
    matches: ['http://*/*', 'https://*/*'],
    runAt: 'document_start',
    main() {
        console.log('Hello content.');
    },
});
