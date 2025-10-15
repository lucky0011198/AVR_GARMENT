import * as React from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import MultiSelect from "./MultiSelect"

interface ListViewProps {
  title: string
  data: Array<{ id: string; name: string } | string>
  onAddItem?: () => void
  onAddTag?: (tag: string) => void
  disableAdd?: boolean,
  type?: 'select' | 'select-Add'
}

export function ListView({ title, data, onAddItem, onAddTag, disableAdd, type }: ListViewProps) {
  const [newTag, setNewTag] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)

  const handleAddClick = () => {
    if (onAddItem) {
      onAddItem()
    } else {
      setIsAdding(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTag.trim() && onAddTag) {
      onAddTag(newTag.trim())
      setNewTag("")
      setIsAdding(false)
    }
  }

  const handleCancel = () => {
    setNewTag("")
    setIsAdding(false)
  }

  return (
    <ScrollArea className="h-auto w-48 rounded-md hover:border-gray-200 border-white border">
      <div className="p-4">
        {/* Header with title and add button */}
        <div className="flex items-center justify-between mb-4 ">
          <h4 className="text-sm leading-none font-medium">{title}</h4>
          {!disableAdd ? <Button
            variant="ghost"
            size="sm"
            onClick={handleAddClick}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>:  
          type === 'select' && (
           <MultiSelect/> 
          )
        }
        </div>

  

        {/* Add new tag form */}
        {isAdding && (
          <form onSubmit={handleSubmit} className="mb-3">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              placeholder="Enter tag name"
              className="w-full px-2 py-1 text-sm border rounded mb-2"
              autoFocus
            />
            <div className="flex gap-1">
              <Button type="submit" size="sm" className="h-6 text-xs px-2">
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="h-6 text-xs px-2"
              >
                Cancel
              </Button>
            </div>
            <Separator className="my-2" />
          </form>
        )}

        {/* List items */}
        {data.map((tag: any, index) => (
          <React.Fragment key={tag?.id || tag || index}>
            <div className="text-sm">{tag?.name || tag}</div>
            <Separator className="my-2" />
          </React.Fragment>
        ))}
      </div>
    </ScrollArea>
  )
}
