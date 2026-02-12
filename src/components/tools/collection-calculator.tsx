'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { buildEbaySearchUrl } from '@/lib/ebay';
import {
  Plus,
  Trash2,
  DollarSign,
  TrendingUp,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  CreditCard,
} from 'lucide-react';
import Link from 'next/link';

interface CollectionCard {
  id: string;
  name: string;
  value: number;
}

export function CollectionCalculator() {
  const [cards, setCards] = useState<CollectionCard[]>([]);
  const [newName, setNewName] = useState('');
  const [newValue, setNewValue] = useState('');
  const [showForm, setShowForm] = useState(false);

  function addCard() {
    const name = newName.trim();
    const value = parseFloat(newValue);

    if (!name || isNaN(value) || value < 0) return;

    setCards((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, name, value },
    ]);
    setNewName('');
    setNewValue('');
    setShowForm(false);
  }

  function removeCard(id: string) {
    setCards((prev) => prev.filter((c) => c.id !== id));
  }

  const totalValue = cards.reduce((sum, c) => sum + c.value, 0);
  const averageValue = cards.length > 0 ? totalValue / cards.length : 0;
  const highestCard = cards.length > 0
    ? cards.reduce((max, c) => (c.value > max.value ? c : max), cards[0])
    : null;

  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h2 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Collection Summary
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Total Value</p>
            <p className="text-xl font-bold">${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Cards</p>
            <p className="text-xl font-bold">{cards.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Average Value</p>
            <p className="text-xl font-bold">${averageValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Highest Card</p>
            <p className="text-lg font-bold truncate">
              {highestCard ? `$${highestCard.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--'}
            </p>
            {highestCard && (
              <p className="text-xs text-muted-foreground truncate">{highestCard.name}</p>
            )}
          </div>
        </div>
      </div>

      {/* Card List */}
      {cards.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Your Cards</h3>
          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center justify-between rounded-lg border border-border p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{card.name}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm font-semibold">
                  ${card.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button
                  onClick={() => removeCard(card.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors"
                  aria-label={`Remove ${card.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Card Form */}
      {showForm ? (
        <div className="rounded-xl border border-border p-4 space-y-3">
          <h3 className="text-sm font-medium">Add a Card</h3>
          <div>
            <label htmlFor="card-name" className="block text-xs text-muted-foreground mb-1">Card Name</label>
            <Input
              id="card-name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Charizard Base Set Holo"
              onKeyDown={(e) => e.key === 'Enter' && addCard()}
            />
          </div>
          <div>
            <label htmlFor="card-value" className="block text-xs text-muted-foreground mb-1">Estimated Value ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                id="card-value"
                type="number"
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="pl-8"
                onKeyDown={(e) => e.key === 'Enter' && addCard()}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={addCard} size="sm">
              <Plus className="h-4 w-4" />
              Add Card
            </Button>
            <Button onClick={() => setShowForm(false)} variant="outline" size="sm">
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button onClick={() => setShowForm(true)} variant="outline" className="w-full">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      )}

      {/* CTA Section */}
      <div className="space-y-3 pt-4">
        <h3 className="text-sm font-medium">What&apos;s Next?</h3>
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href={buildEbaySearchUrl({ searchQuery: 'pokemon card storage protection', customId: 'collection-protect' })}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <ShieldCheck className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium mb-1">Protect Your Collection</h4>
            <p className="text-xs text-muted-foreground">
              Browse card storage and protection supplies on eBay.
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
              Shop Now <ExternalLink className="h-3 w-3" />
            </span>
          </a>

          <a
            href={buildEbaySearchUrl({ searchQuery: 'sell pokemon card collection', customId: 'collection-sell' })}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <CreditCard className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium mb-1">Sell on eBay</h4>
            <p className="text-xs text-muted-foreground">
              List your cards and reach millions of collectors worldwide.
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
              Start Selling <ExternalLink className="h-3 w-3" />
            </span>
          </a>

          <Link
            href="/buy"
            className="rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-primary mb-2" />
            <h4 className="text-sm font-medium mb-1">Browse Cards to Add</h4>
            <p className="text-xs text-muted-foreground">
              Find great deals on cards to grow your collection.
            </p>
            <span className="inline-flex items-center gap-1 mt-2 text-xs text-primary">
              Browse Cards
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
