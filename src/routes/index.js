import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import session from "express-session";
// import { renderToString } from "react-dom/server";
// import { getSession } from "next-auth/react";
// import { readFileSync } from "fs";
// import path from "path";

const app = express();

app.disable("x-powered-by");

// Define a middleware to check session
// const sessionChecker = async (req, res, next) => {
//   const session = await getSession({ req });

//   // If user is not logged in (not authenticated), redirect to login page
//   if (!session) {
//     res.redirect("/login");
//     return;
//   }

//   next();
// };

const sessionChecker = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect("/login");
  }
};

// app.get("/", sessionChecker, (req, res) => {
//   try {
//     res.send("homepage");
//     res.redirect("/login");
//   } catch (error) {
//     console.log(error);
//   }
// });
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/dashboard");
  } else {
    res.redirect("/login");
  }
});
// Serve static files like images, CSS, etc.
// app.use(express.static(path.join(__dirname, "public")));

// app
// .route("/login")
// .get("/login", sessionChecker, (req, res) => {
//   // const filePath = path.resolve(__dirname, "login.jsx");
//   // const fileContent = readFileSync(filePath, "utf8");
//   // const html = renderToString(fileContent);
//   // res.send(html);
// })
app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if user exists
    // Check if user exists
    const existingUser = await User.findOne({ username });

    if (existingUser) {
      // Ensure that existingUser.password is not undefined or null
      if (
        existingUser.password !== undefined &&
        existingUser.password !== null
      ) {
        // Compare the provided password with the hashed password
        const passwordMatch = bcrypt.compare(
          password,
          existingUser.password
        );

        if (passwordMatch) {
          // Authentication successful
          req.session.user = existingUser;
          res.json("successfully authenticated");
        } else {
          // Incorrect password
          res.status(401).json({ error: "Incorrect password" });
        }
      } else {
        // Missing or empty hashed password
        console.error(
          "Missing or empty hashed password:",
          existingUser.password
        );
        res.status(500).json({ error: "Invalid hashed password" });
      }
    } else {
      // User not found
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// // create an instance of a user
// const newUser = new User({
//   firstName,
//   lastName,
//   email,
//   password,
// });

// try {
//   // save the user
//   await newUser.save();
//   res.status(200).send("User created successfully");
// } catch (err) {
//   res.status(400).send(err);
// }

// app
// .route("/signup")
// .get(sessionChecker, (req, res) => {
// const filePath = path.resolve(__dirname, "signup.jsx");
// const fileContent = readFileSync(filePath, "utf8");
// const html = renderToString(fileContent);
// res.send(html);
// res.send("Hello, world!");
// })
app.post("/signup", async (req, res) => {
  const { firstName, lastName, email, username, password } = req.body;

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Check if password is provided
    if (password === undefined) {
      return res.status(400).json({ error: "Password is required" });
    }

    // Convert password to string if it's not already a string
    const passwordString =
      typeof password === "string" ? password : password.toString();

    // Hash the password
    const saltRounds = parseInt(process.env.SALT_ROUNDS, 10) || 10;
    const hashedPassword = await bcrypt.hash(passwordString, saltRounds);

    // Create a new user instance
    const newUser = new User({
      firstName,
      lastName,
      email,
      username,
      password: hashedPassword,
    });

    // Save the new user
    await newUser.save();
    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
//route for user dashboard
app.get("/dashboard", (req, res) => {
  if (req.session.user && req.cookies.user_sid) {
    res.sendFile(__dirname + "/dashboard");
  } else {
    res.redirect("/login");
  }
});

export default app;
