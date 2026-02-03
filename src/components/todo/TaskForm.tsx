import { useState, useEffect } from 'react';
import { Task, Priority, Category } from '@/types/todo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Plus, X, Flag } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    description?: string;
    dueDate?: Date;
    priority: Priority;
    tags: string[];
    categoryId?: string;
  }) => void;
  editTask?: Task | null;
  categories: Category[];
}

export const TaskForm = ({
  open,
  onClose,
  onSubmit,
  editTask,
  categories,
}: TaskFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState<Date | undefined>();
  const [priority, setPriority] = useState<Priority>('medium');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [categoryId, setCategoryId] = useState<string | undefined>();

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || '');
      setDueDate(editTask.dueDate);
      setPriority(editTask.priority);
      setTags(editTask.tags);
      setCategoryId(editTask.categoryId);
    } else {
      resetForm();
    }
  }, [editTask, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate(undefined);
    setPriority('medium');
    setTags([]);
    setTagInput('');
    setCategoryId(undefined);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      dueDate,
      priority,
      tags,
      categoryId,
    });

    resetForm();
    onClose();
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {editTask ? 'Görevi Düzenle' : 'Yeni Görev Ekle'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Başlık *</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Görev başlığını girin..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Açıklama</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="İsteğe bağlı açıklama..."
              rows={3}
            />
          </div>

          {/* Priority & Category Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Öncelik</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center">
                      <Flag className="w-4 h-4 mr-2 text-[hsl(var(--priority-low))]" />
                      Düşük
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center">
                      <Flag className="w-4 h-4 mr-2 text-[hsl(var(--priority-medium))]" />
                      Orta
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center">
                      <Flag className="w-4 h-4 mr-2 text-[hsl(var(--priority-high))]" />
                      Yüksek
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Kategori</Label>
              <Select value={categoryId || 'none'} onValueChange={(v) => setCategoryId(v === 'none' ? undefined : v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kategori yok</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label>Bitiş Tarihi</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP', { locale: tr }) : 'Tarih seçin...'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
            {dueDate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDueDate(undefined)}
                className="text-muted-foreground"
              >
                Tarihi temizle
              </Button>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Etiketler</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Etiket ekle..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="icon" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit" disabled={!title.trim()}>
              {editTask ? 'Güncelle' : 'Ekle'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
