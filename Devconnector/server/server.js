const express = require("express");

const app = express(); // it will create the express server.
const connectDB = require("./config/db.config");

connectDB();
// define routes
app.use(express.json());
app.use("/users", require("./routes/users"));
app.use("/profile", require("./routes/profile"));
app.get("/", (req, res) => {
  res.status(200).json({ msg: "hello from abhi" });
});

app.listen(9000, () => console.log("server started"));
