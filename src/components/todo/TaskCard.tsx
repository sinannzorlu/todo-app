import { useState } from 'react';
import { Task, Category, Priority } from '@/types/todo';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Calendar,
  Clock,
  MoreHorizontal,
  Pencil,
  Trash2,
  Flag,
  GripVertical,
} from 'lucide-react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

const priorityConfig: Record<Priority, { label: string; className: string }> = {
  high: { label: 'Yüksek', className: 'priority-badge-high' },
  medium: { label: 'Orta', className: 'priority-badge-medium' },
  low: { label: 'Düşük', className: 'priority-badge-low' },
};

const formatDueDate = (date: Date) => {
  if (isToday(date)) return 'Bugün';
  if (isTomorrow(date)) return 'Yarın';
  return format(date, 'd MMM', { locale: tr });
};

export const TaskCard = ({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
  isDragging,
  dragHandleProps,
}: TaskCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = () => {
    setIsDeleting(true);
    setTimeout(() => onDelete(task.id), 200);
  };

  const isOverdue = task.dueDate && isPast(task.dueDate) && !isToday(task.dueDate) && !task.completed;

  return (
    <div
      className={cn(
        'task-card group',
        isDragging && 'task-card-dragging',
        isDeleting && 'animate-fade-out',
        task.completed && 'opacity-60'
      )}
    >
      <div className="flex items-start gap-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="mt-1 cursor-grab opacity-0 group-hover:opacity-50 transition-opacity"
        >
          <GripVertical className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Checkbox */}
        <Checkbox
          checked={task.completed}
          onCheckedChange={() => onToggleComplete(task.id)}
          className={cn(
            'mt-1 h-5 w-5 rounded-full border-2 transition-all',
            task.completed && 'animate-check bg-primary border-primary'
          )}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-foreground transition-all',
                  task.completed && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {task.description}
                </p>
              )}
            </div>

            {/* Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            {/* Priority */}
            <Badge
              variant="outline"
              className={cn('text-xs', priorityConfig[task.priority].className)}
            >
              <Flag className="w-3 h-3 mr-1" />
              {priorityConfig[task.priority].label}
            </Badge>

            {/* Due Date */}
            {task.dueDate && (
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isOverdue && 'border-destructive text-destructive bg-destructive/10'
                )}
              >
                <Calendar className="w-3 h-3 mr-1" />
                {formatDueDate(task.dueDate)}
              </Badge>
            )}

            {/* Category */}
            {category && (
              <Badge
                variant="secondary"
                className="text-xs"
                style={{ backgroundColor: `${category.color}20`, color: category.color }}
              >
                {category.icon} {category.name}
              </Badge>
            )}

            {/* Tags */}
            {task.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">
                #{tag}
              </Badge>
            ))}

            {/* Recurring indicator */}
            {task.isRecurring && (
              <Badge variant="outline" className="text-xs">
                <Clock className="w-3 h-3 mr-1" />
                Tekrarlı
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
