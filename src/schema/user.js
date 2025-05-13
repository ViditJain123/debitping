import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    profileImageUrl: {
      type: String,
    },
    lastSignIn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// If the model is already defined, don't redefine it (important for Next.js hot reloading)
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;