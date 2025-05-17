import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Dealer',
      required: true,
    },
    distributorClerkId: {
      type: String,
      required: true,
    },
    messageContent: {
      type: String,
      required: true,
    },
    twilioMessageId: {
      type: String,
      required: true,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// If the model is already defined, don't redefine it (important for Next.js hot reloading)
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
