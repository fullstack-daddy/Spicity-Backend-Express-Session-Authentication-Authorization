import express from "express";
import { PORT, MONGODB_URI } from "./config/index.js";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import session from "express-session";
import morgan from "morgan";
// configureation to use a custom server other than next js
import next from "next";
const nextApp = next({
    customServer: true,
    dev: true,
    port: PORT
})

//insert this inside the next.config.js file

// module.exports = {
//     useFileSystemPublicRoutes: false,
//   }

const server = express();

server.use(bodyParser.urlencoded({ extended: true }));
server.use(cookieParser());
server.use(
  session({
    key: "user_sid",
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      expires: 600000,
    },
  })
);

server.use((req, res, next) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/dashboard");
  }
  next();
});

var sessionChecker = (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.redirect("/dashboard");
  } else {
    next();
  }
};

server
