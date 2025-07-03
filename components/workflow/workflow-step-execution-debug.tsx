'use client'

import { useEffect } from 'react'

interface WorkflowStepExecutionDebugProps {
  currentStep: any
  workflowSteps: any[]
}

export function WorkflowStepExecutionDebug({
  currentStep,
  workflowSteps
}: WorkflowStepExecutionDebugProps) {
  useEffect(() => {
    console.log('🔍 Current step data:', currentStep)
    console.log('🔍 Current step allowedUsers:', currentStep?.allowedUsers)
    console.log('🔍 All workflow steps:', workflowSteps)
  }, [currentStep, workflowSteps])

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
      <h3 className="font-semibold text-yellow-800">Debug Info</h3>
      <div className="text-sm text-yellow-700 mt-2">
        <p>Current Step ID: {currentStep?.id}</p>
        <p>Current Step Name: {currentStep?.name}</p>
        <p>AllowedUsers: {JSON.stringify(currentStep?.allowedUsers || [])}</p>
        <p>AssigneeRole: {currentStep?.assigneeRole}</p>
      </div>
    </div>
  )
}
