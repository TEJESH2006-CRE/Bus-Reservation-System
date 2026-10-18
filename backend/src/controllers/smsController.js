const sendBookingSMS = async (req, res) => {
  try {
    const { phone, message } = req.body;

    if (!phone || !message) {
      return res.status(400).json({
        message: "phone and message are required",
      });
    }

    // Mock SMS sending
    console.log("Mock SMS sent");
    console.log(`To: ${phone}`);
    console.log(`Message: ${message}`);

    res.status(200).json({
      message: "SMS sent successfully",
      phone,
      smsStatus: "mock_sent",
    });
  } catch (error) {
    console.error("Send SMS error:", error.message);

    res.status(500).json({
      message: "Failed to send SMS",
    });
  }
};

module.exports = {
  sendBookingSMS,
};