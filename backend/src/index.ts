import {startServer} from "./server.js";
import dotenv from "dotenv";


startServer().catch((err) => {
    console.error("Error while starting the server: ", err);
    process.exit(1);
})