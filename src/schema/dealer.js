import mongoose from 'mongoose';

const dealerSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    distributorClerkRef: {
      type: String,
      required: true,
      // References the clerkId in the User schema
    },
    lastMessageReceived: {
      type: String,
      default: '',
    },
    lastMessageReceivedAt: {
      type: Date,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// If the model is already defined, don't redefine it (important for Next.js hot reloading)
const Dealer = mongoose.models.Dealer || mongoose.model('Dealer', dealerSchema);

export default Dealer;
