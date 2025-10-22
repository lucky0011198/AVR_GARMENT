

// // atoms/partiesAtom.ts
// import { atom } from 'jotai';
// import { splitAtom } from 'jotai/utils';



// // types.ts
// export interface User {
//     id: string;
//     name: string;
//   }
  
//   export interface Item {
//     id: string;
//     name: string;
//     recived: string;
//     cuttting: string;
//     sizes: string[];
//     user: User[];
//     collected: string;
//     description?: string;
//   }
  
//   export interface Party {
//     id: number;
//     party_name: string;
//     items: Item[];
//   }
  
//   export type PartiesArray = Party[];

  
//   const initialPartiesData: PartiesArray = [
//     {
//       id: 1,
//       party_name: "name",
//       items: [
//         {
//           id: "10001",
//           name: "panjabi",
//           description:"this is a good panjabi",
//           recived: "8000m",
//           cuttting: "1000m",
//           sizes: ["34:10", "34:12", "34:14"],
//           user: [
//             { name: "user1", id: "1" },
//             { name: "user2", id: "2" },
//             { name: "user3", id: "3" }
//           ],
//           collected: "3000:200"
//         },
//         {
//           id: "10092",
//           name: "pinako",
//           description:"this is a good panjabi",
//           recived: "8070m",
//           cuttting: "1000m",
//           sizes: ["34:10", "34:12", "34:14"],
//           user: [
//             { name: "user1", id: "1" },
//             { name: "user2", id: "2" },
//             { name: "user3", id: "3" }
//           ],
//           collected: "3000:200"
//         }
//       ]
//     },
//     {
//         id: 2,
//         party_name: "user",
//         items: [
//           {
//             id: "10001",
//             name: "panjabi",
//             description:"this is a good panjabi",
//             recived: "8000m",
//             cuttting: "1000m",
//             sizes: ["34:10", "34:12", "34:14"],
//             user: [
//               { name: "user1", id: "1" },
//               { name: "user2", id: "2" },
//               { name: "user3", id: "3" }
//             ],
//             collected: "3000:200"
//           },
//           {
//             id: "10002",
//             name: "pinako",
//             recived: "8000m",
//             cuttting: "1000m",
//             sizes: ["34:10", "34:12", "34:14"],
//             user: [
//               { name: "user1", id: "1" },
//               { name: "user2", id: "2" },
//               { name: "user3", id: "3" }
//             ],
//             collected: "3000:200"
//           }
//         ]
//     }
//   ];
  
//   // 🟢 Root atom
//   export const partiesAtom = atom<PartiesArray>(initialPartiesData);
  
//   // 🧩 Split into individual party atoms
//   export const partiesAtomsAtom = splitAtom(partiesAtom);
  
//   // 🧮 Derived atom for count
//   export const partiesCountAtom = atom((get) => get(partiesAtom).length);
  
//   // 🟡 Getter atom — get all parties
//   export const getAllPartiesAtom = atom((get) => get(partiesAtom));

//   // 🟢 Selector atom — get all party names as array
//   export const partyNamesAtom = atom((get) => {
//     const parties = get(getAllPartiesAtom);
//     return parties.map((party: any) => ({ value: party.party_name, label: party.party_name }));
//   });

  
//   // 🔵 Setter atom — replace all parties
//   export const setAllPartiesAtom = atom(
//     null,
//     (get, set, newData: PartiesArray) => set(partiesAtom, newData)
//   );
  
//   // 🟣 Find specific party by ID (getter)
//   export const getPartyByIdAtom = atom(
//     (get) => (partyId: number) => get(partiesAtom).find(p => p.id === partyId)
//   );
  
//   // 🔴 Update specific party by ID (setter)
//   export const setPartyByIdAtom = atom(
//     null,
//     (get, set, { partyId, updatedParty }: { partyId: number; updatedParty: Party }) => {
//       const updated = get(partiesAtom).map(p => 
//         p.id === partyId ? { ...p, ...updatedParty } : p
//       );
//       set(partiesAtom, updated);
//     }
//   );
  
//   // 🟢 Get all items of a party
//   export const getItemsByPartyIdAtom = atom(
//     (get) => (partyId: number) => {
//       const party = get(partiesAtom).find(p => p.id === partyId);
//       return party ? party.items : [];
//     }
//   );
  
//   // 🟠 Update item by partyId and itemId
//   export const setItemByIdAtom = atom(
//     null,
//     (get, set, { partyId, itemId, updatedItem }: { partyId: number; itemId: string; updatedItem: Item }) => {
//       const updated = get(partiesAtom).map(party => {
//         if (party.id !== partyId) return party;
//         return {
//           ...party,
//           items: party?.items?.map(item =>
//             item.id === itemId ? { ...item, ...updatedItem } : item
//           )
//         };
//       });
//       set(partiesAtom, updated);
//     }
//   );
  
//   // 🔵 Get users of a specific item
//   export const getUsersByItemIdAtom = atom(
//     (get) => (partyId: number, itemId: string) => {
//       const party = get(partiesAtom).find(p => p.id === partyId);
//       const item = party?.items.find(i => i.id === itemId);
//       return item?.user || [];
//     }
//   );
  
//   // 🟢 Update user in specific item
//   export const setUserByIdAtom = atom(
//     null,
//     (get, set, { partyId, itemId, userId, updatedUser }: {
//       partyId: number;
//       itemId: string;
//       userId: string;
//       updatedUser: User;
//     }) => {
//       const updated = get(partiesAtom).map(party => {
//         if (party.id !== partyId) return party;
//         return {
//           ...party,
//           items: party?.items?.map(item => {
//             if (item.id !== itemId) return item;
//             return {
//               ...item,
//               user: item.user.map(u => (u.id === userId ? { ...u, ...updatedUser } : u))
//             };
//           })
//         };
//       });
//       set(partiesAtom, updated);
//     }
//   );