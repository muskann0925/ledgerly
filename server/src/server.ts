import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import { startOverdueJob } from "./jobs/overdueJob";

async function start() {
    try {
        await prisma.$connect();
        console.log("DB Connected");
        startOverdueJob();
        app.listen(env.PORT, () => {
            console.log(`Server running on port ${env.PORT}`);
        });

    } catch (error) {
        console.log("Failed to connect to DB");
        console.error(error);
    }
}
start();
