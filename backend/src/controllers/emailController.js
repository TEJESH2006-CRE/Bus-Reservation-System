
const nodemailer = require("nodemailer");
const multer = require("multer");
const EmailJob = require("../models/EmailJob");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === "application/pdf" &&
      file.originalname.toLowerCase().endsWith(".pdf")
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});


const sendBookingEmail = async (req, res) => {
  try {
    const { to, subject, message } = req.body;

    if (!to || !subject || !message) {
      return res.status(400).json({
        message: "to, subject and message are required",
      });
    }

    const isCancellationEmail = subject
      .toLowerCase()
      .includes("cancellation");

    if (!req.file && !isCancellationEmail) {
      return res.status(400).json({
        message: "E-ticket PDF attachment is required",
      });
    }

    const emailJob = await EmailJob.create({
      to,
      subject,
      message,
      attachment: req.file
        ? {
            filename: req.file.originalname,
            content: req.file.buffer,
            contentType: "application/pdf",
          }
        : undefined,
    });

    return res.status(202).json({
      message: "Email queued successfully",
      jobId: emailJob._id,
    });
  } catch (error) {
    console.error("Queue email error:", error.message);

    return res.status(500).json({
      message: "Failed to queue email",
    });
  }
};


module.exports = {
  sendBookingEmail,
  upload,
};
