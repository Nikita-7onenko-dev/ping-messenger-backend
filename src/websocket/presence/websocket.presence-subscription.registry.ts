class PresenceSubscriptionRegistry {
  private presenceSubscribers = new Map<string, Set<string>>();
  private presenceSubjects = new Map<string, Set<string>>();

  subscribe(subscriberId: string, subjectIds: string[]) {
    const subjects =
      this.presenceSubjects.get(subscriberId) ?? new Set<string>();
    this.presenceSubjects.set(subscriberId, subjects);

    subjectIds.forEach((subjectId) => {
      const subscribers =
        this.presenceSubscribers.get(subjectId) ?? new Set<string>();
      subscribers.add(subscriberId);
      this.presenceSubscribers.set(subjectId, subscribers);

      subjects.add(subjectId);
    });
  }

  unsubscribe(subscriberId: string, subjectIds: string[]) {
    const subjects = this.presenceSubjects.get(subscriberId);

    subjectIds.forEach((subjectId) => {
      const subscribers = this.presenceSubscribers.get(subjectId);

      subjects?.delete(subjectId);

      if (!subscribers) return;

      subscribers.delete(subscriberId);

      if (!subscribers.size) {
        this.presenceSubscribers.delete(subjectId);
      }
    });

    if (!subjects?.size) this.presenceSubjects.delete(subscriberId);
  }

  removeSubscriber(subscriberId: string) {
    const subjects = this.presenceSubjects.get(subscriberId);
    if (!subjects) return;

    subjects.forEach((subject) => {
      const subscribers = this.presenceSubscribers.get(subject);
      if (subscribers) {
        subscribers.delete(subscriberId);
      }
    });
    this.presenceSubjects.delete(subscriberId);
  }

  getSubscribers(userId: string) {
    return Array.from(this.presenceSubscribers.get(userId) || []);
  }
}

const presenceSubscriptionRegistry = new PresenceSubscriptionRegistry();
export { presenceSubscriptionRegistry };
