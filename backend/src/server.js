require("dotenv").config();

const app = require("./app");
const connectDB = require("./config/db");
const startTripScheduler = require("./tripScheduler");
const startEmailWorker = require("./emailWorker");

const PORT = process.env.PORT || 5000;


const startServer = async () => {
  await connectDB();

  startTripScheduler();
  startEmailWorker();

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

startServer();
