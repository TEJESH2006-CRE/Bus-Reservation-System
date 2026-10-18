
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const EmailJob = require("./models/EmailJob");

const MAX_ATTEMPTS = 5;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

let isProcessing = false;

async function processEmailJobs() {
  if (isProcessing) return;

  isProcessing = true;

  try {
    while (true) {
      const job = await EmailJob.findOneAndUpdate(
        {
          status: "pending",
          nextAttemptAt: { $lte: new Date() },
        },
        {
          $set: { status: "processing" },
          $inc: { attempts: 1 },
        },
        {
          sort: { createdAt: 1 },
          returnDocument: "after",
        }
      );

      if (!job) break;

      try {
        const mailOptions = {
          from: {
            name: "BusGo",
            address: process.env.EMAIL_USER,
          },
          to: job.to,
          subject: job.subject,
          text: job.message,
        };

        if (job.attachment?.content?.length) {
          mailOptions.attachments = [
            {
              filename: job.attachment.filename || "E-Ticket.pdf",
              content: job.attachment.content,
              contentType:
                job.attachment.contentType || "application/pdf",
            },
          ];
        }

        await transporter.sendMail(mailOptions);

        await EmailJob.updateOne(
          { _id: job._id, status: "processing" },
          {
            $set: {
              status: "sent",
              lastError: "",
            },
          }
        );

        console.log(`Email job ${job._id} sent successfully.`);
      } catch (error) {
        const permanentlyFailed = job.attempts >= MAX_ATTEMPTS;
        const retryDelayMinutes = Math.min(
          2 ** (job.attempts - 1),
          30
        );

        await EmailJob.updateOne(
          { _id: job._id, status: "processing" },
          {
            $set: {
              status: permanentlyFailed ? "failed" : "pending",
              nextAttemptAt: permanentlyFailed
                ? new Date("9999-12-31")
                : new Date(Date.now() + retryDelayMinutes * 60 * 1000),
              lastError: error.message,
            },
          }
        );

        console.error(
          `Email job ${job._id} failed: ${error.message}`
        );
      }
    }
  } catch (error) {
    console.error("Email worker error:", error.message);
  } finally {
    isProcessing = false;
  }
}

function startEmailWorker() {
  processEmailJobs();

  cron.schedule("* * * * *", processEmailJobs);

  console.log("BusGo email worker started.");
}

module.exports = startEmailWorker;
