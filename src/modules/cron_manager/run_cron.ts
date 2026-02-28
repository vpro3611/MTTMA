import {ProceedExpiredScan} from "./interfaces/cron_interface.js";
import {JobRunner} from "./jobs/cron_transactional.js";
import cron from "node-cron";

export class RunCron implements ProceedExpiredScan {
    constructor(private readonly jobRunner: JobRunner) {}

    async proceedExpiredScan() {
        console.log(`Proceed expired scan booting.. |  ${new Date().toLocaleString()}`);

        cron.schedule("*/10 * * * *", async () => {
            console.log(`Proceed expired scan started |  ${new Date().toLocaleString()}`);

            try {
                const updatedRows = await this.jobRunner.runJob();
                console.log(`Proceed expired scan finished -> Updated count: ${updatedRows}  |  ${new Date().toLocaleString()}`);
            } catch (error) {
                console.error(`Proceed expired scan failed |  ${new Date().toLocaleString()}`, error);
            }
        });
    }
}