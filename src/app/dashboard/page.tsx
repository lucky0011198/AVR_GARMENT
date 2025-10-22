"use client";

import * as React from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  GalleryVerticalEnd,
  Plus,
  Save as SaveIcon,
  Search,
  Trash2,
  X as XIcon,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  partiesAtom,
  searchQueryAtom,
  userRoleAtom,
  filteredPartiesAtom,
  partyNameOptionsAtom,
  itemNameOptionsAtom,
  itemIdOptionsAtom,
  updatePartyNameAtom,
  updateItemFieldAtom,
  addPartyNameOptionAtom,
  addItemNameOptionAtom,
  addItemIdOptionAtom,
  allUsersAtom,
  allowedRoles
} from "@/store/atoms";
import { roleColumnConfig } from "@/constants";
import { type UserRole } from "@/types";
import { CreatableCombobox } from "@/components/table/CreatableCombobox";
import { DatePicker } from "@/components/table/DatePicker";
import { EditableCell } from "@/components/table/EditableCell";
import { EditableTextarea } from "@/components/table/EditableTextarea";
import { SizesTodo } from "@/components/table/SizesTodo";
import { UserManager } from "@/components/table/UserManager";
import { fetchPartiesAtom, savePartiesAtom } from "@/lib/utils";
import { ButtonGroup } from "@/components/ui/button-group";
import UserProfile from "@/components/UserProfile";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function MainDashboard() {
  const [parties, setParties] = useAtom(partiesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [userRole, setUserRole] = useAtom(userRoleAtom);
  const filteredData = useAtomValue(filteredPartiesAtom);
  // const [ login, setIsLogin] = useAtom(isLogin);

  const partyNameOptions = useAtomValue(partyNameOptionsAtom);
  const itemNameOptions = useAtomValue(itemNameOptionsAtom);
  const itemIdOptions = useAtomValue(itemIdOptionsAtom);

  const updatePartyName = useSetAtom(updatePartyNameAtom);
  const updateItemField = useSetAtom(updateItemFieldAtom);
  const addPartyNameOption = useSetAtom(addPartyNameOptionAtom);
  const addItemNameOption = useSetAtom(addItemNameOptionAtom);
  const addItemIdOption = useSetAtom(addItemIdOptionAtom);

  const columnVisibility = roleColumnConfig[userRole];

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage] = React.useState(30);
  // const setuser = useSetAtom(setUserAtom);
  const [allUsers] = useAtom(allUsersAtom);
  const [role] = useAtom(allowedRoles);

  // Flatten and paginate data
  const { paginatedData } = React.useMemo(() => {
    const flatData: Array<{
      party: any;
      item: any;
      partyIndex: number;
      itemIndex: number;
    }> = [];

    filteredData.forEach((party, partyIndex) => {
      party.items?.forEach((item, itemIndex) => {
        flatData.push({ party, item, partyIndex, itemIndex });
      });
    });

    const total = flatData.length;
    const pages = Math.ceil(total / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = flatData.slice(startIndex, endIndex);

    return {
      paginatedData: paginated,
      totalItems: total,
      totalPages: pages,
    };
  }, [filteredData, currentPage, itemsPerPage]);

  // Reset to page 1 when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const fetchedParties = useAtomValue(fetchPartiesAtom);
  const [, saveParties] = useAtom(savePartiesAtom);

  React.useEffect(() => {
    setParties(fetchedParties[0].data || []);
  }, [fetchedParties]);

  const handleSaveData = async () => {
    console.log("=== SAVED DATA ===");
    console.log("Current User Role:", userRole);
    console.log("Parties Data:", parties);
    console.log("fetchedParties Data from Supabase:", fetchedParties);
    await saveParties(1,parties);
    console.log(allUsers);
    console.log("==================");
  };

  const handleAddItem = (partyName: string) => {
    if (parties.length === 0) return;

    const PartyIndex = parties.findIndex((p) => p.party_name === partyName);
    const Party = parties[PartyIndex];

    const newItem = {
      _internalId: crypto.randomUUID(),
      id: "",
      name: "",
      description: "",
      recived: "",
      cuttting: "",
      sizes: [],
      user: [],
      collected: "",
    };
    const updatedParty = {
      ...Party,
      items: [...Party.items, newItem],
    };

    const updatedParties = [...parties];
    updatedParties[PartyIndex] = updatedParty;

    setParties(updatedParties);
  };

  const handleAddRow = () => {
    const newPartyId =
      parties.length > 0 ? parties[parties.length - 1].id + 1 : 1;
    const newParty = {
      id: newPartyId,
      party_name: "",
      items: [
        {
          _internalId: crypto.randomUUID(),
          id: "",
          name: "",
          description: "",
          recived: "",
          cuttting: "",
          sizes: [],
          user: [],
          collected: "",
        },
      ],
    };
    setParties([...parties, newParty]);
  };

  const handleDeleteItem = (partyId: number, internalItemId: string) => {
    const updatedParties = parties.map((party) => {
      if (party.id === partyId) {
        return {
          ...party,
          items: party.items.filter(
            (item) => item._internalId !== internalItemId
          ),
        };
      }
      return party;
    });

    setParties(updatedParties);
  };

  const getPartyBgClass = (partyIndex: number) => {
    return partyIndex % 2 === 0 ? "bg-background" : "bg-muted/30";
  };

  return (
    <div className="w-full flex flex-col p-6 pb-5 pt:2 md:pt-10">
      <a href="#" className="flex items-start gap-2 self-start font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          AVR Garment
        </a>
      {/* Fixed Action Buttons */}
      <div className="flex items-center justify-start h-16 w-full flex-row gap-4 sticky top-0 bg-background z-20">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by party, item, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <XIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
        {userRole == "admin" && (
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={handleAddRow}
                size="lg"
                className="gap-2"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden md:block ">Add Row</span>
              </Button>
            </div>
          </div>
        )}
        <Button
          onClick={handleSaveData}
          variant="secondary"
          className="gap-2 mr-auto hidden md:flex"
        >
          <SaveIcon className="h-5 w-5" />
          Save Data
        </Button>
        {/* <span>{user?.email && `Logged in as: ${user.email}`}</span> */}
        {/* <Button
          variant="destructive"
          onClick={() => {
            authService.logout();
            setIsAuthenticated(false);
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />{" "}
          <span className="hidden sm:block">Logout</span>
        </Button> */}

        <Popover>
          <PopoverTrigger asChild>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <UserProfile />
          </PopoverContent>
        </Popover>
        <div className="hidden sm:block">
          <Select
            value={userRole}
            onValueChange={(value: UserRole) => setUserRole(value)}
          >
            <SelectTrigger id="role-select" className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              {/* <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="cutting">Cutting</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem> */}
              {role.map((r: any) => (
                <SelectItem key={r} value={r}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Scrollable Table Container */}
      {parties.length > 0 && (
        <div className="h-auto flex flex-col pb-5 overflow-hidden">
          <div className="rounded-md border flex-1 overflow-hidden flex flex-col">
            {/* Table with fixed header */}
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-background">
                  <TableRow>
                    {columnVisibility.partyName && (
                      <TableHead className="w-auto bg-background sticky ">
                        Party Name
                      </TableHead>
                    )}
                    {columnVisibility.itemId && (
                      <TableHead className="w-auto bg-background">
                        Item ID
                      </TableHead>
                    )}
                    {columnVisibility.itemName && (
                      <TableHead className="w-[150px] bg-background">
                        Item Name
                      </TableHead>
                    )}
                    {columnVisibility.description && (
                      <TableHead className="min-w-[200px] bg-background">
                        Description
                      </TableHead>
                    )}
                    {columnVisibility.received && (
                      <TableHead className="w-[120px] bg-background">
                        Received
                      </TableHead>
                    )}
                    {columnVisibility.givenDate && (
                      <TableHead className="w-[160px] bg-background">
                        Given Date
                      </TableHead>
                    )}
                    {columnVisibility.cutting && (
                      <TableHead className="w-[120px] bg-background">
                        Cutting
                      </TableHead>
                    )}
                    {columnVisibility.cuttingDate && (
                      <TableHead className="w-[160px] bg-background">
                        Cutting Date
                      </TableHead>
                    )}
                    {columnVisibility.collected && (
                      <TableHead className="w-[120px] bg-background">
                        Collected
                      </TableHead>
                    )}
                    {columnVisibility.collectDate && (
                      <TableHead className="w-[160px] bg-background">
                        Collect Date
                      </TableHead>
                    )}
                    {columnVisibility.sizes && (
                      <TableHead className="min-w-[200px] text-center bg-background">
                        Sizes
                      </TableHead>
                    )}
                    {columnVisibility.users && (
                      <TableHead className="w-[100px] text-center bg-background">
                        Users
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={12}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No results found for "{searchQuery}"
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map(
                      ({ party, item, partyIndex, itemIndex }) => {
                        const bgClass = getPartyBgClass(partyIndex);

                        return (
                          <TableRow key={item._internalId} className={bgClass}>
                            {columnVisibility.partyName && (
                              <TableCell className="align-top pr-10">
                                {itemIndex === 0 ? (
                                  <ButtonGroup>
                                    <Button
                                      className="w-auto cursor-pointer hover:bg-red-100"
                                      variant="outline"
                                      onClick={() => {
                                        const updatedParties = parties.filter(
                                          (p) => p.id !== party.id
                                        );
                                        setParties(updatedParties);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-600" />
                                    </Button>
                                    <CreatableCombobox
                                      value={party.party_name}
                                      onValueChange={(value) =>
                                        updatePartyName({
                                          partyId: party.id,
                                          newName: value,
                                        })
                                      }
                                      options={partyNameOptions}
                                      onCreateOption={addPartyNameOption}
                                      placeholder="Select party..."
                                      searchPlaceholder="Search party..."
                                      emptyText="No party found."
                                      type="partyName"
                                    />
                                  </ButtonGroup>
                                ) : (
                                  <ButtonGroup>
                                    <Button
                                      className="w-auto cursor-pointer hover:bg-red-100"
                                      variant="ghost"
                                      onClick={() => {
                                        handleDeleteItem(
                                          party.id,
                                          item._internalId
                                        );
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 text-gray-600" />
                                    </Button>
                                  </ButtonGroup>
                                )}
                              </TableCell>
                            )}

                            {columnVisibility.itemId && (
                              <TableCell className="align-top pr-10 ">
                                <ButtonGroup>
                                  {itemIndex == party.items.length - 1 &&
                                    userRole === "admin" && (
                                      <Button
                                        onClick={() => {
                                          handleAddItem(party.party_name);
                                        }}
                                        className="w-5"
                                        variant="outline"
                                      >
                                        +
                                      </Button>
                                    )}
                                  <CreatableCombobox
                                    value={item.id}
                                    disabled={userRole !== "admin"}
                                    type="itemId"
                                    onValueChange={(value) =>
                                      updateItemField({
                                        partyId: party.id,
                                        internalItemId: item._internalId,
                                        field: "id",
                                        value,
                                      })
                                    }
                                    options={itemIdOptions}
                                    onCreateOption={addItemIdOption}
                                    placeholder="Select ID..."
                                    searchPlaceholder="Search ID..."
                                    emptyText="No ID found."
                                  />
                                </ButtonGroup>
                              </TableCell>
                            )}

                            {columnVisibility.itemName && (
                              <TableCell className="align-top pr-10 ">
                                <CreatableCombobox
                                  value={item.name}
                                  type="itemName"
                                  disabled={userRole !== "admin"}
                                  onValueChange={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "name",
                                      value,
                                    })
                                  }
                                  options={itemNameOptions}
                                  onCreateOption={addItemNameOption}
                                  placeholder="Select item..."
                                  searchPlaceholder="Search item..."
                                  emptyText="No item found."
                                />
                              </TableCell>
                            )}

                            {columnVisibility.description && (
                              <TableCell className="min-w-[200px] align-top">
                                <EditableTextarea
                                  value={item.description}
                                  label="Description"
                                  onSave={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "description",
                                      value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}

                            {columnVisibility.received && (
                              <TableCell className="align-top">
                                <EditableCell
                                  value={item.recived}
                                  label="Received"
                                  onSave={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "recived",
                                      value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}

                            {columnVisibility.givenDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.givenClothDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "givenClothDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select given date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.cutting && (
                              <TableCell className="align-top">
                                <EditableCell
                                  value={item.cuttting}
                                  label="Cutting"
                                  onSave={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "cuttting",
                                      value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}

                            {columnVisibility.cuttingDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.cuttingDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "cuttingDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select cutting date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.collected && (
                              <TableCell className="align-top">
                                <EditableCell
                                  value={item.collected}
                                  label="Collected"
                                  onSave={(value) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "collected",
                                      value,
                                    })
                                  }
                                />
                              </TableCell>
                            )}

                            {columnVisibility.collectDate && (
                              <TableCell className="align-top">
                                <DatePicker
                                  date={item.collectDate}
                                  onDateChange={(date) =>
                                    updateItemField({
                                      partyId: party.id,
                                      internalItemId: item._internalId,
                                      field: "collectDate",
                                      value: date,
                                    })
                                  }
                                  placeholder="Select collect date"
                                />
                              </TableCell>
                            )}

                            {columnVisibility.sizes && (
                              <TableCell className="align-top max-w-[300px]">
                                <div className="flex flex-wrap gap-1.5 p-2">
                                  {item.sizes.length === 0 ? (
                                    <span className="text-sm text-muted-foreground">
                                      No sizes
                                    </span>
                                  ) : (
                                    item.sizes.map(
                                      (size: any, sizeIndex: number) => (
                                        <React.Fragment key={sizeIndex}>
                                          <Badge
                                            variant="secondary"
                                            className="text-xs font-mono"
                                          >
                                            {size}
                                          </Badge>
                                          {sizeIndex <
                                            item.sizes.length - 1 && (
                                            <span className="text-muted-foreground self-center">
                                              |
                                            </span>
                                          )}
                                        </React.Fragment>
                                      )
                                    )
                                  )}
                                </div>
                                <Dialog>
                                  <DialogTrigger asChild>
                                    {userRole == "cutting" && (
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="w-full mt-2"
                                      >
                                        Edit ({item.sizes.length} sizes)
                                      </Button>
                                    )}
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>
                                        Manage Sizes (Todo List)
                                      </DialogTitle>
                                      <DialogDescription>
                                        Add, check off, or delete sizes. Checked
                                        items are marked as complete.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <SizesTodo
                                      items={item.sizes}
                                      onUpdate={(newSizes) =>
                                        updateItemField({
                                          partyId: party.id,
                                          internalItemId: item._internalId,
                                          field: "sizes",
                                          value: newSizes,
                                        })
                                      }
                                    />
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            )}

                            {columnVisibility.users && (
                              <TableCell className="text-center align-top">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                      {item.user.length} users
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[500px]">
                                    <DialogHeader>
                                      <DialogTitle>Manage Users</DialogTitle>
                                      <DialogDescription>
                                        Add or remove users associated with this
                                        item.
                                      </DialogDescription>
                                    </DialogHeader>
                                    <UserManager
                                      users={item.user}
                                      sizes={item.sizes.map((s: any) => ({
                                        value: s,
                                        label: s.split(":")[0],
                                      }))}
                                      onUpdate={(newUsers) =>
                                        updateItemField({
                                          partyId: party.id,
                                          internalItemId: item._internalId,
                                          field: "user",
                                          value: newUsers,
                                        })
                                      }
                                    />
                                  </DialogContent>
                                </Dialog>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      }
                    )
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Pagination Controls */}
          {/* {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4 bg-background border-t">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                  {totalItems} entries
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Select
                  value={itemsPerPage.toString()}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                    <SelectItem value="100">100 per page</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>

                  <span className="text-sm px-2">
                    Page {currentPage} of {totalPages}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            </div>
          )} */}
        </div>
      )}

      {/* Fixed Mobile Bottom Bar */}
      <div className="flex sm:hidden items-center justify-center h-16 w-full flex-row gap-4 mb-6 sticky bottom-0 bg-background z-20">
        <ButtonGroup>
          <Button onClick={handleSaveData} variant="outline">
            <SaveIcon className="h-5 w-5" />
            Save Data
          </Button>
          <Select
            value={userRole}
            onValueChange={(value: UserRole) => setUserRole(value)}
          >
            <SelectTrigger id="role-select" className="w-[180px]">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="cutting">Cutting</SelectItem>
              <SelectItem value="distributor">Distributor</SelectItem>
            </SelectContent>
          </Select>
        </ButtonGroup>
      </div>
    </div>
  );
}
