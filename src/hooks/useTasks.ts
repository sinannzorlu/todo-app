import { useState, useEffect, useMemo, useCallback } from 'react';
import { Task, FilterType, SortType, Priority, TaskStats, DEFAULT_CATEGORIES } from '@/types/todo';
import { isToday, isThisWeek, isPast, isSameDay } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch tasks from database
  const fetchTasks = useCallback(async () => {
    if (!user) {
      setTasks([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedTasks: Task[] = (data || []).map((todo: any) => ({
        id: todo.id,
        title: todo.title,
        description: todo.description || undefined,
        completed: todo.completed,
        createdAt: new Date(todo.created_at),
        dueDate: todo.due_date ? new Date(todo.due_date) : undefined,
        priority: todo.priority as Priority,
        tags: todo.tags || [],
        categoryId: todo.category_id || undefined,
        reminder: todo.reminder ? new Date(todo.reminder) : undefined,
        isRecurring: todo.is_recurring || false,
        recurringPattern: (todo.recurring_pattern as 'daily' | 'weekly' | 'monthly') || undefined,
        order: todo.order || 0,
      }));

      setTasks(mappedTasks);
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Görevler yüklenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (
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
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('todos')
        .insert({
          user_id: user.id,
          title,
          description: options?.description || null,
          due_date: options?.dueDate ? options.dueDate.toISOString().split('T')[0] : null,
          priority: options?.priority || 'medium',
          tags: options?.tags || [],
          category_id: options?.categoryId || null,
          reminder: options?.reminder?.toISOString() || null,
          is_recurring: options?.isRecurring || false,
          recurring_pattern: options?.recurringPattern as string | null,
          order: tasks.length,
        })
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        completed: data.completed,
        createdAt: new Date(data.created_at),
        dueDate: data.due_date ? new Date(data.due_date) : undefined,
        priority: data.priority as Priority,
        tags: data.tags || [],
        categoryId: data.category_id || undefined,
        reminder: data.reminder ? new Date(data.reminder) : undefined,
        isRecurring: data.is_recurring || false,
        recurringPattern: (data.recurring_pattern as 'daily' | 'weekly' | 'monthly') || undefined,
        order: data.order || 0,
      };

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Görev eklenirken bir hata oluştu.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, tasks.length, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description || null;
      if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
      if (updates.dueDate !== undefined) dbUpdates.due_date = updates.dueDate ? updates.dueDate.toISOString().split('T')[0] : null;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
      if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId || null;
      if (updates.reminder !== undefined) dbUpdates.reminder = updates.reminder?.toISOString() || null;
      if (updates.isRecurring !== undefined) dbUpdates.is_recurring = updates.isRecurring;
      if (updates.recurringPattern !== undefined) dbUpdates.recurring_pattern = updates.recurringPattern as string | null;
      if (updates.order !== undefined) dbUpdates.order = updates.order;

      const { error } = await supabase
        .from('todos')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task =>
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Görev güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('todos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error: any) {
      toast({
        title: 'Hata',
        description: 'Görev silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const toggleComplete = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      await updateTask(id, { completed: !task.completed });
    }
  }, [tasks, updateTask]);

  const reorderTasks = useCallback(async (startIndex: number, endIndex: number) => {
    const result = Array.from(tasks);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    
    const reorderedTasks = result.map((task, index) => ({ ...task, order: index }));
    setTasks(reorderedTasks);

    // Update order in database (batch update)
    for (const task of reorderedTasks) {
      await supabase
        .from('todos')
        .update({ order: task.order })
        .eq('id', task.id);
    }
  }, [tasks]);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    tasks.forEach(task => task.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet);
  }, [tasks]);

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    if (filter === 'active') {
      result = result.filter(task => !task.completed);
    } else if (filter === 'completed') {
      result = result.filter(task => task.completed);
    }

    if (selectedCategory) {
      result = result.filter(task => task.categoryId === selectedCategory);
    }

    if (selectedTags.length > 0) {
      result = result.filter(task =>
        selectedTags.some(tag => task.tags.includes(tag))
      );
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

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
    loading,
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
