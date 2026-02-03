import { Category, TaskStats, FilterType } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertCircle,
  BarChart3,
  Lightbulb,
  Sun,
  Moon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  stats: TaskStats;
  filter: FilterType;
  setFilter: (filter: FilterType) => void;
  selectedCategory: string | null;
  setSelectedCategory: (id: string | null) => void;
  categories: Category[];
  smartSuggestions: string[];
  isDark: boolean;
  toggleTheme: () => void;
}

export const Sidebar = ({
  stats,
  filter,
  setFilter,
  selectedCategory,
  setSelectedCategory,
  categories,
  smartSuggestions,
  isDark,
  toggleTheme,
}: SidebarProps) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  const filterItems = [
    { id: 'all' as FilterType, label: 'Tümü', icon: Inbox, count: stats.total },
    { id: 'active' as FilterType, label: 'Aktif', icon: Clock, count: stats.active },
    { id: 'completed' as FilterType, label: 'Tamamlandı', icon: CheckCircle2, count: stats.completed },
  ];

  return (
    <aside className="w-72 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-sidebar-foreground">
            📝 Yapılacaklar
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-sidebar-foreground"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>

        {/* Stats Card */}
        <div className="bg-sidebar-accent rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-sidebar-foreground/70">Tamamlanma</span>
            <span className="text-sm font-medium text-sidebar-foreground">
              {completionRate}%
            </span>
          </div>
          <Progress value={completionRate} className="h-2" />
          <div className="flex justify-between mt-3 text-xs text-sidebar-foreground/60">
            <span>{stats.completedToday} bugün</span>
            <span>{stats.completedThisWeek} bu hafta</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
          Filtreler
        </h2>
        <div className="space-y-1">
          {filterItems.map(item => (
            <Button
              key={item.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 font-normal',
                filter === item.id && !selectedCategory
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              onClick={() => {
                setFilter(item.id);
                setSelectedCategory(null);
              }}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              <Badge variant="secondary" className="ml-auto">
                {item.count}
              </Badge>
            </Button>
          ))}

          {stats.overdue > 0 && (
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 font-normal text-destructive hover:bg-destructive/10"
            >
              <AlertCircle className="h-4 w-4" />
              Gecikmiş
              <Badge variant="destructive" className="ml-auto">
                {stats.overdue}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div className="p-4 flex-1 overflow-auto">
        <h2 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider mb-2">
          Kategoriler
        </h2>
        <div className="space-y-1">
          {categories.map(category => (
            <Button
              key={category.id}
              variant="ghost"
              className={cn(
                'w-full justify-start gap-3 font-normal',
                selectedCategory === category.id
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
              onClick={() => {
                setSelectedCategory(
                  selectedCategory === category.id ? null : category.id
                );
              }}
            >
              <span>{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Smart Suggestions */}
      {smartSuggestions.length > 0 && (
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-warning" />
            <h2 className="text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Öneriler
            </h2>
          </div>
          <div className="space-y-2">
            {smartSuggestions.map((suggestion, i) => (
              <p key={i} className="text-xs text-sidebar-foreground/70 leading-relaxed">
                {suggestion}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-sidebar-foreground/40 text-center">
          <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-xs">N</kbd> yeni görev
          {' · '}
          <kbd className="px-1.5 py-0.5 bg-sidebar-accent rounded text-xs">/</kbd> ara
        </p>
      </div>
    </aside>
  );
};
