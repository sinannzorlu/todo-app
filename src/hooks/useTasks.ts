import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, FilterType, SortType, Priority, TaskStats, DEFAULT_CATEGORIES } from '@/types/todo';
import { isToday, isThisWeek, isPast, isSameDay } from 'date-fns';

const STORAGE_KEY = 'todo-tasks';

const generateId = () => Math.random().toString(36).substring(2, 15);

const loadTasks = (): Task[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const tasks = JSON.parse(stored);
      return tasks.map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        reminder: task.reminder ? new Date(task.reminder) : undefined,
      }));
    }
  } catch (error) {
    console.error('Failed to load tasks:', error);
  }
  return [];
};

const saveTasks = (tasks: Task[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error('Failed to save tasks:', error);
  }
};

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(loadTasks);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = useCallback((
    title: string,
    options?: {
      description?: string;
      dueDate?: Date;
      priority?: Priority;
      tags?: string[];
      categoryId?: string;
      reminder?: Date;
      isRecurring?: boolean;
      recurringPattern?: 'daily' | 'weekly' | 'monthly';
    }
  ) => {
    const newTask: Task = {
      id: generateId(),
      title,
      description: options?.description,
      completed: false,
      createdAt: new Date(),
      dueDate: options?.dueDate,
      priority: options?.priority || 'medium',
      tags: options?.tags || [],
      categoryId: options?.categoryId,
      reminder: options?.reminder,
      isRecurring: options?.isRecurring,
      recurringPattern: options?.recurringPattern,
      order: tasks.length,
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, [tasks.length]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, ...updates } : task
    ));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  }, []);

  const reorderTasks = useCallback((startIndex: number, endIndex: number) => {
    setTasks(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result.map((task, index) => ({ ...task, order: index }));
    });
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // Filter by completion status
    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    }

    // Filter by category
    if (selectedCategory) {
      result = result.filter(task => task.categoryId === selectedCategory);
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter(task =>
        selectedTags.some(tag => task.tags.includes(tag))
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      switch (sort) {
        case 'date':
          return b.createdAt.getTime() - a.createdAt.getTime();
        case 'dueDate':
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.getTime() - b.dueDate.getTime();
        case 'priority':
          const priorityOrder = { high: 0, medium: 1, low: 2 };
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, filter, sort, searchQuery, selectedCategory, selectedTags]);

  const stats: TaskStats = useMemo(() => {
    const now = new Date();
    const completed = tasks.filter(t => t.completed);
    const active = tasks.filter(t => !t.completed);
    const overdue = active.filter(t => t.dueDate && isPast(t.dueDate) && !isSameDay(t.dueDate, now));
    const completedToday = completed.filter(t => isToday(t.createdAt));
    const completedThisWeek = completed.filter(t => isThisWeek(t.createdAt));

    return {
      total: tasks.length,
      completed: completed.length,
      active: active.length,
      overdue: overdue.length,
      completedToday: completedToday.length,
      completedThisWeek: completedThisWeek.length,
    };
  }, [tasks]);

  const smartSuggestions = useMemo(() => {
    // Simple smart suggestions based on patterns
    const suggestions: string[] = [];
    
    const overdueCount = stats.overdue;
    if (overdueCount > 0) {
      suggestions.push(`${overdueCount} görev zamanını geçirmiş!`);
    }

    if (stats.completedToday >= 5) {
      suggestions.push('Harika gidiyorsun! Bugün 5+ görev tamamladın 🎉');
    }

    const highPriorityActive = tasks.filter(t => !t.completed && t.priority === 'high');
    if (highPriorityActive.length > 3) {
      suggestions.push('Çok fazla yüksek öncelikli görev var. Bazılarını yeniden değerlendir.');
    }

    return suggestions;
  }, [tasks, stats]);

  return {
    tasks: filteredAndSortedTasks,
    allTasks: tasks,
    filter,
    setFilter,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTags,
    setSelectedTags,
    allTags,
    stats,
    smartSuggestions,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    categories: DEFAULT_CATEGORIES,
  };
};
