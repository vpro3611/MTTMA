export interface ExpiredInvitationsScanner {
    scanExpiredInvitations (): Promise<number>;
}