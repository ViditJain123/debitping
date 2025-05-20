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
      required: false,
    },
    metaMessageId: {
      type: String,
      required: false,
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent',
    },
    provider: {
      type: String,
      enum: ['twilio', 'meta'],
      default: 'twilio'
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Add validation to ensure either twilioMessageId or metaMessageId is provided
messageSchema.pre('validate', function(next) {
  if (!this.twilioMessageId && !this.metaMessageId) {
    this.invalidate('twilioMessageId', 'Either twilioMessageId or metaMessageId must be provided');
  }
  next();
});

// If the model is already defined, don't redefine it (important for Next.js hot reloading)
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
