require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const connectDB = require("./config/dbConn");
const authRoutes = require("./routes/auth"); // Import authRoutes
const refreshRoutes = require("./routes/refresh");
const logOutRoutes = require("./routes/logout");
const methodOverride = require("method-override");

const PORT = process.env.PORT || 3500;

// Connect to MongoDB
connectDB();

// built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

// built-in middleware for json
app.use(express.json());

//middleware for cookies
app.use(cookieParser());
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//serve static files
app.use("/", express.static(path.join(__dirname, "/public")));

// routes
app.use("/auth", authRoutes);
app.use("/", require("./routes/root"));
app.use("/post", require("./routes/postAuth"));
app.use("/refresh", refreshRoutes);
app.use("/logout", logOutRoutes);
app.use("/comment", require("./routes/commentAuth"));
app.use("/createNewPost", (req, res) => {
  res.render("createPost");
});
app.use("/signup", (req, res) => {
  res.render("signUpPage");
});

app.all("*", (req, res) => {
  res.status(404);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("txt").send("404 Not Found");
  }
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
