import { CategoryConfig } from './types';

export const CATEGORY_CONFIG: Record<string, CategoryConfig> = {
  eating_out:    { displayName: 'Eating Out',    color: '#f59e0b', emoji: '🍽️' },
  groceries:     { displayName: 'Groceries',     color: '#10b981', emoji: '🛒' },
  shopping:      { displayName: 'Shopping',      color: '#8b5cf6', emoji: '🛍️' },
  entertainment: { displayName: 'Entertainment', color: '#3b82f6', emoji: '🎮' },
  transport:     { displayName: 'Transport',     color: '#06b6d4', emoji: '🚗' },
  bills:         { displayName: 'Bills',         color: '#ef4444', emoji: '📄' },
  personal_care: { displayName: 'Personal Care', color: '#ec4899', emoji: '💆' },
  health:        { displayName: 'Health',        color: '#14b8a6', emoji: '🏥' },
  holidays:      { displayName: 'Holidays',      color: '#f97316', emoji: '✈️' },
  general:       { displayName: 'General',       color: '#6b7280', emoji: '📦' },
  transfers:     { displayName: 'Transfers',     color: '#a78bfa', emoji: '💸' },
  pot_transfer:  { displayName: 'Savings Pot',   color: '#34d399', emoji: '🏦' },
  income:        { displayName: 'Income',        color: '#10b981', emoji: '💰' },
  savings:       { displayName: 'Savings',       color: '#34d399', emoji: '💰' },
  family:        { displayName: 'Family',        color: '#fb7185', emoji: '👨‍👩‍👧' },
  finance:       { displayName: 'Finance',       color: '#7c3aed', emoji: '💳' },
  cash:          { displayName: 'Cash',          color: '#9ca3af', emoji: '💵' },
  charity:       { displayName: 'Charity',       color: '#f43f5e', emoji: '❤️' },
  games:         { displayName: 'Games',         color: '#3b82f6', emoji: '🎮' },
  subscriptions: { displayName: 'Subscriptions', color: '#0ea5e9', emoji: '📱' },
};

export function getCategoryConfig(category: string): CategoryConfig {
  const key = category.toLowerCase().replace(/\s+/g, '_');
  return CATEGORY_CONFIG[key] ?? {
    displayName: category
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' '),
    color: '#6b7280',
    emoji: '📦',
  };
}

// Categories excluded from spending totals (not actual expenses)
export const INCOME_CATEGORIES = new Set(['income', 'transfers', 'pot_transfer', 'savings']);

// High-spend alert thresholds (as % of total spending)
export const ALERT_THRESHOLDS: Record<string, number> = {
  entertainment: 10,
  games: 10,
  shopping: 20,
  eating_out: 25,
};
