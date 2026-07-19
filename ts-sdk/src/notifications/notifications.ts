/** Desktop / web notification bridge stub. */
export class NotificationBridge {
  async show(title: string, _body?: string): Promise<void> {
    void title;
    // Implement with Electron Notification or Web Notifications API in Phase 2.
  }
}
