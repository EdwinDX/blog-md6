require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_URL}`);
    console.log("MongoDB connected.");
  } catch (error) {
    console.log(error.message);
    process.exit(1);
  }
};
connectDB();

const Router = require("./routes/routes");
const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/", Router);
app.use(express.static(path.join(__dirname, 'build')));


app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
