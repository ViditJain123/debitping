import { Suspense } from 'react';
import DashboardLoadingIndicator from '../../../components/DashboardLoadingIndicator';

export const metadata = {
  title: 'WhatsApp Messaging - ZYVER',
  description: 'Send automated WhatsApp payment reminders via Twilio',
};

export default function WhatsAppLayout({ children }) {
  return (
    <Suspense fallback={<DashboardLoadingIndicator />}>
      {children}
    </Suspense>
  );
}
