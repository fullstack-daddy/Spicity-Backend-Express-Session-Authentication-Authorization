import User from "../models/User";
import bcrypt from "bcrypt";
import mongoose from 'mongoose';

export async function Register(req, res) {
    // get required variables from request body
    const { firstName, lastName, email, password } = req.body;
    try {
      // create an instance of a user
      const newUser = new User({
        firstName,
        lastName,
        email,
        password,
      });
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser)
        return res.status(400).json({
          status: "failed",
          data: [],
          message: "It seems you already have an account, please log in instead.",
        });
      const savedUser = await newUser.save(); // save new user into the database
      const { role, ...user_data } = savedUser;
      res.status(200).json({
        status: "success",
        data: [user_data],
        message:
          "Thank you for registering with us. Your account has been successfully created.",
      });
    } catch (err) {
      res.status(500).json({
        status: "error",
        code: 500,
        data: [],
        message: `${err.message}`,
      });
      res.session.user = docs
      res.redirect('/dashboard');
    }
    
    res.end();
  }