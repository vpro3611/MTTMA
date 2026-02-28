import {TransactionManager} from "../../transaction_manager/transaction_manager_pg.js";
import {ScanForExpiredPG} from "../jobs_repo/scan_for_expired_pg.js";


export class JobRunner {
    constructor(private readonly txManager: TransactionManager) {}


    async runJob() {
        return await this.txManager.runInTransaction(async (client) => {
            const jobsRepo = new ScanForExpiredPG(client);

            return await jobsRepo.scanExpiredInvitations();
        })
    }
}