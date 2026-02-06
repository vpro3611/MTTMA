import dotenv from 'dotenv';
import {pool} from "./db/pg_pool.js";

// load env

async function main() {
    const res = await pool.query('SELECT NOW()');
    console.log(res.rows[0].now);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
