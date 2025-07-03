'use client'

import type React from 'react'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { RequestForm } from './request-form'
import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import { SubWorkflowProvider } from '@/components/workflow/sub-workflow-context-firebase'
import { ProductStatusProvider } from '@/components/product-status/product-status-context'
import { StandardWorkflowProvider } from '@/components/workflow/standard-workflow-context-firebase'

interface RequestDialogProps {
  trigger?: React.ReactNode
  title?: string
  description?: string
  onSuccess?: () => void
}

export function RequestDialog({
  trigger,
  title = 'Tạo yêu cầu mới',
  description = 'Điền thông tin để tạo yêu cầu mới.',
  onSuccess
}: RequestDialogProps) {
  const [open, setOpen] = useState(false)

  const handleSuccess = () => {
    setOpen(false)
    if (onSuccess) {
      onSuccess()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo yêu cầu mới
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <StandardWorkflowProvider>
          <ProductStatusProvider>
            <SubWorkflowProvider>
              <RequestForm onSuccess={handleSuccess} inDialog={true} />
            </SubWorkflowProvider>
          </ProductStatusProvider>
        </StandardWorkflowProvider>
      </DialogContent>
    </Dialog>
  )
}
