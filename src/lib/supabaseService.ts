import { partiesAtom } from '@/store/atoms';
import { supabase } from './supabase';
import type { item, Party } from '@/types';
import { useAtom } from 'jotai';


// Fetch all parties with their items
export async function fetchAllParties(): Promise<Party[]> {
  const [,setParties] = useAtom(partiesAtom);

  console.log('🔍 Fetching parties from Supabase...');
  
  const { data: partiesData, error: partiesError } = await supabase
    .from('parties')
    .select('*')
    .order('id', { ascending: true });

  if (partiesError) {
    console.error('❌ Error fetching parties:', partiesError);
    throw partiesError;
  }

  console.log('✅ Parties fetched from Supabase:', partiesData);

  if (!partiesData || partiesData.length === 0) {
    console.warn('⚠️ No parties found in database');
    return [];
  }

  // Transform the data to match our Party interface
  const parties: Party[] = partiesData.map((party: any) => {
    // Parse items if it's a string, otherwise use as-is
    let items: item[] = [];
    
    if (party.item) {
      try {
        // If item is a string, parse it
        items = typeof party.item === 'string' 
          ? JSON.parse(party.item) 
          : party.item;
        
        // Add _internalId to each item if it doesn't exist
        items = items.map((item: any, index: number) => ({
          ...item,
          _internalId: item._internalId || `item-${party.id}-${item.id || index}`,
          // Ensure dates are Date objects
          givenClothDate: item.givenClothDate ? new Date(item.givenClothDate) : undefined,
          cuttingDate: item.cuttingDate ? new Date(item.cuttingDate) : undefined,
          collectDate: item.collectDate ? new Date(item.collectDate) : undefined,
        }));
      } catch (e) {
        console.error('❌ Error parsing items for party:', party.id, e);
        items = [];
      }
    }

    return {
      id: party.id,
      party_name: party.party_name,
      items: items, // ← Always uppercase
    };
  });

  console.log('🎉 Normalized parties data:', parties);
  setParties(parties);
  return parties;
}

// Save a single party
export async function saveParty(party: Party): Promise<void> {
  console.log('💾 Saving party:', party.party_name);
  
  // Get items from either items or items (for compatibility)
  const items = party.items || (party as any).items || [];
  
  // Remove _internalId from items before saving
  const itemsToSave = items.map((item: any) => {
    const { _internalId, ...itemWithoutInternal } = item;
    return itemWithoutInternal;
  });

  // Upsert party with items as JSON
  const { data, error } = await supabase
    .from('parties')
    .upsert({
      id: party.id,
      party_name: party.party_name,
      item: itemsToSave, // Store as JSON
    })
    .select();

  if (error) {
    console.error('❌ Error saving party:', error);
    throw error;
  }

  console.log('✅ Party saved:', data);
}

// Save all parties
export async function saveAllParties(parties: Party[]): Promise<void> {
  console.log('💾 Bulk saving all parties:', parties.length);
  
  for (const party of parties) {
    await saveParty(party);
  }
  
  console.log('✅ All parties saved successfully');
}

// Delete a party
export async function deleteParty(partyId: number): Promise<void> {
  console.log('🗑️ Deleting party:', partyId);
  
  const { error } = await supabase
    .from('parties')
    .delete()
    .eq('id', partyId);

  if (error) {
    console.error('❌ Error deleting party:', error);
    throw error;
  }

  console.log('✅ Party deleted');
}

// Add a new party
export async function addParty(partyName: string): Promise<Party> {
  console.log('➕ Adding new party:', partyName);
  
  const { data, error } = await supabase
    .from('parties')
    .insert({ 
      party_name: partyName,
      item: [] // Empty items array
    })
    .select()
    .single();

  if (error) {
    console.error('❌ Error adding party:', error);
    throw error;
  }

  console.log('✅ Party added:', data);

  return {
    id: data.id,
    party_name: data.party_name,
    items: [],
  };
}

// Delete an item from a party
export async function deleteItem(partyId: number, itemId: string): Promise<void> {
  console.log('🗑️ Deleting item:', itemId, 'from party:', partyId);
  
  // Fetch the party
  const { data: party, error: fetchError } = await supabase
    .from('parties')
    .select('*')
    .eq('id', partyId)
    .single();

  if (fetchError || !party) {
    console.error('❌ Error fetching party:', fetchError);
    throw fetchError;
  }

  // Parse items
  const items = typeof party.item === 'string' 
    ? JSON.parse(party.item) 
    : (party.item || []);

  // Filter out the item to delete
  const updatedItems = items.filter((item: any) => item.id !== itemId);

  // Update the party
  const { error: updateError } = await supabase
    .from('parties')
    .update({ item: updatedItems })
    .eq('id', partyId);

  if (updateError) {
    console.error('❌ Error updating party:', updateError);
    throw updateError;
  }

  console.log('✅ Item deleted');
}
