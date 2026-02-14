'use client';

import { useState } from 'react';
import { Crown, Zap, TrendingUp, Shield, Clock, Star, Bell, BarChart3, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const BENEFITS = [
  { icon: Bell, title: 'Unlimited Price Alerts', description: 'Set as many price drop alerts as you want. Free tier is limited to 3.', color: 'text-yellow-500' },
  { icon: BarChart3, title: 'Daily Portfolio Digest', description: 'Get daily updates on your collection value changes. Free tier is weekly.', color: 'text-blue-500' },
  { icon: TrendingUp, title: '90-Day Price Charts', description: 'Access extended price history charts for any card.', color: 'text-green-500' },
  { icon: Crown, title: 'Pro Collector Badge', description: 'Stand out with a Pro badge on your collector profile.', color: 'text-purple-500' },
  { icon: Shield, title: 'Priority Trade Placement', description: 'Your trade binder cards appear first when others browse.', color: 'text-orange-500' },
  { icon: Clock, title: 'Early Deal Alerts', description: 'Get deal notifications 30 minutes before free users.', color: 'text-red-500' },
];

export function ProLandingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubscribe = async () => {
    const email = localStorage.getItem('pokeshows-email');
    if (!email) {
      const prompted = window.prompt('Enter your email to subscribe:');
      if (!prompted || !prompted.includes('@')) return;
      localStorage.setItem('pokeshows-email', prompted);
      return handleSubscribeWithEmail(prompted);
    }
    return handleSubscribeWithEmail(email);
  };

  const handleSubscribeWithEmail = async (email: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: 'pro_monthly' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.fallback) {
        setError('Online payments coming soon! Contact us to get started early.');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
          <Crown className="h-4 w-4" />
          PokeShows Pro
        </div>
        <h1 className="text-4xl font-bold mb-4">Level Up Your Collecting</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Get the most out of PokeShows with unlimited alerts, advanced analytics, and priority features.
        </p>
      </div>

      {/* Pricing */}
      <div className="max-w-sm mx-auto mb-12">
        <div className="rounded-2xl border-2 border-primary p-8 text-center">
          <Badge className="bg-primary text-primary-foreground rounded-full mb-4">Most Popular</Badge>
          <div className="mb-2">
            <span className="text-5xl font-bold">$4.99</span>
            <span className="text-muted-foreground text-lg">/month</span>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Cancel anytime. No contracts.</p>
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            size="lg"
            className="w-full rounded-full text-base gap-2"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'Processing...' : 'Subscribe to Pro'}
          </Button>
          {error && <p className="text-sm text-muted-foreground mt-3">{error}</p>}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">What You Get</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map(benefit => {
            const Icon = benefit.icon;
            return (
              <div key={benefit.title} className="rounded-xl border border-border p-5">
                <Icon className={`h-6 w-6 ${benefit.color} mb-3`} />
                <h3 className="font-semibold text-sm mb-1">{benefit.title}</h3>
                <p className="text-xs text-muted-foreground">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Comparison */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-center mb-8">Free vs Pro</h2>
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-4 font-medium">Feature</th>
                <th className="text-center p-4 font-medium">Free</th>
                <th className="text-center p-4 font-medium">
                  <span className="inline-flex items-center gap-1">
                    <Crown className="h-3.5 w-3.5 text-primary" /> Pro
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Price Alerts', '3 alerts', 'Unlimited'],
                ['Portfolio Digest', 'Weekly', 'Daily'],
                ['Price History Charts', '7 days', '90 days'],
                ['Collector Badge', '—', 'Pro Badge'],
                ['Trade Binder Placement', 'Standard', 'Priority'],
                ['Deal Alerts', 'Standard', '30 min early'],
                ['Collection Tracking', 'Unlimited', 'Unlimited'],
                ['Show Discovery', 'Full access', 'Full access'],
              ].map(([feature, free, pro]) => (
                <tr key={feature} className="border-b border-border last:border-0">
                  <td className="p-4 text-muted-foreground">{feature}</td>
                  <td className="p-4 text-center">{free}</td>
                  <td className="p-4 text-center font-medium text-primary">{pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h2 className="text-2xl font-bold text-center mb-8">Questions?</h2>
        <div className="space-y-4 max-w-2xl mx-auto">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes! Cancel your subscription at any time with no penalties or fees.' },
            { q: 'How do I pay?', a: 'We use Stripe for secure payments. Credit/debit cards accepted.' },
            { q: 'Will I lose my data if I cancel?', a: 'No. Your collection, wishlist, and all data stays. You just lose access to Pro features.' },
          ].map(faq => (
            <div key={faq.q} className="rounded-xl border border-border p-4">
              <h3 className="font-medium text-sm mb-1">{faq.q}</h3>
              <p className="text-xs text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
