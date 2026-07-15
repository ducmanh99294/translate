const TranslationJob = require("../../models/TranslationJob");
const { processTranslationJob } = require("../../controllers/chapterController");

const POLL_INTERVAL_MS = 3000;
const MAX_ATTEMPTS = 3;

function startWorker() {
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
      job.status = job.attempts >= MAX_ATTEMPTS ? "failed" : "queued";
      await job.save();
    }
  }, POLL_INTERVAL_MS);
}

module.exports = { startWorker };