import { useState } from 'react';
import { Task, Category, SortType } from '@/types/todo';
import { TaskCard } from './TaskCard';
import { TaskForm } from './TaskForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus,
  Search,
  SortAsc,
  Calendar,
  Flag,
  Type,
  Clock,
} from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sort: SortType;
  setSort: (sort: SortType) => void;
  onToggleComplete: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  onAddTask: (data: any) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

interface SortableTaskProps {
  task: Task;
  category?: Category;
  onToggleComplete: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const SortableTask = ({
  task,
  category,
  onToggleComplete,
  onEdit,
  onDelete,
}: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <TaskCard
        task={task}
        category={category}
        onToggleComplete={onToggleComplete}
        onEdit={onEdit}
        onDelete={onDelete}
        isDragging={isDragging}
        dragHandleProps={listeners}
      />
    </div>
  );
};

const sortOptions = [
  { value: 'date', label: 'Oluşturma Tarihi', icon: Clock },
  { value: 'dueDate', label: 'Bitiş Tarihi', icon: Calendar },
  { value: 'priority', label: 'Öncelik', icon: Flag },
  { value: 'name', label: 'İsim', icon: Type },
];

export const TaskList = ({
  tasks,
  categories,
  searchQuery,
  setSearchQuery,
  sort,
  setSort,
  onToggleComplete,
  onUpdateTask,
  onDeleteTask,
  onAddTask,
  onReorder,
  searchInputRef,
}: TaskListProps) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingTask) {
      onUpdateTask(editingTask.id, data);
      setEditingTask(null);
    } else {
      onAddTask(data);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingTask(null);
  };

  const getCategoryForTask = (task: Task) => {
    return categories.find(c => c.id === task.categoryId);
  };

  return (
    <main className="flex-1 h-screen overflow-hidden flex flex-col">
      {/* Header */}
      <header className="p-6 border-b border-border bg-card/50">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Görev ara..."
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortType)}>
            <SelectTrigger className="w-48">
              <SortAsc className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center">
                    <option.icon className="h-4 w-4 mr-2" />
                    {option.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Add Button */}
          <Button onClick={() => setIsFormOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Yeni Görev
          </Button>
        </div>
      </header>

      {/* Task List */}
      <div className="flex-1 overflow-auto p-6">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-4">📋</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'Görev bulunamadı' : 'Henüz görev yok'}
            </h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery
                ? 'Farklı anahtar kelimelerle aramayı deneyin'
                : 'İlk görevinizi ekleyerek başlayın'}
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsFormOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Görev Ekle
              </Button>
            )}
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3 max-w-3xl mx-auto">
                {tasks.map(task => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    category={getCategoryForTask(task)}
                    onToggleComplete={onToggleComplete}
                    onEdit={handleEdit}
                    onDelete={onDeleteTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Task Form Modal */}
      <TaskForm
        open={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editTask={editingTask}
        categories={categories}
      />
    </main>
  );
};
