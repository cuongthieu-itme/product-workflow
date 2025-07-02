"use client"

import { useEffect, useState } from "react"
import { RequestDetailNew } from "@/components/requests/request-detail-new"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function RequestDetailPageClient({ id }: { id: string }) {
  const [request, setRequest] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [workflowData, setWorkflowData] = useState<any>(null)
  const [standardWorkflow, setStandardWorkflow] = useState<any>(null)
  const [visibleSteps, setVisibleSteps] = useState<any[]>([])

  useEffect(() => {
    async function fetchRequest() {
      try {
        setLoading(true)
        const requestDoc = await getDoc(doc(db, "requests", id))

        if (requestDoc.exists()) {
          const requestData = { id: requestDoc.id, ...requestDoc.data() }
          setRequest(requestData)

          // Fetch workflow data if workflowProcessId exists
          if (requestData.workflowProcessId) {
            console.log("Fetching subWorkflow with ID:", requestData.workflowProcessId)
            // Get subWorkflow data
            const subWorkflowDoc = await getDoc(doc(db, "subWorkflows", requestData.workflowProcessId))
            if (subWorkflowDoc.exists()) {
              const subWorkflowData = { id: subWorkflowDoc.id, ...subWorkflowDoc.data() }
              console.log("SubWorkflow data:", subWorkflowData)
              setWorkflowData(subWorkflowData)

              // Get standard workflow data using parentWorkflowId instead of standardWorkflowId
              const parentWorkflowId = subWorkflowData.parentWorkflowId || subWorkflowData.standardWorkflowId
              if (parentWorkflowId) {
                console.log("Fetching standard workflow with parentWorkflowId:", parentWorkflowId)
                const standardWorkflowDoc = await getDoc(doc(db, "standardWorkflows", parentWorkflowId))
                if (standardWorkflowDoc.exists()) {
                  const standardWorkflowData = { id: standardWorkflowDoc.id, ...standardWorkflowDoc.data() }
                  console.log("Standard workflow data loaded:", standardWorkflowData)
                  setStandardWorkflow(standardWorkflowData)

                  // Filter visible steps based on visibleSteps from subWorkflow
                  console.log("SubWorkflow visibleSteps:", subWorkflowData.visibleSteps)
                  console.log("Standard workflow steps:", standardWorkflowData.steps)

                  if (subWorkflowData.visibleSteps && standardWorkflowData.steps) {
                    const filteredSteps = standardWorkflowData.steps
                      .filter((step: any) => subWorkflowData.visibleSteps.includes(step.id))
                      .sort((a: any, b: any) => a.order - b.order)
                    console.log("Filtered visible steps:", filteredSteps)
                    setVisibleSteps(filteredSteps)
                  } else {
                    // If no visibleSteps, show all steps
                    console.log("No visibleSteps found, showing all steps")
                    setVisibleSteps(standardWorkflowData.steps || [])
                  }
                } else {
                  console.log("Standard workflow document not found with ID:", parentWorkflowId)
                }
              } else {
                console.log("No parentWorkflowId or standardWorkflowId found in subWorkflow")
              }
            } else {
              console.log("SubWorkflow document not found with ID:", requestData.workflowProcessId)
            }
          } else {
            console.log("No workflowProcessId found in request")
          }
        } else {
          setError("Không tìm thấy yêu cầu")
        }
      } catch (err) {
        console.error("Lỗi khi tải yêu cầu:", err)
        setError("Đã xảy ra lỗi khi tải dữ liệu yêu cầu")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchRequest()
    }
  }, [id])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lỗi</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  return (
    <RequestDetailNew
      request={request}
      workflowData={workflowData}
      standardWorkflow={standardWorkflow}
      visibleSteps={visibleSteps}
    />
  )
}
