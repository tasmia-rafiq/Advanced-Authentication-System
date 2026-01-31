import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength: 3,
      maxLength: 20,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minLength: 8,
    },
    // isEmailVerified: {
    //   type: Boolean,
    //   default: false,
    // },
    // emailVerificationToken: String,
    // emailVerificationExpires: Date,

    // resetPasswordToken: String,
    // resetPasswordExpires: Date,

    refreshToken: String,
    
    role: {
      type: String,
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// bcrypt password before saving to database by hashing
userSchema.pre("save", async function (next) {
  console.log("Saving document:", this.email);
  if (this.isModified("password")) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
      console.log("bcrypt error: ", error);
    }
  }
});

// compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model("User", userSchema);
