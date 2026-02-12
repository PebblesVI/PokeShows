import { Metadata } from 'next';
import { BudgetPlanner } from '@/components/tools/budget-planner';

export const metadata: Metadata = {
  title: 'Show Budget Planner',
  description: 'Plan your Pokemon card show budget. Get suggested allocations for admission, cards, supplies, food, and grading.',
};

export default function BudgetPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-2">Show Budget Planner</h1>
      <p className="text-muted-foreground mb-10">
        Set your total budget and get suggested allocations for each spending category. Adjust the sliders to match your priorities.
      </p>
      <BudgetPlanner />
    </div>
  );
}
