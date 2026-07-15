// services/queue/translationWorker.js
import TranslationJob from "../../models/TranslationJob.js";
import { processTranslationJob } from "../../controllers/chapter.controller.js";

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 3;

export function startWorker() {
  setInterval(async () => {
    const job = await TranslationJob.findOneAndUpdate(
      { status: "queued" },
      { status: "processing" },
      { new: true }
    );
    if (!job) return;

    try {
      await processTranslationJob(job);
      job.status = "done";
      await job.save();
    } catch (err) {
      job.attempts += 1;
      job.errorMessage = err.message;
      job.status = job.attempts >= MAX_ATTEMPTS ? "failed" : "queued"; // retry nếu chưa vượt giới hạn
      await job.save();
    }
  }, POLL_INTERVAL_MS);
}