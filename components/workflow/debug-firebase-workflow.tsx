"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function DebugFirebaseWorkflow() {
  const [standardWorkflow, setStandardWorkflow] = useState<any>(null)
  const [subWorkflows, setSubWorkflows] = useState<any[]>([])
  const [changeHistory, setChangeHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch standard workflow
        const standardWorkflowRef = doc(db, "standardWorkflows", "standard-workflow")
        const standardWorkflowDoc = await getDoc(standardWorkflowRef)

        if (standardWorkflowDoc.exists()) {
          setStandardWorkflow({
            id: standardWorkflowDoc.id,
            ...standardWorkflowDoc.data(),
          })
        } else {
          console.log("No standard workflow found")
        }

        // Fetch sub-workflows
        const subWorkflowsRef = collection(db, "subWorkflows")
        const subWorkflowsSnapshot = await getDocs(subWorkflowsRef)

        const subWorkflowsData = subWorkflowsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setSubWorkflows(subWorkflowsData)
        console.log(`Found ${subWorkflowsData.length} sub-workflows:`, subWorkflowsData)

        // Fetch change history
        const changeHistoryRef = collection(db, "workflowChangeHistory")
        const changeHistorySnapshot = await getDocs(changeHistoryRef)

        const changeHistoryData = changeHistorySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))

        setChangeHistory(changeHistoryData)
        console.log(`Found ${changeHistoryData.length} change history records`)
      } catch (err: any) {
        console.error("Error fetching data:", err)
        setError(`Error fetching data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "N/A"

    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString()
    }

    if (timestamp.seconds) {
      return new Date(timestamp.seconds * 1000).toLocaleString()
    }

    if (timestamp instanceof Date) {
      return timestamp.toLocaleString()
    }

    return "Invalid date"
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Debug Firebase Workflow Data</h2>
        <Button onClick={handleRefresh}>Refresh Data</Button>
      </div>

      {loading && <p>Loading data...</p>}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="standard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standard">Standard Workflow</TabsTrigger>
          <TabsTrigger value="sub">Sub-Workflows ({subWorkflows.length})</TabsTrigger>
          <TabsTrigger value="history">Change History ({changeHistory.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="standard" className="space-y-4">
          {standardWorkflow ? (
            <Card>
              <CardHeader>
                <CardTitle>{standardWorkflow.name}</CardTitle>
                <CardDescription>
                  Version: {standardWorkflow.version || 1} | Created: {formatDate(standardWorkflow.createdAt)} |
                  Updated: {formatDate(standardWorkflow.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p>
                    <strong>Description:</strong> {standardWorkflow.description}
                  </p>
                  <p>
                    <strong>Steps:</strong> {standardWorkflow.steps?.length || 0}
                  </p>
                  <div className="mt-4">
                    <h3 className="text-lg font-medium mb-2">Steps:</h3>
                    <ul className="space-y-2">
                      {standardWorkflow.steps?.map((step: any, index: number) => (
                        <li key={step.id} className="border p-2 rounded-md">
                          <div className="flex justify-between">
                            <span className="font-medium">
                              {index + 1}. {step.name}
                            </span>
                            {step.isRequired && <Badge>Required</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{step.description}</p>
                          <p className="text-xs">Fields: {step.fields?.length || 0}</p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>No standard workflow found in Firestore.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="sub" className="space-y-4">
          {subWorkflows.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {subWorkflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardHeader>
                    <CardTitle>{workflow.name}</CardTitle>
                    <CardDescription>
                      Status: {workflow.statusName || "Unknown"} | Created: {formatDate(workflow.createdAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p>
                        <strong>Description:</strong> {workflow.description || "No description"}
                      </p>
                      <p>
                        <strong>Parent:</strong> {workflow.parentId || "standard-workflow"}
                      </p>
                      <p>
                        <strong>Status ID:</strong> {workflow.statusId || "N/A"}
                      </p>
                      <p>
                        <strong>Visible Steps:</strong> {workflow.visibleSteps?.length || 0}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Visible Steps:</h4>
                        <ul className="text-xs list-disc pl-5 mt-1">
                          {workflow.visibleSteps?.map((stepId: string) => (
                            <li key={stepId}>{stepId}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4 pt-2 border-t">
                        <h4 className="text-sm font-medium">Raw Data:</h4>
                        <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-auto max-h-40">
                          {JSON.stringify(workflow, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>No sub-workflows found in Firestore.</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {changeHistory.length > 0 ? (
            <div className="space-y-4">
              {changeHistory.map((history) => (
                <Card key={history.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">
                        {history.changeType === "create" && "Created"}
                        {history.changeType === "update" && "Updated"}
                        {history.changeType === "delete" && "Deleted"} {history.entityType}
                      </CardTitle>
                      <Badge
                        variant={
                          history.changeType === "create"
                            ? "default"
                            : history.changeType === "update"
                              ? "outline"
                              : "destructive"
                        }
                      >
                        {history.changeType}
                      </Badge>
                    </div>
                    <CardDescription>
                      By: {history.changedBy} | At: {formatDate(history.changedAt)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      <p className="text-sm">
                        <strong>Entity ID:</strong> {history.entityId}
                      </p>
                      <div className="mt-2">
                        <h4 className="text-sm font-medium">Changes:</h4>
                        <ul className="text-xs space-y-1 mt-1">
                          {history.changes?.map((change: any, index: number) => (
                            <li key={index} className="border-l-2 border-primary pl-2">
                              <strong>{change.field}:</strong>{" "}
                              {change.oldValue !== undefined ? (
                                <>
                                  <span className="line-through">{JSON.stringify(change.oldValue)}</span>
                                  {" → "}
                                </>
                              ) : null}
                              {JSON.stringify(change.newValue)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No Data</AlertTitle>
              <AlertDescription>No change history found in Firestore.</AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
