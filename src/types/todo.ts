export type Priority = 'low' | 'medium' | 'high';

export type Category = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: Date;
  dueDate?: Date;
  priority: Priority;
  tags: string[];
  categoryId?: string;
  reminder?: Date;
  isRecurring?: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly';
  order: number;
};

export type FilterType = 'all' | 'active' | 'completed';
export type SortType = 'date' | 'priority' | 'name' | 'dueDate';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'İş', color: 'hsl(217, 91%, 60%)', icon: '💼' },
  { id: 'personal', name: 'Kişisel', color: 'hsl(142, 70%, 45%)', icon: '🏠' },
  { id: 'study', name: 'Eğitim', color: 'hsl(262, 83%, 58%)', icon: '📚' },
  { id: 'health', name: 'Sağlık', color: 'hsl(0, 84%, 60%)', icon: '❤️' },
  { id: 'shopping', name: 'Alışveriş', color: 'hsl(32, 95%, 50%)', icon: '🛒' },
];

export type TaskStats = {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  completedToday: number;
  completedThisWeek: number;
};
