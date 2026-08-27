import cron from "node-cron";
import { hardDeleteUsersJob } from "./jobs/hard-delete-users.job.js";
import { deleteExpiredSessionsJob } from "./jobs/delete-expired-sessions.job.js";
import { deleteExpiredTokensJob } from "./jobs/delete-expired-token.job.js";
import { cleanupRateLimiterJob } from "./jobs/cleanup-rate-limiter.job.js";

const CRON_TIMEZONE = "Europe/Kyiv";

cron.schedule("0 3 * * *", hardDeleteUsersJob, {
  name: "hard-delete-users",
  timezone: CRON_TIMEZONE,
  noOverlap: true,
});

cron.schedule("0 3 * * *", deleteExpiredSessionsJob, {
  name: "delete-expired-sessions",
  timezone: CRON_TIMEZONE,
  noOverlap: true,
});

cron.schedule("0 3 * * *", deleteExpiredTokensJob, {
  name: "delete-expired-tokens",
  timezone: CRON_TIMEZONE,
  noOverlap: true,
});

cron.schedule("0 3 * * *", cleanupRateLimiterJob, {
  name: "cleanup-rate-limiter",
  timezone: CRON_TIMEZONE,
  noOverlap: true,
});
