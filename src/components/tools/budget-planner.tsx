'use client';

import { useState } from 'react';
import Link from 'next/link';
import { DollarSign, ExternalLink, ShoppingBag } from 'lucide-react';
import { buildEbaySearchUrl } from '@/lib/ebay';

const CATEGORIES = [
  { name: 'Admission', percent: 5, description: 'Entry fees for shows', query: '', shopUrl: '' },
  { name: 'Cards & Singles', percent: 45, description: 'Individual cards and sealed product', query: 'pokemon card single rare', shopUrl: '/buy/category/singles' },
  { name: 'Sealed Product', percent: 25, description: 'Booster boxes, ETBs, tins', query: 'pokemon booster box sealed', shopUrl: '/buy/category/booster-boxes' },
  { name: 'Supplies', percent: 10, description: 'Sleeves, top loaders, PSA cases', query: 'pokemon card sleeves top loaders PSA case', shopUrl: '/buy/category/accessories' },
  { name: 'Food & Drinks', percent: 10, description: 'Meals and snacks at the event', query: '', shopUrl: '' },
  { name: 'Grading', percent: 5, description: 'PSA/CGC/BGS submission fees', query: 'PSA grading submission pokemon', shopUrl: '/buy/category/graded-cards' },
];

export function BudgetPlanner() {
  const [budget, setBudget] = useState('200');
  const [allocations, setAllocations] = useState(CATEGORIES.map(c => c.percent));

  const totalBudget = parseFloat(budget) || 0;
  const totalPercent = allocations.reduce((s, a) => s + a, 0);

  const updateAllocation = (index: number, value: number) => {
    const next = [...allocations];
    next[index] = Math.max(0, Math.min(100, value));
    setAllocations(next);
  };

  return (
    <div className="space-y-8">
      {/* Budget input */}
      <div>
        <label className="text-sm font-medium mb-2 block">Total Budget</label>
        <div className="relative max-w-xs">
          <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            min="0"
            step="10"
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-border bg-background text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {/* Allocation breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Suggested Allocation</h2>
          {totalPercent !== 100 && (
            <span className="text-xs text-red-500">Total: {totalPercent}% (should be 100%)</span>
          )}
        </div>

        {CATEGORIES.map((category, i) => {
          const amount = (totalBudget * allocations[i]) / 100;
          return (
            <div key={category.name} className="rounded-lg border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-medium">{category.name}</h3>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <span className="text-lg font-bold">${amount.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={allocations[i]}
                  onChange={(e) => updateAllocation(i, parseInt(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-sm text-muted-foreground w-10 text-right">{allocations[i]}%</span>
              </div>
              {(category.query || category.shopUrl) && (
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  {category.query && (
                    <a
                      href={buildEbaySearchUrl({ searchQuery: category.query, customId: 'budget-planner' })}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      Shop {category.name} on eBay <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {category.shopUrl && (
                    <Link
                      href={category.shopUrl}
                      className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                    >
                      <ShoppingBag className="h-3 w-3" />
                      Browse {category.name}
                    </Link>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
        <h3 className="font-semibold mb-3">Budget Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map((category, i) => (
            <div key={category.name}>
              <p className="text-xs text-muted-foreground">{category.name}</p>
              <p className="font-semibold">${((totalBudget * allocations[i]) / 100).toFixed(0)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3 border-t border-primary/10 flex justify-between">
          <span className="font-medium">Total</span>
          <span className="font-bold text-lg">${totalBudget.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
}
