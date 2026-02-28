import {ExpiredInvitationsScanner} from "../interfaces/repo_interface.js";
import {Pool, PoolClient} from "pg";
import {WorkerDatabaseError} from "../errors/cron_and_workers_errors.js";


export class ScanForExpiredPG implements ExpiredInvitationsScanner {
    constructor(private readonly pg: Pool | PoolClient) {}

    async scanExpiredInvitations() {
        try {
            const queryString = `UPDATE organization_invitations
                                 SET status = 'EXPIRED'
                                 WHERE expires_at < NOW() AND status = 'PENDING';`
            const result = await this.pg.query(queryString);
            return result.rowCount ?? 0;
        } catch (error: any) {
            throw new WorkerDatabaseError("Error: Something went wrong with setting status to expired (Postgress Repository / Cron");
        }
    }
}