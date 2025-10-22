"use client";

import { useState } from "react";
import { Plus, Trash2, User2, Package, Ruler, Hash, MoreVertical, Edit, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { allUsersAtom } from "@/store/atoms";
import { useAtom } from "jotai";

// Sample users - replace with your actual user list
// const availableUsers = [
//   { id: "user-1", name: "John Doe" },
//   { id: "user-2", name: "Jane Smith" },
//   { id: "user-3", name: "Mike Johnson" },
//   { id: "user-4", name: "Sarah Williams" },
//   { id: "user-5", name: "Tom Brown" },
// ];

interface UserEntry {
  user: { id: string; name: string, user?: string };
  menuId: string;
  size: string;
  count: number;
}

interface UserManagerProps {
  users: any;
  sizes: { value: string; label: string }[]; // Format: { value: "10:100", label: "10" }
  onUpdate: (newUsers: UserEntry[]) => void;
}

export function UserManager({ users, onUpdate, sizes }: UserManagerProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [allUsers] = useAtom(allUsersAtom);
  
  // Separate popover states for Add dialog
  const [openUserAdd, setOpenUserAdd] = useState(false);
  
  // Separate popover states for Edit dialog
  const [openUserEdit, setOpenUserEdit] = useState(false);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);

  const [selectedUser, setSelectedUser] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [menuId, setMenuId] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [itemCount, setItemCount] = useState<string>("1");
  
  // Validation errors
  const [validationError, setValidationError] = useState<string>("");
  const [countError, setCountError] = useState<string>("");

  // Helper function to parse size value (format: "10:100")
  const parseSizeValue = (value: string): { size: string; maxCount: number } => {
    const parts = value.split(":");
    return {
      size: parts[0] || "",
      maxCount: parseInt(parts[1]) || 0,
    };
  };

  // Calculate used count for a specific size (excluding a specific index for edit mode)
  const getUsedCountForSize = (sizeValue: string, excludeIndex?: number): number => {
    const { size } = parseSizeValue(sizeValue);
    return users.reduce((total:any, entry:any, index:any) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return total;
      }
      if (entry.size === size) {
        return total + entry.count;
      }
      return total;
    }, 0);
  };

  // Get remaining count for selected size
  const getRemainingCount = (): number => {
    if (!selectedSize) return 0;
    const { maxCount } = parseSizeValue(selectedSize);
    const usedCount = getUsedCountForSize(selectedSize, editIndex !== null ? editIndex : undefined);
    return maxCount - usedCount;
  };

  // Get size label from value
  // const getSizeLabel = (value: string): string => {
  //   const { size } = parseSizeValue(value);
  //   return size;
  // };

  // Check for duplicate user
  const isDuplicateUser = (userId: string, excludeIndex?: number) => {
    return users.some((entry:any, index:any) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return entry.user.id === userId;
    });
  };

  // Check for duplicate menu ID
  const isDuplicateMenuId = (menuIdValue: string, excludeIndex?: number) => {
    return users.some((entry:any, index:number) => {
      if (excludeIndex !== undefined && index === excludeIndex) {
        return false;
      }
      return entry.menuId.toLowerCase() === menuIdValue.toLowerCase().trim();
    });
  };

  // Handle item count change with validation
  const handleItemCountChange = (value: string) => {
    setItemCount(value);
    const numValue = parseInt(value) || 0;
    const remainingCount = getRemainingCount();
    
    if (numValue > remainingCount) {
      setCountError(`Only ${remainingCount} items available for this size.`);
    } else if (numValue < 1) {
      setCountError("Count must be at least 1.");
    } else {
      setCountError("");
    }
  };

  const handleAdd = () => {
    const count = parseInt(itemCount);
    const remainingCount = getRemainingCount();
    
    // Clear previous errors
    setValidationError("");

    if (!selectedUser || !menuId.trim() || !selectedSize || count < 1) {
      return;
    }

    // Validate count against remaining
    if (count > remainingCount) {
      setValidationError(`Item count cannot exceed ${remainingCount} (${remainingCount} items remaining for this size).`);
      return;
    }

    // Validate duplicate user
    if (isDuplicateUser(selectedUser.id)) {
      setValidationError(`${selectedUser.name} has already been added to the list.`);
      return;
    }

    // Validate duplicate menu ID
    if (isDuplicateMenuId(menuId)) {
      setValidationError(`Menu ID "${menuId.trim()}" already exists. Please use a unique ID.`);
      return;
    }

    const { size } = parseSizeValue(selectedSize);
    
    onUpdate([
      ...users,
      {
        user: selectedUser,
        menuId: menuId.trim(),
        size: size,
        count: count,
      },
    ]);
    
    // Reset form and close dialog
    resetForm();
    setDialogOpen(false);
  };

  const handleEditClick = (index: number) => {
    setEditIndex(index);
    setValidationError("");
    setCountError("");
    const entry = users[index];
    setSelectedUser(entry.user);
    setMenuId(entry.menuId);
    
    // Find the matching size value from sizes array
    const matchingSizeOption = sizes.find((s) => {
      const { size } = parseSizeValue(s.value);
      return size === entry.size;
    });
    
    setSelectedSize(matchingSizeOption?.value || "");
    setItemCount(entry.count.toString());
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const count = parseInt(itemCount);
    const remainingCount = getRemainingCount();
    
    // Clear previous errors
    setValidationError("");

    if (editIndex === null || !selectedUser || !menuId.trim() || !selectedSize || count < 1) {
      return;
    }

    // Validate count against remaining
    if (count > remainingCount) {
      setValidationError(`Item count cannot exceed ${remainingCount} (${remainingCount} items remaining for this size).`);
      return;
    }

    // Validate duplicate user (excluding current entry)
    if (isDuplicateUser(selectedUser.id, editIndex)) {
      setValidationError(`${selectedUser.name} has already been added to the list.`);
      return;
    }

    // Validate duplicate menu ID (excluding current entry)
    if (isDuplicateMenuId(menuId, editIndex)) {
      setValidationError(`Menu ID "${menuId.trim()}" already exists. Please use a unique ID.`);
      return;
    }

    const { size } = parseSizeValue(selectedSize);

    const updatedUsers = [...users];
    updatedUsers[editIndex] = {
      user: selectedUser,
      menuId: menuId.trim(),
      size: size,
      count: count,
    };
    onUpdate(updatedUsers);
    
    // Reset form and close dialog
    resetForm();
    setEditIndex(null);
    setEditDialogOpen(false);
  };

  const handleDeleteClick = (index: number) => {
    setDeleteIndex(index);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteIndex !== null) {
      onUpdate(users.filter((_:any, i:any) => i !== deleteIndex));
      setDeleteIndex(null);
      setDeleteDialogOpen(false);
    }
  };

  const resetForm = () => {
    setSelectedUser(null);
    setMenuId("");
    setSelectedSize("");
    setItemCount("1");
    setValidationError("");
    setCountError("");
    setOpenUserAdd(false);
    setOpenUserEdit(false);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
    }
    setDialogOpen(open);
  };

  const handleEditDialogClose = (open: boolean) => {
    if (!open) {
      resetForm();
      setEditIndex(null);
    }
    setEditDialogOpen(open);
  };

  const isFormValid =
    selectedUser && menuId.trim() && selectedSize && parseInt(itemCount) > 0 && !countError;

  const remainingCount = getRemainingCount();

  return (
    <div className="space-y-3">
      {/* Header with Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            User Entries
            {users.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {users.length}
              </Badge>
            )}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Manage user entries with menu details
          </p>
        </div>

        {/* Add Entry Dialog */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Entry</DialogTitle>
              <DialogDescription>
                Fill in all the details to create a new user entry.
              </DialogDescription>
            </DialogHeader>

            {validationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{validationError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-3 py-2">
              {/* User Combobox */}
              <div className="space-y-1.5">
                <Label htmlFor="user-select" className="flex items-center gap-1.5 text-sm">
                  <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                  Select User
                </Label>
                <Popover open={openUserAdd} onOpenChange={setOpenUserAdd}>
                  <PopoverTrigger asChild>
                    <Button
                      id="user-select"
                      variant="outline"
                      role="combobox"
                      aria-expanded={openUserAdd}
                      className={cn(
                        "w-full justify-between h-9 text-sm",
                        !selectedUser && "text-muted-foreground"
                      )}
                    >
                      {selectedUser ? selectedUser.name : "Choose a user..."}
                      <User2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search users..." className="h-8" />
                      <CommandList>
                        <CommandEmpty>No user found.</CommandEmpty>
                        <CommandGroup>
                          {allUsers.map((user:any) => (
                            <CommandItem
                              key={user.id}
                              value={user.name}
                              onSelect={() => {
                                setSelectedUser(user);
                                setOpenUserAdd(false);
                                setValidationError("");
                              }}
                              className="cursor-pointer text-sm"
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  selectedUser?.id === user.id
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <svg
                                  className="h-3 w-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                  strokeWidth={3}
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 13l4 4L19 7"
                                  />
                                </svg>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{user.name}</span>
                                <span className="text-xs text-muted-foreground">
                                  {user.id}
                                </span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Menu ID Input */}
              <div className="space-y-1.5">
                <Label htmlFor="menu-id" className="flex items-center gap-1.5 text-sm">
                  <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                  Menu ID
                </Label>
                <div className="relative">
                  <Input
                    id="menu-id"
                    value={menuId}
                    onChange={(e) => {
                      setMenuId(e.target.value);
                      setValidationError("");
                    }}
                    placeholder="e.g., MENU-001"
                    className="pr-9 h-9 text-sm"
                  />
                  <Hash className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              {/* Size Radio Group */}
              <div className="space-y-2">
                <Label className="flex items-center gap-1.5 text-sm">
                  <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                  Select Size
                </Label>
                <RadioGroup 
                  value={selectedSize} 
                  onValueChange={(value) => {
                    setSelectedSize(value);
                    setItemCount("1");
                    setCountError("");
                  }}
                >
                  <div className="grid grid-cols-2 gap-2">
                    {sizes.map((size) => {
                      const { size: sizeLabel, maxCount } = parseSizeValue(size.value);
                      const usedCount = getUsedCountForSize(size.value);
                      const remaining = maxCount - usedCount;
                      
                      return (
                        <div
                          key={size.value}
                          className={cn(
                            "flex items-center space-x-2 rounded-md border p-2.5 hover:bg-accent cursor-pointer transition-colors",
                            selectedSize === size.value && "border-primary bg-accent",
                            remaining <= 0 && "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => {
                            if (remaining > 0) {
                              setSelectedSize(size.value);
                              setItemCount("1");
                              setCountError("");
                            }
                          }}
                        >
                          <RadioGroupItem 
                            value={size.value} 
                            id={`size-${size.value}`}
                            disabled={remaining <= 0}
                          />
                          <Label
                            htmlFor={`size-${size.value}`}
                            className="text-sm font-normal cursor-pointer flex-1"
                          >
                            <div className="flex flex-col">
                              <span>{sizeLabel}</span>
                              <span className={cn(
                                "text-xs",
                                remaining <= 0 ? "text-destructive" : "text-muted-foreground"
                              )}>
                                {remaining > 0 ? `${remaining} available` : "Out of stock"}
                              </span>
                            </div>
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                </RadioGroup>
              </div>

              {/* Item Count Input */}
              <div className="space-y-1.5">
                <Label htmlFor="item-count" className="flex items-center gap-1.5 text-sm">
                  <Package className="h-3.5 w-3.5 text-muted-foreground" />
                  Item Count
                  {remainingCount > 0 && (
                    <span className="text-xs text-muted-foreground ml-auto">
                      (Available: {remainingCount})
                    </span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    id="item-count"
                    type="number"
                    min="1"
                    value={itemCount}
                    onChange={(e) => handleItemCountChange(e.target.value)}
                    placeholder="Enter quantity"
                    className={cn(
                      "pr-9 h-9 text-sm",
                      countError && "border-destructive focus-visible:ring-destructive"
                    )}
                    disabled={!selectedSize}
                  />
                  <Package className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
                {countError && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {countError}
                  </p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!isFormValid} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Entry
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog - Similar structure */}
      <Dialog open={editDialogOpen} onOpenChange={handleEditDialogClose}>
        <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Entry</DialogTitle>
            <DialogDescription>
              Update the details for this entry.
            </DialogDescription>
          </DialogHeader>

          {validationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{validationError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-3 py-2">
            {/* User Combobox */}
            <div className="space-y-1.5">
              <Label htmlFor="edit-user-select" className="flex items-center gap-1.5 text-sm">
                <User2 className="h-3.5 w-3.5 text-muted-foreground" />
                Select User
              </Label>
              <Popover open={openUserEdit} onOpenChange={setOpenUserEdit}>
                <PopoverTrigger asChild>
                  <Button
                    id="edit-user-select"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openUserEdit}
                    className={cn(
                      "w-full justify-between h-9 text-sm",
                      !selectedUser && "text-muted-foreground"
                    )}
                  >
                    {selectedUser ? selectedUser.name : "Choose a user..."}
                    <User2 className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search users..." className="h-8" />
                    <CommandList>
                      <CommandEmpty>No user found.</CommandEmpty>
                      <CommandGroup>
                        {allUsers.map((user:any) => (
                          <CommandItem
                            key={user.id}
                            value={user.name}
                            onSelect={() => {
                              setSelectedUser(user);
                              setOpenUserEdit(false);
                              setValidationError("");
                            }}
                            className="cursor-pointer text-sm"
                          >
                            <div
                              className={cn(
                                "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                selectedUser?.id === user.id
                                  ? "bg-primary text-primary-foreground"
                                  : "opacity-50 [&_svg]:invisible"
                              )}
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <div className="flex flex-col">
                              <span className="font-medium">{user.name}</span>
                              <span className="text-xs text-muted-foreground">{user.id}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-menu-id" className="flex items-center gap-1.5 text-sm">
                <Hash className="h-3.5 w-3.5 text-muted-foreground" />
                Menu ID
              </Label>
              <div className="relative">
                <Input
                  id="edit-menu-id"
                  value={menuId}
                  onChange={(e) => {
                    setMenuId(e.target.value);
                    setValidationError("");
                  }}
                  placeholder="e.g., MENU-001"
                  className="pr-9 h-9 text-sm"
                />
                <Hash className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            {/* Size Radio Group for Edit */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm">
                <Ruler className="h-3.5 w-3.5 text-muted-foreground" />
                Select Size
              </Label>
              <RadioGroup 
                value={selectedSize} 
                onValueChange={(value) => {
                  setSelectedSize(value);
                  setItemCount("1");
                  setCountError("");
                }}
              >
                <div className="grid grid-cols-2 gap-2">
                  {sizes.map((size) => {
                    const { size: sizeLabel, maxCount } = parseSizeValue(size.value);
                    const usedCount = getUsedCountForSize(size.value, editIndex !== null ? editIndex : undefined);
                    const remaining = maxCount - usedCount;
                    
                    return (
                      <div
                        key={size.value}
                        className={cn(
                          "flex items-center space-x-2 rounded-md border p-2.5 hover:bg-accent cursor-pointer transition-colors",
                          selectedSize === size.value && "border-primary bg-accent"
                        )}
                        onClick={() => {
                          setSelectedSize(size.value);
                          setItemCount("1");
                          setCountError("");
                        }}
                      >
                        <RadioGroupItem value={size.value} id={`edit-size-${size.value}`} />
                        <Label
                          htmlFor={`edit-size-${size.value}`}
                          className="text-sm font-normal cursor-pointer flex-1"
                        >
                          <div className="flex flex-col">
                            <span>{sizeLabel}</span>
                            <span className="text-xs text-muted-foreground">
                              {remaining} available
                            </span>
                          </div>
                        </Label>
                      </div>
                    );
                  })}
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edit-item-count" className="flex items-center gap-1.5 text-sm">
                <Package className="h-3.5 w-3.5 text-muted-foreground" />
                Item Count
                {remainingCount > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    (Available: {remainingCount})
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="edit-item-count"
                  type="number"
                  min="1"
                  value={itemCount}
                  onChange={(e) => handleItemCountChange(e.target.value)}
                  placeholder="Enter quantity"
                  className={cn(
                    "pr-9 h-9 text-sm",
                    countError && "border-destructive focus-visible:ring-destructive"
                  )}
                  disabled={!selectedSize}
                />
                <Package className="absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              </div>
              {countError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {countError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button onClick={handleEditSave} disabled={!isFormValid} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              This action cannot be undone. This will permanently delete the
              entry
              {deleteIndex !== null && users[deleteIndex] && (
                <span className="font-medium">
                  {" "}
                  for {users[deleteIndex].user.name}
                </span>
              )}
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={() => setDeleteIndex(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Entries List */}
      <ScrollArea className="h-[calc(100vh-12rem)] rounded-md">
        <div className="space-y-2 pr-4">
          {users.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-3">
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h4 className="font-semibold text-sm mb-1.5">No entries yet</h4>
                <p className="text-xs text-muted-foreground text-center max-w-xs px-4">
                  Get started by adding your first user entry with the button
                  above
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((entry:any, index:number) => (
              <Card
                key={index}
                className="group hover:shadow-md transition-shadow"
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                      <User2 className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="min-w-0 flex-1">
                          <h4 className="font-semibold text-sm leading-none mb-0.5 truncate">
                            {entry.user.name}
                          </h4>
                          <p className="text-xs text-muted-foreground truncate">
                            {entry.user.id}
                          </p>
                        </div>
                        
                        {/* Three Dot Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 shrink-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(index)}
                              className="cursor-pointer"
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(index)}
                              className="cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <Separator className="my-1.5" />
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
                            <Hash className="h-2.5 w-2.5" />
                            Menu
                          </p>
                          <p className="font-medium truncate text-xs">
                            {entry.menuId}
                          </p>
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
                            <Ruler className="h-2.5 w-2.5" />
                            Size
                          </p>
                          <Badge
                            variant="outline"
                            className="font-medium text-[10px] h-5 px-1.5"
                          >
                            {entry.size}
                          </Badge>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-0.5">
                            <Package className="h-2.5 w-2.5" />
                            Qty
                          </p>
                          <p className="font-medium text-xs">×{entry.count}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
