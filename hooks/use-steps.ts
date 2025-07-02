"use client"

import { useState, useCallback } from "react"

interface Step {
  id: string
  name: string
  description?: string
  [key: string]: any
}

export function useSteps() {
  const [selectedSteps, setSelectedSteps] = useState<Step[]>([])

  const toggleStep = useCallback((stepId: string) => {
    setSelectedSteps((prevSelectedSteps) => {
      const stepIndex = prevSelectedSteps.findIndex((step) => step.id === stepId)

      if (stepIndex > -1) {
        // Nếu bước đã được chọn, loại bỏ nó
        return prevSelectedSteps.filter((step) => step.id !== stepId)
      } else {
        // Nếu bước chưa được chọn, thêm nó vào
        // Lưu ý: Chúng ta cần tìm thông tin đầy đủ của bước từ nguồn dữ liệu
        // Trong trường hợp này, chúng ta chỉ thêm ID vì component gọi hook sẽ xử lý phần còn lại
        return [...prevSelectedSteps, { id: stepId } as Step]
      }
    })
  }, [])

  const selectSteps = useCallback((steps: Step[]) => {
    setSelectedSteps(steps)
  }, [])

  const clearSelectedSteps = useCallback(() => {
    setSelectedSteps([])
  }, [])

  return {
    selectedSteps,
    toggleStep,
    selectSteps,
    clearSelectedSteps,
  }
}
