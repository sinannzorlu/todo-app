import { useRef } from 'react';
import { useTasks } from '@/hooks/useTasks';
import { useTheme } from '@/hooks/useTheme';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Sidebar } from '@/components/todo/Sidebar';
import { TaskList } from '@/components/todo/TaskList';

const Index = () => {
  const {
    tasks,
    filter,
    setFilter,
    sort,
    setSort,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    stats,
    smartSuggestions,
    addTask,
    updateTask,
    deleteTask,
    toggleComplete,
    reorderTasks,
    categories,
  } = useTasks();

  const { isDark, toggleTheme } = useTheme();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'n',
      action: () => {
        // Focus on add button - handled via state in TaskList
        document.querySelector<HTMLButtonElement>('button[class*="gap-2"]')?.click();
      },
      description: 'Yeni görev ekle',
    },
    {
      key: '/',
      action: () => {
        searchInputRef.current?.focus();
      },
      description: 'Aramaya odaklan',
    },
  ]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        stats={stats}
        filter={filter}
        setFilter={setFilter}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        smartSuggestions={smartSuggestions}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />
      <TaskList
        tasks={tasks}
        categories={categories}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sort={sort}
        setSort={setSort}
        onToggleComplete={toggleComplete}
        onUpdateTask={updateTask}
        onDeleteTask={deleteTask}
        onAddTask={(data) => addTask(data.title, data)}
        onReorder={reorderTasks}
        searchInputRef={searchInputRef}
      />
    </div>
  );
};

export default Index;
