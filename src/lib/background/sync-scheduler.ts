import { browser } from '#imports';
import { watch } from 'vue';
import { Logger } from '../logger';
import { storage } from '../storage';
import { SyncFrequency, SyncMethod } from '../storage/types';

/**
 * The identifier of the automatic synchronization alarm and of the notification shown when the
 * automatic synchronization may cause data loss.
 */
export const SYNC_ALARM = 'auto-sync';

/**
 * Maps a {@link SyncFrequency} to the corresponding alarm period in minutes.
 *
 * @param frequency The synchronization frequency to convert.
 * @returns The period in minutes for the given frequency.
 */
export function periodInMinutes(frequency: SyncFrequency): number {
    switch (frequency) {
        case SyncFrequency.Hourly:
            return 60;
        case SyncFrequency.Weekly:
            return 60 * 24 * 7;
        case SyncFrequency.Daily:
        default:
            return 60 * 24;
    }
}

/**
 * The automatic synchronization decision: the action to perform and whether that action would
 * overwrite a newer version on the other side (which may cause data loss).
 */
type SyncDecision = {
    action: 'upload' | 'download';
    mayLoseData: boolean;
} | null;

/**
 * Decides which automatic synchronization action, if any, should be performed for the given local
 * and remote update timestamps and the configured synchronization method.
 *
 * @param localUpdated The local last update timestamp.
 * @param remoteUpdated The remote last update timestamp.
 * @param method The configured synchronization method.
 * @returns The action to perform, or null when both versions are identical.
 */
export function decideSyncAction(
    localUpdated: number,
    remoteUpdated: number,
    method: SyncMethod,
): SyncDecision {
    if (method === SyncMethod.Push) {
        if (localUpdated > remoteUpdated) return { action: 'upload', mayLoseData: false };
        if (remoteUpdated > localUpdated) return { action: 'upload', mayLoseData: true };
        return null;
    }

    if (method === SyncMethod.Pull) {
        if (remoteUpdated > localUpdated) return { action: 'download', mayLoseData: false };
        if (localUpdated > remoteUpdated) return { action: 'download', mayLoseData: true };
        return null;
    }

    if (remoteUpdated > localUpdated) return { action: 'download', mayLoseData: false };
    if (localUpdated > remoteUpdated) return { action: 'upload', mayLoseData: false };
    return null;
}

/**
 * Shows a notification explaining that the automatic synchronization may cause data loss. The
 * notification is only displayed when the user granted the "notifications" permission. Clicking
 * the notification opens the options page where the user can synchronize manually.
 *
 * @param action The synchronization action that was skipped.
 */
async function notifyPotentialDataLoss(action: 'upload' | 'download') {
    if (!(await browser.permissions.contains({ permissions: ['notifications'] }))) return;

    await browser.notifications.create(SYNC_ALARM, {
        type: 'basic',
        iconUrl: browser.runtime.getURL('/icon/128.png'),
        title: browser.i18n.getMessage('SYNC_NOTIFICATION_TITLE'),
        message: browser.i18n.getMessage(
            action === 'upload' ? 'SYNC_NOTIFICATION_BODY_UPLOAD' : 'SYNC_NOTIFICATION_BODY_DOWNLOAD',
        ),
    });
}

/**
 * Runs the automatic synchronization: compares the local and remote versions and either performs
 * the safe synchronization automatically, or — when it may cause data loss — notifies the user.
 */
export async function runAutoSync() {
    if (!storage.settings.syncEnabled) return;

    const remote = await storage.getRemoteInfo();
    const decision = decideSyncAction(
        storage.info.updated,
        remote.updated,
        storage.settings.syncMethod,
    );
    if (!decision) return;

    if (decision.mayLoseData) {
        await notifyPotentialDataLoss(decision.action);
        return;
    }

    try {
        if (decision.action === 'upload') await storage.upload(true);
        else await storage.download(true);
    } catch (e) {
        Logger.error('Automatic synchronization failed:', e, decision.action);
    }
}

/**
 * (Re)creates the automatic synchronization alarm according to the current settings. The alarm is
 * removed when cloud synchronization is disabled.
 */
export async function setupSyncAlarm() {
    await browser.alarms.clear(SYNC_ALARM);

    if (!storage.settings.syncEnabled) return;

    await browser.alarms.create(SYNC_ALARM, {
        periodInMinutes: periodInMinutes(storage.settings.syncFrequency),
    });
}

/**
 * Sets up the automatic synchronization: registers the alarm and notification listeners and keeps
 * the alarm in sync with the frequency/toggle settings.
 */
export function setupSyncScheduler() {
    storage.onLoaded(() => {
        void setupSyncAlarm();

        watch(
            () => [storage.settings.syncEnabled, storage.settings.syncFrequency],
            () => void setupSyncAlarm(),
        );
    });

    browser.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name !== SYNC_ALARM) return;
        void runAutoSync();
    });

    browser.notifications.onClicked.addListener(async (notificationId) => {
        if (notificationId !== SYNC_ALARM) return;
        await browser.tabs.create({ url: browser.runtime.getURL('/options.html') });
    });
}