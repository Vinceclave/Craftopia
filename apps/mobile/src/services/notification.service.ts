
import { Announcement } from '~/hooks/queries/useAnnouncements';

type OpenHandler = () => void;

export class NotificationService {
    private static openHandler: OpenHandler | null = null;
    private static localNotifications: Announcement[] = [];
    private static subscribers: ((notifications: Announcement[]) => void)[] = [];

    static setOpenHandler(handler: OpenHandler) {
        this.openHandler = handler;
    }

    static open() {
        if (this.openHandler) {
            this.openHandler();
        } else {
            console.warn('NotificationService: No open handler registered');
        }
    }

    static addLocalNotification(notification: Omit<Announcement, 'announcement_id' | 'created_at' | 'admin'>) {
        const newNotification: Announcement = {
            ...notification,
            announcement_id: Date.now(), // specific ID for local notifications
            created_at: new Date().toISOString(),
            admin: {
                user_id: 0,
                username: 'System'
            }
        };

        this.localNotifications = [newNotification, ...this.localNotifications];
        this.notifySubscribers();

        // Automatically open the modal when a new notification arrives
        this.open();
    }

    static getLocalNotifications() {
        return this.localNotifications;
    }

    static subscribe(callback: (notifications: Announcement[]) => void) {
        this.subscribers.push(callback);
        callback(this.localNotifications); // Initial call
        return () => {
            this.subscribers = this.subscribers.filter(cb => cb !== callback);
        };
    }

    private static notifySubscribers() {
        this.subscribers.forEach(cb => cb(this.localNotifications));
    }
}
