import { NotificationItem, WatchlistSubscription, Species, ThreatLevel } from '../types/index.js';

export interface IObserver {
  notify(notification: Partial<NotificationItem>): void;
}

export class WatchlistNotifier {
  private observers: Map<string, (notif: Partial<NotificationItem>) => void> = new Map();

  public subscribe(userId: string, callback: (notif: Partial<NotificationItem>) => void): void {
    this.observers.set(userId, callback);
  }

  public unsubscribe(userId: string): void {
    this.observers.delete(userId);
  }

  /**
   * Broadcasts when an official species threat level is changed
   */
  public onThreatLevelChanged(
    species: Species,
    oldThreat: ThreatLevel,
    newThreat: ThreatLevel,
    subscriptions: WatchlistSubscription[],
    createNotificationFn: (recipientId: string, title: string, message: string, type: any, linkId: string) => void
  ): void {
    const relevantSubs = subscriptions.filter(s => s.speciesId === species.speciesId || !s.speciesId);

    const title = `🚨 Official Threat Status Change: ${species.commonName}`;
    const message = `Government Authority updated threat classification for "${species.commonName}" (${species.scientificName}) from [${oldThreat}] to [${newThreat}].`;

    for (const sub of relevantSubs) {
      createNotificationFn(sub.userId, title, message, 'THREAT_UPDATE', species.speciesId);
    }
  }

  /**
   * Broadcasts when a new verified record is published
   */
  public onRecordPublished(
    species: Species,
    recordId: string,
    region: string,
    subscriptions: WatchlistSubscription[],
    createNotificationFn: (recipientId: string, title: string, message: string, type: any, linkId: string) => void
  ): void {
    const relevantSubs = subscriptions.filter(
      s => s.speciesId === species.speciesId || (s.region && region.toLowerCase().includes(s.region.toLowerCase()))
    );

    const title = `🌿 Verified Sighting Published: ${species.commonName}`;
    const message = `A peer-verified biodiversity record has been published in ${region} with full scientific credentials.`;

    for (const sub of relevantSubs) {
      createNotificationFn(sub.userId, title, message, 'VERIFIED', recordId);
    }
  }
}
