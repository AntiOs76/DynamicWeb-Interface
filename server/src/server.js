import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { app } from "./app.js";

async function startServer() {
  await connectDatabase(env.mongoUri);

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`RecallFlow API listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", error);
  process.exit(1);
});
