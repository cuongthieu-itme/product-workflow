'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react'
import {
  checkWorkflowCollections,
  initializeWorkflowCollections,
  checkFirebaseAccess
} from '@/lib/firebase-workflow-debug'
import { collection, getDocs, query, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export function WorkflowDebug() {
  const [loading, setLoading] = useState(true)
  const [initializing, setInitializing] = useState(false)
  const [collections, setCollections] = useState<
    Record<string, { exists: boolean; count: number; error?: string }>
  >({})
  const [access, setAccess] = useState<{
    read?: boolean
    write?: boolean
    error?: string
  }>({})
  const [activeTab, setActiveTab] = useState('status')
  const [collectionData, setCollectionData] = useState<Record<string, any[]>>(
    {}
  )
  const [selectedCollection, setSelectedCollection] = useState('')

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    setLoading(true)
    try {
      // Kiểm tra quyền truy cập
      const accessResult = await checkFirebaseAccess()
      setAccess(accessResult)

      // Kiểm tra các collection
      const collectionsResult = await checkWorkflowCollections()
      setCollections(collectionsResult)
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeCollections = async () => {
    setInitializing(true)
    try {
      const initialized = await initializeWorkflowCollections()
      if (initialized.length > 0) {
        await checkStatus() // Refresh status after initialization
      }
    } catch (error) {
      console.error('Error initializing collections:', error)
    } finally {
      setInitializing(false)
    }
  }

  const loadCollectionData = async (collectionName: string) => {
    setLoading(true)
    try {
      const collectionRef = collection(db, collectionName)
      const q = query(collectionRef, limit(10)) // Limit to 10 documents for performance
      const snapshot = await getDocs(q)

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))

      setCollectionData((prev) => ({ ...prev, [collectionName]: data }))
      setSelectedCollection(collectionName)
      setActiveTab('data')
    } catch (error) {
      console.error(`Error loading data from ${collectionName}:`, error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" /> Workflow Database Debug
        </CardTitle>
        <CardDescription>
          Kiểm tra và khắc phục vấn đề kết nối với cơ sở dữ liệu quy trình
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="status">Trạng thái</TabsTrigger>
            <TabsTrigger value="data">Dữ liệu</TabsTrigger>
            <TabsTrigger value="actions">Hành động</TabsTrigger>
          </TabsList>

          <TabsContent value="status">
            {loading ? (
              <div className="flex justify-center p-6">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Quyền truy cập Firebase
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">
                        {access.read ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Quyền đọc</p>
                        <p className="text-sm text-muted-foreground">
                          {access.read
                            ? 'Có thể đọc dữ liệu'
                            : 'Không thể đọc dữ liệu'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center p-3 border rounded-md">
                      <div className="mr-3">
                        {access.write ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">Quyền ghi</p>
                        <p className="text-sm text-muted-foreground">
                          {access.write
                            ? 'Có thể ghi dữ liệu'
                            : 'Không thể ghi dữ liệu'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {access.error && (
                    <Alert variant="destructive" className="mt-4">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Lỗi truy cập</AlertTitle>
                      <AlertDescription>{access.error}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">
                    Trạng thái các collection
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(collections).map(([name, info]) => (
                      <div
                        key={name}
                        className="flex items-center justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-center">
                          <div className="mr-3">
                            {info.exists ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{name}</p>
                            <p className="text-sm text-muted-foreground">
                              {info.exists
                                ? `${info.count} documents`
                                : 'Collection không tồn tại'}
                            </p>
                            {info.error && (
                              <p className="text-sm text-red-500">
                                {info.error}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge
                            variant={info.exists ? 'outline' : 'secondary'}
                          >
                            {info.count} docs
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadCollectionData(name)}
                            disabled={!info.exists}
                          >
                            Xem
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  {selectedCollection
                    ? `Dữ liệu trong ${selectedCollection}`
                    : 'Chọn collection để xem dữ liệu'}
                </h3>
                <div className="flex gap-2">
                  <select
                    className="border rounded-md px-3 py-1"
                    value={selectedCollection}
                    onChange={(e) => loadCollectionData(e.target.value)}
                  >
                    <option value="">Chọn collection</option>
                    {Object.entries(collections)
                      .filter(([_, info]) => info.exists)
                      .map(([name]) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                  </select>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      selectedCollection &&
                      loadCollectionData(selectedCollection)
                    }
                    disabled={!selectedCollection}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" /> Làm mới
                  </Button>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center p-6">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : selectedCollection && collectionData[selectedCollection] ? (
                <div>
                  {collectionData[selectedCollection].length === 0 ? (
                    <div className="text-center p-6 border rounded-md">
                      <p className="text-muted-foreground">
                        Không có dữ liệu trong collection này
                      </p>
                    </div>
                  ) : (
                    <div className="border rounded-md overflow-auto max-h-[400px]">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="p-2 text-left">ID</th>
                            <th className="p-2 text-left">Dữ liệu</th>
                          </tr>
                        </thead>
                        <tbody>
                          {collectionData[selectedCollection].map(
                            (doc, index) => (
                              <tr
                                key={doc.id}
                                className={index % 2 === 0 ? 'bg-muted/20' : ''}
                              >
                                <td className="p-2 border-t font-mono text-sm">
                                  {doc.id}
                                </td>
                                <td className="p-2 border-t">
                                  <pre className="text-xs overflow-auto max-h-[200px] p-2 bg-muted/30 rounded">
                                    {JSON.stringify(
                                      doc,
                                      (key, value) => {
                                        // Xử lý các đối tượng đặc biệt như Timestamp
                                        if (
                                          value &&
                                          typeof value === 'object' &&
                                          value.seconds !== undefined &&
                                          value.nanoseconds !== undefined
                                        ) {
                                          return `Timestamp: ${new Date(value.seconds * 1000).toLocaleString()}`
                                        }
                                        return value
                                      },
                                      2
                                    )}
                                  </pre>
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 border rounded-md">
                  <p className="text-muted-foreground">
                    Chọn một collection để xem dữ liệu
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="actions">
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Khởi tạo collections</CardTitle>
                  <CardDescription>
                    Tạo các collection cần thiết cho quy trình nếu chúng chưa
                    tồn tại
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Hành động này sẽ tạo các collection sau nếu chúng chưa tồn
                    tại:
                    <ul className="list-disc pl-5 mt-2">
                      <li>workflows</li>
                      <li>standardWorkflows</li>
                      <li>subWorkflows</li>
                      <li>workflowProcesses</li>
                      <li>workflowChangeHistory</li>
                      <li>availableVariables</li>
                    </ul>
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={initializeCollections}
                    disabled={initializing}
                  >
                    {initializing && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Khởi tạo collections
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Làm mới trạng thái</CardTitle>
                  <CardDescription>
                    Kiểm tra lại trạng thái kết nối và các collection
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Làm mới trạng thái để xem các thay đổi mới nhất trong cơ sở
                    dữ liệu
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    onClick={checkStatus}
                    disabled={loading}
                  >
                    {loading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Làm mới trạng thái
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
