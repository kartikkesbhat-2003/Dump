import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Privacy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground">
          Last updated: October 1, 2025
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <div className="space-y-3 text-sm">
              <h3 className="font-medium">Personal Information</h3>
              <p className="text-muted-foreground">
                When you create an account, we collect your email address and any profile information you choose to provide.
              </p>
              
              <h3 className="font-medium">Content and Posts</h3>
              <p className="text-muted-foreground">
                We store the posts, comments, and other content you share on our platform. You can choose to post anonymously.
              </p>
              
              <h3 className="font-medium">Usage Data</h3>
              <p className="text-muted-foreground">
                We collect information about how you use our service, including pages visited, features used, and interaction data.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• To provide and maintain our service</li>
              <li>• To authenticate your account and prevent unauthorized access</li>
              <li>• To enable you to create and share content</li>
              <li>• To improve our platform and user experience</li>
              <li>• To communicate with you about service updates</li>
              <li>• To enforce our Terms of Service and community guidelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
              </p>
              <ul className="space-y-1 ml-4">
                <li>• With your explicit consent</li>
                <li>• To comply with legal obligations</li>
                <li>• To protect our rights and the safety of our users</li>
                <li>• In the event of a business transfer or merger</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="text-sm text-muted-foreground">
              We implement appropriate security measures to protect your personal information against unauthorized access, 
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>You have the right to:</p>
              <ul className="space-y-1 ml-4">
                <li>• Access your personal data</li>
                <li>• Correct inaccurate personal data</li>
                <li>• Delete your account and associated data</li>
                <li>• Export your data</li>
                <li>• Withdraw consent where applicable</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
            <p className="text-sm text-muted-foreground">
              We use cookies and similar technologies to enhance your experience, remember your preferences, 
              and analyze how our service is used. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Anonymous Posts</h2>
            <p className="text-sm text-muted-foreground">
              When you choose to post anonymously, we do not associate your identity with that content publicly. 
              However, we may retain internal records for moderation and security purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
            <p className="text-sm text-muted-foreground">
              We may update this Privacy Policy from time to time. We will notify you of any significant changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p className="text-sm text-muted-foreground">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-2 text-sm">
              <p>Email: privacy@yourapp.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};