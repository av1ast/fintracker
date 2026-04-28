import { CategorySummary, Recommendation, Transaction } from './types';

const GAMING_KEYWORDS = ['steam', 'playstation', 'xbox', 'nintendo', 'epic games', 'google play games',
  'twitch', 'humble', 'game', 'gaming'];

const DELIVERY_KEYWORDS = ['deliveroo', 'just eat', 'uber eats', 'doordash', 'bolt food'];

const SUBSCRIPTION_KEYWORDS = ['netflix', 'spotify', 'apple', 'amazon prime', 'disney', 'youtube premium',
  'sky', 'now tv', 'hbo', 'paramount', 'adobe', 'microsoft 365', 'icloud'];

function matchesKeywords(name: string, keywords: string[]): boolean {
  const lower = name.toLowerCase();
  return keywords.some(k => lower.includes(k));
}

export function generateRecommendations(
  categories: CategorySummary[],
  totalSpent: number,
  totalIncome: number,
  savingsRate: number,
  transactions: Transaction[],
): Recommendation[] {
  const recs: Recommendation[] = [];
  const catMap = new Map(categories.map(c => [c.category, c]));

  const expenses = transactions.filter(t => t.amount < 0);

  // --- Gaming / Entertainment ---
  const entertainment = catMap.get('entertainment');
  const games = catMap.get('games');
  const gamingTotal = (entertainment?.total ?? 0) + (games?.total ?? 0);

  // Also detect by merchant name
  const gamingByName = expenses
    .filter(t => matchesKeywords(t.name, GAMING_KEYWORDS))
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const effectiveGaming = Math.max(gamingTotal, gamingByName);
  if (effectiveGaming > 0 && totalSpent > 0) {
    const pct = (effectiveGaming / totalSpent) * 100;
    if (pct > 5) {
      recs.push({
        id: 'gaming',
        title: 'Gaming & Entertainment Spending',
        description: `You spend £${effectiveGaming.toFixed(2)} (${pct.toFixed(1)}% of budget) on gaming/entertainment. Try setting a monthly cap — waiting for Steam/PSN sales can save 50–80% on games.`,
        potential: effectiveGaming * 0.35,
        priority: pct > 15 ? 'high' : 'medium',
        category: 'entertainment',
        icon: '🎮',
      });
    }
  }

  // --- Food Delivery ---
  const deliverySpend = expenses
    .filter(t => matchesKeywords(t.name, DELIVERY_KEYWORDS))
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  if (deliverySpend > 30) {
    recs.push({
      id: 'delivery',
      title: 'Food Delivery Costs Add Up',
      description: `You've spent £${deliverySpend.toFixed(2)} on food delivery. Cooking in bulk (meal prep) 2–3 times a week could save around £${(deliverySpend * 0.6).toFixed(0)} per month.`,
      potential: deliverySpend * 0.6,
      priority: deliverySpend > 80 ? 'high' : 'medium',
      category: 'eating_out',
      icon: '🛵',
    });
  }

  // --- Eating out vs groceries ---
  const eatingOut = catMap.get('eating_out');
  const groceries = catMap.get('groceries');
  if (eatingOut && groceries && eatingOut.total > groceries.total * 1.5) {
    const potential = (eatingOut.total - groceries.total) * 0.4;
    recs.push({
      id: 'eating_out',
      title: 'Dining Out Outweighs Groceries',
      description: `You spend £${eatingOut.total.toFixed(2)} eating out vs £${groceries.total.toFixed(2)} on groceries. Swapping even 2 restaurant meals/week for home cooking could save £${potential.toFixed(0)}/month.`,
      potential,
      priority: 'high',
      category: 'eating_out',
      icon: '🍳',
    });
  }

  // --- Subscriptions ---
  const subSpend = expenses
    .filter(t => matchesKeywords(t.name, SUBSCRIPTION_KEYWORDS))
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const subTransactions = expenses.filter(t => matchesKeywords(t.name, SUBSCRIPTION_KEYWORDS));
  if (subTransactions.length > 0) {
    const uniqueSubs = Array.from(new Set(subTransactions.map(t => t.name.split(' ')[0])));
    recs.push({
      id: 'subscriptions',
      title: 'Review Your Subscriptions',
      description: `You have ${uniqueSubs.length} detected subscription(s) totalling £${subSpend.toFixed(2)}/month (${uniqueSubs.slice(0, 4).join(', ')}${uniqueSubs.length > 4 ? '…' : ''}). Cancel anything you use less than weekly.`,
      potential: subSpend * 0.25,
      priority: 'medium',
      icon: '📱',
    });
  }

  // --- Shopping ---
  const shopping = catMap.get('shopping');
  if (shopping && shopping.percentage > 20) {
    recs.push({
      id: 'shopping',
      title: 'Shopping is a Large Expense',
      description: `Shopping is ${shopping.percentage.toFixed(1)}% of your budget (£${shopping.total.toFixed(2)}). Apply the 48-hour rule: wait 2 days before any non-essential purchase. Impulse buys drop significantly.`,
      potential: shopping.total * 0.25,
      priority: shopping.percentage > 30 ? 'high' : 'medium',
      category: 'shopping',
      icon: '🛍️',
    });
  }

  // --- Low savings rate ---
  if (totalIncome > 0 && savingsRate < 20) {
    const needed = totalIncome * 0.2 - (totalIncome - totalSpent);
    recs.push({
      id: 'savings_rate',
      title: 'Savings Rate Below 20%',
      description: `Your savings rate is ${savingsRate.toFixed(1)}%. Aim for 20% (the "50/30/20" rule). You'd need to reduce spending by ~£${Math.max(0, needed).toFixed(0)}/month to reach this goal.`,
      potential: Math.max(0, needed),
      priority: savingsRate < 10 ? 'high' : 'medium',
      icon: '💰',
    });
  }

  // --- Transport ---
  const transport = catMap.get('transport');
  if (transport && transport.percentage > 15) {
    recs.push({
      id: 'transport',
      title: 'High Transport Costs',
      description: `Transport is ${transport.percentage.toFixed(1)}% of your spending (£${transport.total.toFixed(2)}). Consider monthly passes, cycling, or carpooling if applicable.`,
      potential: transport.total * 0.2,
      priority: 'low',
      category: 'transport',
      icon: '🚌',
    });
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
  return recs
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 6);
}
