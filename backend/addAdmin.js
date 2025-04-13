require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

const updateAdminPassword = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = "admin@slsba.com"; // Ensure this matches Postman input
    const plainPassword = "Sathu2540"; // This must be the password you will use in Postman

    // ✅ Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    console.log("🔹 New Hash:", hashedPassword); // Print the new hash for debugging

    // ✅ Update the admin password if the email exists
    const updatedAdmin = await Admin.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (updatedAdmin) {
      console.log("✅ Admin password updated successfully.");
    } else {
      console.log("❌ Admin not found! Creating new admin...");
      const newAdmin = new Admin({ email, password: hashedPassword });
      await newAdmin.save();
      console.log("✅ New admin added successfully.");
    }

    mongoose.connection.close();
  } catch (error) {
    console.error("❌ Error updating admin:", error);
    mongoose.connection.close();
  }
};

updateAdminPassword();
