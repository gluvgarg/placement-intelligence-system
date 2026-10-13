
import cron from "node-cron";
import Job from "../models/job.model.js";

const startJobDeadlineScheduler = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const result = await Job.closeExpiredJobs();

      if (result.modifiedCount > 0) {
        console.log(
          `${result.modifiedCount} jobs closed.`
        );
      }
    } catch (error) {
      console.error("Deadline check failed:", error);
    }
  });

  console.log("Job deadline scheduler started.");
};

export default startJobDeadlineScheduler;
