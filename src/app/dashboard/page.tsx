import { DataTable } from "@/components/data-table"

import data from "./data.json"

export default function Page() {
  return (
    <div className="flex flex-1 flex-col p-10">
       <DataTable data={data} />
    </div>
  )
}
