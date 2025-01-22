import { config } from "dotenv";
import { connectDB } from "../lib/db.js";
import User from "../models/user.model.js";

config();

const seedUsers = [
  {
    email: "ijaz@gmail.com",
    fullName: "Ijaz Misba",
    password: "A1234567890",
    profilePic: "",
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await User.insertMany(seedUsers);
    // console.log("Database seeded successfully");
  } catch (error) {
    // console.error("Error seeding database:", error);
  }
};

// Call the function, backend> node src/seeds/user.seeds.js
seedDatabase();