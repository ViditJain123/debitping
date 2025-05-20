This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## User Authentication & Database Integration

This project uses [Clerk](https://clerk.dev) for user authentication integrated with MongoDB for data persistence:

1. **Authentication**: Clerk handles user sign-up, sign-in, and session management.

2. **MongoDB Integration**: When users sign in or sign up, their information is automatically stored in MongoDB.

3. **Database Schema**: User information is stored with the following schema:
   - clerkId: Unique identifier from Clerk
   - email: User's email address
   - firstName: User's first name
   - lastName: User's last name (optional)
   - profileImageUrl: URL to the user's profile image (optional)
   - lastSignIn: Timestamp of the last sign-in
   - timestamps: Created and updated timestamps

4. **Environment Setup**: Create a `.env.local` file with the following:
   ```
   # MongoDB Connection
   MONGODB_URI=your_mongodb_connection_string
   
   # Clerk Authentication (existing variables)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Clerk Webhook (optional, for sync)
   CLERK_WEBHOOK_SECRET=your_webhook_secret
   
   # Twilio WhatsApp Integration
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_WHATSAPP_NUMBER=your_twilio_whatsapp_number
   ```

5. **Webhooks**: The application includes webhook handlers to keep the database in sync with Clerk user events (created, updated, deleted).

## WhatsApp Integration with Twilio

This application uses Twilio's WhatsApp API for sending automated payment reminders:

1. **Setup Twilio Account**: 
   - Create a Twilio account at [twilio.com](https://www.twilio.com)
   - Enable WhatsApp in your Twilio console
   - Obtain your Account SID, Auth Token, and WhatsApp-enabled phone number

2. **Environment Variables**:
   Add your Twilio credentials to `.env.local`:
   ```
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_WHATSAPP_NUMBER=your_whatsapp_number
   ```

3. **Testing WhatsApp Messages**:
   - In development/sandbox mode, recipients must join your Twilio sandbox
   - Follow the instructions in the Twilio console to have recipients send a specific code to your Twilio number

4. **Production Usage**:
   - Apply for production access through Twilio
   - Follow Twilio's requirements for business verification and WhatsApp Business API approval

5. **Message Templates**:
   - For production, pre-approved message templates are required
   - Follow WhatsApp's guidelines for message template approval

6. **Debugging**:
   - Use the Twilio console to monitor message status and delivery reports
   - Check the dashboard logs for any errors in message delivery

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
