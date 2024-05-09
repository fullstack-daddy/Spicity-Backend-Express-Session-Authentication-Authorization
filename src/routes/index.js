import express from "express";
import { renderToString } from "react-dom/server";
import { getSession } from 'next-auth/react';
import { readFileSync } from "fs";
import path from "path";

const app = express();

app.disable("x-powered-by");

// Define a middleware to check session
const sessionChecker = async (req, res, next) => {
  const session = await getSession({ req });

  // If user is not logged in (not authenticated), redirect to login page
  if (!session) {
    res.redirect('/login');
    return;
  }

  next();
};

app.get("/", sessionChecker, (req, res) => {
  res.redirect("/login");
});

// Serve static files like images, CSS, etc.
app.use(express.static(path.join(__dirname, 'public')));

app.route("/login").get(sessionChecker, (req, res) => {
  const filePath = path.resolve(__dirname, "login.jsx");
  const fileContent = readFileSync(filePath, "utf8");
  const html = renderToString(fileContent);
  res.send(html);
});

app.route("/signup").get(sessionChecker, (req, res) => {
  const filePath = path.resolve(__dirname, "signup.jsx");
  const fileContent = readFileSync(filePath, "utf8");
  const html = renderToString(fileContent);
  res.send(html);
});

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });
