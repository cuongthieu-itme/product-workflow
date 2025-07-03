'use client'

import { useState, useEffect } from 'react'
import RequestsList from '@/components/requests/requests-list'
import { useToast } from '@/hooks/use-toast'
import { RequestProvider } from '@/components/requests/request-context'
import { WorkflowProcessProvider } from '@/components/workflow/workflow-process-context'
import { SubWorkflowProvider } from '@/components/workflow/sub-workflow-context-firebase'
import { ProductStatusProvider } from '@/components/product-status/product-status-context'
import { StandardWorkflowProvider } from '@/components/workflow/standard-workflow-context-firebase'
import { MaterialProvider } from '@/components/materials/material-context'
import { WorkflowProvider } from '@/components/workflow-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RequestKanban } from '@/components/requests/request-kanban'

export function RequestsPageClient() {
  const { toast } = useToast()
  const [justAdded, setJustAdded] = useState(false)
  const [lastCreatedId, setLastCreatedId] = useState<string | null>(null)

  // Giả định thông tin người dùng đăng nhập
  const currentUser = {
    id: 'user1',
    name: 'Nguyễn Văn A'
  }

  useEffect(() => {
    const requestJustAdded = localStorage.getItem('requestJustAdded')
    const lastId = localStorage.getItem('lastCreatedRequestId')

    if (requestJustAdded === 'true') {
      setJustAdded(true)
      if (lastId) {
        setLastCreatedId(lastId)
      }
      localStorage.removeItem('requestJustAdded')

      toast({
        title: 'Thành công',
        description: 'Đã tạo yêu cầu mới thành công'
      })
    }
  }, [toast])

  const handleSuccess = () => {
    toast({
      title: 'Thành công',
      description: 'Đã tạo yêu cầu mới thành công'
    })
    setJustAdded(true)
  }

  return (
    <WorkflowProvider>
      <ProductStatusProvider>
        <SubWorkflowProvider>
          <StandardWorkflowProvider>
            <WorkflowProcessProvider>
              <MaterialProvider>
                <RequestProvider>
                  <div className="space-y-4">
                    <h2 className="text-2xl font-bold">Danh sách yêu cầu</h2>
                    <Tabs defaultValue="list" className="w-full">
                      <TabsList>
                        <TabsTrigger value="list">Danh sách</TabsTrigger>
                        <TabsTrigger value="kanban">Kanban</TabsTrigger>
                      </TabsList>
                      <TabsContent value="list" className="mt-4">
                        <RequestsList />
                      </TabsContent>
                      <TabsContent value="kanban" className="mt-4">
                        <RequestKanban />
                      </TabsContent>
                    </Tabs>
                  </div>
                </RequestProvider>
              </MaterialProvider>
            </WorkflowProcessProvider>
          </StandardWorkflowProvider>
        </SubWorkflowProvider>
      </ProductStatusProvider>
    </WorkflowProvider>
  )
}
