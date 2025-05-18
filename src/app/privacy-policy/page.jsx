"use client";

import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

export default function PrivacyPolicy() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">Last Updated: May 18, 2025</p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="mb-4">
              Welcome to ZYVER ("we," "our," or "us"). We respect your privacy and are committed to protecting your personal information. 
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WhatsApp automation 
              service and website (collectively, the "Service").
            </p>
            <p className="mb-4">
              Please read this Privacy Policy carefully. By accessing or using our Service, you acknowledge that you have read, understood, 
              and agree to be bound by this Privacy Policy. If you do not agree with our policies, please do not access or use our Service.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Information We Collect</h2>
            <p className="mb-4">We may collect several types of information from and about users of our Service, including:</p>
            
            <h3 className="text-xl font-medium mb-2">2.1 Personal Information</h3>
            <p className="mb-4">
              Personal information that identifies you, such as your name, email address, phone number, 
              company information, payment details, and any other information you provide when you register for or use our Service.
            </p>
            
            <h3 className="text-xl font-medium mb-2">2.2 Communication Data</h3>
            <p className="mb-4">
              When using our WhatsApp automation services, we process message content, recipient information, 
              delivery status, and other metadata related to your communications. This is necessary to provide our Service.
            </p>
            
            <h3 className="text-xl font-medium mb-2">2.3 Technical Data</h3>
            <p className="mb-4">
              Information about your device, browser, IP address, time zone, and other technical details when you access our Service.
            </p>
            
            <h3 className="text-xl font-medium mb-2">2.4 Usage Data</h3>
            <p className="mb-4">
              Information about how you use our Service, including features accessed, time spent, actions taken, and other interaction data.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. How We Use Your Information</h2>
            <p className="mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Provide, maintain, and improve our Service</li>
              <li>Process and complete transactions</li>
              <li>Send WhatsApp messages on your behalf</li>
              <li>Respond to your inquiries and provide customer support</li>
              <li>Send administrative information, such as updates, security alerts, and support messages</li>
              <li>Understand how users interact with our Service to improve functionality</li>
              <li>Personalize your experience and deliver content relevant to your interests</li>
              <li>Prevent fraud and enhance the security of our Service</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Information Sharing and Disclosure</h2>
            <p className="mb-4">We may share your information with:</p>
            
            <h3 className="text-xl font-medium mb-2">4.1 Service Providers</h3>
            <p className="mb-4">
              Third-party vendors who perform services on our behalf, such as payment processing, 
              messaging services (including Twilio), data analysis, email delivery, and hosting services.
            </p>
            
            <h3 className="text-xl font-medium mb-2">4.2 Business Transfers</h3>
            <p className="mb-4">
              If we are involved in a merger, acquisition, or sale of all or a portion of our assets, 
              your information may be transferred as part of that transaction.
            </p>
            
            <h3 className="text-xl font-medium mb-2">4.3 Legal Requirements</h3>
            <p className="mb-4">
              If required by law, court order, or governmental authority, we may disclose your information.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="mb-4">
              We implement appropriate technical and organizational measures to protect your personal information 
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
              over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="mb-4">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>Access and receive a copy of your personal information</li>
              <li>Rectify inaccurate personal information</li>
              <li>Request deletion of your personal information</li>
              <li>Restrict or object to processing of your personal information</li>
              <li>Data portability</li>
              <li>Withdraw consent at any time where processing is based on consent</li>
            </ul>
            <p className="mb-4">
              To exercise these rights, please contact us at <a href="mailto:privacy@zyver.com" className="text-primary hover:underline">privacy@zyver.com</a>.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Third-Party Services</h2>
            <p className="mb-4">
              Our Service may contain links to third-party websites or services that are not owned or controlled by us. 
              This Privacy Policy does not apply to those third-party services, and we are not responsible for their privacy practices. 
              We encourage you to review the privacy policies of any third-party services you access.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
            <p className="mb-4">
              Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information 
              from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, 
              please contact us, and we will take steps to delete such information.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Changes to This Privacy Policy</h2>
            <p className="mb-4">
              We may update this Privacy Policy from time to time. The updated version will be indicated by an updated "Last Updated" date, 
              and the updated version will be effective as soon as it is accessible. We encourage you to review this Privacy Policy frequently 
              to stay informed about how we are protecting your information.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">10. Contact Us</h2>
            <p className="mb-4">
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us at:
            </p>
            <p className="mb-4">
              <strong>Email:</strong> <a href="mailto:privacy@zyver.com" className="text-primary hover:underline">privacy@zyver.com</a>
            </p>
            <p className="mb-4">
              <strong>Address:</strong> Mumbai, India
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
