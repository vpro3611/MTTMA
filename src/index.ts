import {startServer} from "./server.js";
import dotenv from "dotenv";
import {RunCron} from "./modules/cron_manager/run_cron.js";
import {JobRunner} from "./modules/cron_manager/jobs/cron_transactional.js";
import {TransactionManagerPg} from "./modules/transaction_manager/transaction_manager_pg.js";
import {pool} from "./db/pg_pool.js";

dotenv.config();

async function bootstrap() {
    // deps
    const txManager = new TransactionManagerPg(pool);
    const jobRunner = new JobRunner(txManager);

    // cron related
    const cronJob = new RunCron(jobRunner);
    await cronJob.proceedExpiredScan();

    // server starting
    await startServer();
}


bootstrap().catch((err) => {
    console.error("Error while bootstrapping: ", err);
    process.exit(1);
})

// startServer().catch((err) => {
//     console.error("Error while starting the server: ", err);
//     process.exit(1);
// })