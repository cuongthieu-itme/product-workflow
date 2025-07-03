'use client'

import type React from 'react'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { Input } from '@/components/ui/input'

interface SubWorkflowListProps {
  workflows: any[] // Replace 'any' with a more specific type if possible
}

export const SubWorkflowList: React.FC<SubWorkflowListProps> = ({
  workflows
}) => {
  const [search, setSearch] = useState('')

  const filteredWorkflows = workflows.filter((workflow) =>
    workflow.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm quy trình…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {filteredWorkflows.length > 0 ? (
        <ul>
          {filteredWorkflows.map((workflow) => (
            <li key={workflow.id}>{workflow.name}</li>
          ))}
        </ul>
      ) : (
        <p>Không tìm thấy quy trình nào.</p>
      )}
    </div>
  )
}

export default SubWorkflowList
