import { DataTable } from "@/components/data-table"

import data from "./data.json"
import { partiesAtom, partyNamesAtom } from "@/atom/partyAtom";
import { useAtomValue } from "jotai";

export default function Page() {
  const parties = useAtomValue(partiesAtom);

  return (
    <div className="flex flex-1 flex-col p-10">
       <DataTable data={parties as any[]} />
    </div>
  )
}
