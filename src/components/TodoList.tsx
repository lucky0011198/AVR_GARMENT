// CommonTodoList.tsx
import React, { useState, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Trash2, 
  GripVertical, 
  Plus, 
  Edit2, 
  Check, 
  X,
  ListTodo,
  Search,
} from 'lucide-react';

// Types
export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

// Reusable Component Props
interface CommonTodoListProps {
  title?: string;
  initialTasks?: Task[];
  showSearch?: boolean;
  placeholder?: string;
  addButtonText?: string;
  onTasksChange?: (tasks: Task[]) => void;
  className?: string;
}

// Sortable Task Item Component
interface SortableTaskProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, newTitle: string) => void;
}

function SortableTask({ task, onToggle, onDelete, onEdit }: SortableTaskProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(task.title);

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
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveEdit = () => {
    if (editValue.trim()) {
      onEdit(task.id, editValue.trim());
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(task.title);
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-3 p-4 bg-white border-2 border-black hover:bg-gray-50 transition-all duration-200 mb-3"
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        {...attributes}
        className="cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-5 h-5 text-black" strokeWidth={2} />
      </div>

      {/* Checkbox */}
      <Checkbox
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="flex-shrink-0 border-2 border-black data-[state=checked]:bg-black data-[state=checked]:text-white"
      />

      {/* Task Title */}
      {isEditing ? (
        <div className="flex-1 flex items-center gap-2">
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            className="flex-1 border-2 border-black focus:ring-2 focus:ring-black"
            autoFocus
          />
          <Button
            size="icon"
            variant="ghost"
            onClick={handleSaveEdit}
            className="h-9 w-9 hover:bg-black hover:text-white border-2 border-black"
          >
            <Check className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCancelEdit}
            className="h-9 w-9 hover:bg-black hover:text-white border-2 border-black"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      ) : (
        <span
          className={`flex-1 text-sm font-medium ${
            task.completed
              ? 'line-through text-gray-400'
              : 'text-black'
          }`}
        >
          {task.title}
        </span>
      )}

      {/* Action Buttons */}
      {!isEditing && (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setIsEditing(true)}
            className="h-9 w-9 hover:bg-black hover:text-white border-2 border-black"
          >
            <Edit2 className="w-4 h-4" strokeWidth={2} />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onDelete(task.id)}
            className="h-9 w-9 hover:bg-black hover:text-white border-2 border-black"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2} />
          </Button>
        </div>
      )}
    </div>
  );
}

// Main Reusable Todo List Component
export default function CommonTodoList({
  title = 'Todo List',
  initialTasks = [],
  showSearch = true,
  placeholder = 'Add a new task...',
  addButtonText = 'Add',
  onTasksChange,
  className = '',
}: CommonTodoListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Update parent component when tasks change
  const updateTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
    onTasksChange?.(newTasks);
  };

  // Filter tasks based on search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks;
    return tasks.filter((task) =>
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [tasks, searchQuery]);

  // CRUD Operations
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskTitle.trim()) {
      const newTask: Task = {
        id: Date.now().toString(),
        title: newTaskTitle.trim(),
        completed: false,
      };
      updateTasks([...tasks, newTask]);
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = (id: string) => {
    updateTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    updateTasks(tasks.filter((task) => task.id !== id));
  };

  const handleEditTask = (id: string, newTitle: string) => {
    updateTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, title: newTitle } : task
      )
    );
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((item) => item.id === active.id);
      const newIndex = tasks.findIndex((item) => item.id === over.id);
      updateTasks(arrayMove(tasks, oldIndex, newIndex));
    }
  };

  const handleClearCompleted = () => {
    updateTasks(tasks.filter((task) => !task.completed));
  };

  // Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;

  return (
    <div className={`min-h-screen bg-white pb-32 ${className}`}>
      <div className="max-w-3xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="p-6 bg-gray-50">
            {/* Header with Title and Search */}
            <div className="mb-6 space-y-4">
              {/* Title */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <ListTodo className="w-8 h-8 text-black" strokeWidth={2} />
                  <h1 className="text-3xl font-bold text-black">{title}</h1>
                </div>
                <div className="text-sm font-medium text-gray-600">
                  {completedTasks}/{totalTasks} completed
                </div>
              </div>

              {/* Search Bar */}
              {showSearch && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" strokeWidth={2} />
                  <Input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search tasks..."
                    className="pl-10 h-12 border-2 border-black focus:ring-2 focus:ring-black bg-white font-medium"
                  />
                </div>
              )}
            </div>

            {/* Task List */}
            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 border-4 border-dashed border-gray-300 bg-white">
                <ListTodo className="w-16 h-16 mx-auto mb-4 text-gray-400" strokeWidth={2} />
                <p className="text-lg font-medium text-gray-600">
                  {searchQuery ? 'No tasks found' : 'No tasks yet'}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  {searchQuery ? 'Try a different search term' : 'Add a task to get started'}
                </p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredTasks.map((task) => task.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-0">
                    {filteredTasks.map((task) => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        onToggle={handleToggleTask}
                        onDelete={handleDeleteTask}
                        onEdit={handleEditTask}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}

            {/* Clear Completed Button */}
            {completedTasks > 0 && (
              <div className="mt-6 flex justify-center">
                <Button
                  variant="outline"
                  onClick={handleClearCompleted}
                  className="border-2 border-black bg-white hover:bg-black hover:text-white font-medium"
                >
                  <Trash2 className="w-4 h-4 mr-2" strokeWidth={2} />
                  Clear Completed ({completedTasks})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Fixed Footer with Add Task Input */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-black">
        <div className="max-w-3xl mx-auto p-4">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <Input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder={placeholder}
              className="flex-1 h-14 text-base border-2 border-black focus:ring-2 focus:ring-black bg-white font-medium"
            />
            <Button
              type="submit"
              className="h-14 px-8 bg-black hover:bg-gray-800 text-white border-2 border-black font-medium"
            >
              <Plus className="w-5 h-5 mr-2" strokeWidth={2} />
              {addButtonText}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
