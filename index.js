const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
dotenv.config();

const snippetRoutes = require("./routers/snippetRouter");
const userRoutes = require("./routers/userRouter");
app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://code-snippet-client.herokuapp.com",
      "https://code-snippet-manager.netlify.app/",
    ],
    credentials: true,
  })
);
app.use(cookieParser());

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Welcome to the app snippet with port : ${PORT} `)
);

//Routers
app.use("/auth", userRoutes);
app.use("/snippets", snippetRoutes);

// Connect to the database
mongoose.connect(
  process.env.MDB_CONNECT_STRING,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Connected to the database");
    }
  }
);
