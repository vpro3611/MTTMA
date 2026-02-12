import {Pool, PoolClient} from "pg";

export interface TransactionManager {
    runInTransaction<T>(work: (client: unknown) => Promise<T>): Promise<T>
}

export class TransactionManagerPg implements TransactionManager {
    constructor(private readonly pool: Pool) {}
    async runInTransaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
        const client = await this.pool.connect();

        try {
            await client.query('BEGIN');
            const result = await work(client);
            await client.query('COMMIT');
            return result;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}