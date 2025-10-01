import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const Terms: React.FC = () => {
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground">
          Last updated: October 1, 2025
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-slate max-w-none dark:prose-invert">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="text-sm text-muted-foreground">
              By accessing and using our platform, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to these terms, you may not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="text-sm text-muted-foreground">
              Our platform is a social sharing service that allows users to create posts, share content, 
              comment on posts, and interact with other users. Users can choose to post publicly or anonymously.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <h3 className="font-medium text-foreground">Account Registration</h3>
              <p>You must provide accurate and complete information when creating an account.</p>
              
              <h3 className="font-medium text-foreground">Account Security</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials.</p>
              
              <h3 className="font-medium text-foreground">Account Responsibility</h3>
              <p>You are responsible for all activities that occur under your account.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Content Guidelines</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <h3 className="font-medium text-foreground">Acceptable Use</h3>
              <ul className="space-y-1 ml-4">
                <li>• Share respectful and constructive content</li>
                <li>• Respect other users' privacy and rights</li>
                <li>• Use the platform for its intended purpose</li>
                <li>• Follow community guidelines and etiquette</li>
              </ul>
              
              <h3 className="font-medium text-foreground">Prohibited Content</h3>
              <p>You may not post content that:</p>
              <ul className="space-y-1 ml-4">
                <li>• Is illegal, harmful, or violates any laws</li>
                <li>• Contains hate speech, harassment, or bullying</li>
                <li>• Infringes on intellectual property rights</li>
                <li>• Contains spam, malware, or malicious links</li>
                <li>• Is sexually explicit or inappropriate</li>
                <li>• Promotes violence or dangerous activities</li>
                <li>• Violates others' privacy or personal information</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Content Ownership and License</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                You retain ownership of the content you post. However, by posting content on our platform, 
                you grant us a non-exclusive, worldwide license to use, display, and distribute your content 
                as part of the service.
              </p>
              <p>
                We reserve the right to remove content that violates these terms or our community guidelines.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Privacy and Data</h2>
            <p className="text-sm text-muted-foreground">
              Your privacy is important to us. Please review our Privacy Policy to understand how we collect, 
              use, and protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Moderation and Enforcement</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>We reserve the right to:</p>
              <ul className="space-y-1 ml-4">
                <li>• Monitor and moderate content</li>
                <li>• Remove content that violates these terms</li>
                <li>• Suspend or terminate user accounts</li>
                <li>• Report illegal activities to authorities</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Voting and Interactions</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>Our platform includes voting features (upvotes/downvotes) and commenting systems:</p>
              <ul className="space-y-1 ml-4">
                <li>• Use voting features responsibly and fairly</li>
                <li>• Do not manipulate voting systems</li>
                <li>• Respect others' opinions and content</li>
                <li>• Report inappropriate content rather than engaging negatively</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Disclaimer of Warranties</h2>
            <p className="text-sm text-muted-foreground">
              Our service is provided "as is" without any warranties. We do not guarantee that the service 
              will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Limitation of Liability</h2>
            <p className="text-sm text-muted-foreground">
              We shall not be liable for any indirect, incidental, special, consequential, or punitive damages 
              resulting from your use of the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Termination</h2>
            <div className="space-y-3 text-sm text-muted-foreground">
              <p>
                Either party may terminate this agreement at any time. We may suspend or terminate your 
                account if you violate these terms.
              </p>
              <p>
                Upon termination, your right to use the service ceases immediately.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Changes to Terms</h2>
            <p className="text-sm text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify users of significant 
              changes and continued use constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
            <p className="text-sm text-muted-foreground">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-2 text-sm">
              <p>Email: legal@yourapp.com</p>
              <p>Address: [Your Company Address]</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};