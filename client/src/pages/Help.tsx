import React, { useState } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Mail, MessageCircle, HelpCircle, User, Lock, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const Help: React.FC = () => {
  const navigate = useNavigate();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      category: "Getting Started",
      question: "How do I create an account?",
      answer: "Click the 'Sign Up' button on the homepage and provide your email address. You'll receive a verification email to complete the registration process."
    },
    {
      category: "Getting Started",
      question: "How do I reset my password?",
      answer: "On the login page, click 'Forgot Password' and enter your email. We'll send you a link to reset your password."
    },
    {
      category: "Posts and Content",
      question: "How do I create a post?",
      answer: "Click the 'What's your dump today?' box on the feed page or use the floating '+' button on mobile. Add your title, content, and optionally an image."
    },
    {
      category: "Posts and Content",
      question: "Can I post anonymously?",
      answer: "Yes! When creating a post or comment, check the 'Post anonymously' option. Your username won't be shown, but the content will still be visible."
    },
    {
      category: "Posts and Content",
      question: "How do I edit or delete my posts?",
      answer: "Currently, posts cannot be edited after publication. You can delete your posts by clicking the menu (⋯) button on your post and selecting 'Delete'."
    },
    {
      category: "Voting and Interactions",
      question: "How does the voting system work?",
      answer: "You can upvote (👍) or downvote (👎) posts and comments. This helps highlight quality content and gives feedback to authors."
    },
    {
      category: "Voting and Interactions",
      question: "Can I see who voted on my posts?",
      answer: "No, voting is anonymous. You can only see the total number of upvotes and downvotes."
    },
    {
      category: "Privacy and Safety",
      question: "How is my data protected?",
      answer: "We use industry-standard security measures to protect your data. Read our Privacy Policy for detailed information about data collection and usage."
    },
    {
      category: "Privacy and Safety",
      question: "How do I report inappropriate content?",
      answer: "Click the menu (⋯) button on any post or comment and select 'Report'. Our moderation team will review the content."
    },
    {
      category: "Account Management",
      question: "How do I delete my account?",
      answer: "Go to your Profile settings and scroll to the bottom. Click 'Delete Account' and follow the confirmation steps. This action is permanent."
    },
    {
      category: "Account Management",
      question: "Can I change my email address?",
      answer: "Yes, you can update your email in the Profile settings. You'll need to verify the new email address."
    }
  ];

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Help Center</h1>
        <p className="text-muted-foreground">
          Find answers to common questions and get support
        </p>
      </div>

      {/* Quick Help Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <User className="h-8 w-8 mx-auto mb-2 text-primary" />
          <h3 className="font-semibold mb-1">Getting Started</h3>
          <p className="text-sm text-muted-foreground">Learn the basics of using our platform</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <MessageCircle className="h-8 w-8 mx-auto mb-2 text-primary" />
          <h3 className="font-semibold mb-1">Posts & Comments</h3>
          <p className="text-sm text-muted-foreground">How to create and interact with content</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <Lock className="h-8 w-8 mx-auto mb-2 text-primary" />
          <h3 className="font-semibold mb-1">Privacy & Safety</h3>
          <p className="text-sm text-muted-foreground">Keep your account and data secure</p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-card border border-border rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <HelpCircle className="h-6 w-6" />
          Frequently Asked Questions
        </h2>

        {categories.map((category) => (
          <div key={category} className="mb-6">
            <h3 className="text-lg font-medium mb-3 text-primary">{category}</h3>
            <div className="space-y-2">
              {faqs
                .filter(faq => faq.category === category)
                .map((faq) => {
                  const globalIndex = faqs.indexOf(faq);
                  return (
                    <div key={globalIndex} className="border border-border rounded-lg">
                      <button
                        onClick={() => toggleFAQ(globalIndex)}
                        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-muted/50 transition-colors"
                      >
                        <span className="font-medium">{faq.question}</span>
                        {openFAQ === globalIndex ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {openFAQ === globalIndex && (
                        <div className="px-4 pb-3 text-sm text-muted-foreground border-t border-border bg-muted/20">
                          <p className="pt-3">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>

      {/* Contact Support */}
      <div className="bg-card border border-border rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Still Need Help?</h2>
        <p className="text-muted-foreground mb-4">
          Can't find what you're looking for? Get in touch with our support team.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Email Support</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Get help via email. We typically respond within 24 hours.
            </p>
            <Button variant="outline" className="w-full">
              Contact Support
            </Button>
          </div>
          
          <div className="border border-border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-5 w-5 text-primary" />
              <h3 className="font-medium">Documentation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Detailed guides and documentation for advanced users.
            </p>
            <Button variant="outline" className="w-full">
              View Docs
            </Button>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="font-medium mb-2">Contact Information</h3>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Email: support@yourapp.com</p>
            <p>Response time: Within 24 hours</p>
            <p>Available: Monday - Friday, 9 AM - 6 PM EST</p>
          </div>
        </div>
      </div>

      {/* Additional Resources */}
      <div className="mt-8 text-center">
        <h3 className="font-medium mb-3">Additional Resources</h3>
        <div className="flex justify-center gap-4 flex-wrap">
          <Button variant="link" onClick={() => navigate('/privacy')}>
            Privacy Policy
          </Button>
          <Button variant="link" onClick={() => navigate('/terms')}>
            Terms of Service
          </Button>
          <Button variant="link">
            Community Guidelines
          </Button>
          <Button variant="link">
            API Documentation
          </Button>
        </div>
      </div>
    </div>
  );
};