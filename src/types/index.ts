// Placeholder for type definitions
export type UserRole = "admin" | "cutting" | "distributor";

export interface User {
  name: string;
  id: string;
}

export interface Item {
  _internalId: string;
  id: string;
  name: string;
  description: string;
  recived: string;
  cuttting: string;
  sizes: string[];
  user: User[];
  collected: string;
  givenClothDate?: Date;
  cuttingDate?: Date;
  collectDate?: Date;
}

export interface Party {
  id: number;
  party_name: string;
  Items: Item[];
}

export interface ColumnVisibility {
  partyName: boolean;
  itemId: boolean;
  itemName: boolean;
  description: boolean;
  received: boolean;
  givenDate: boolean;
  cutting: boolean;
  cuttingDate: boolean;
  collected: boolean;
  collectDate: boolean;
  sizes: boolean;
  users: boolean;
}

export interface DropdownOption {
  value: string;
  label: string;
}
export interface SizeOption {
  id: string;
  size: string;
}