'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Check, ChevronsUpDown, Plus, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRequest, type DataSource } from './request-context'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
  company?: string
}

interface Department {
  id: string
  name: string
  description?: string
  manager?: string
  email?: string
  phone?: string
}

interface EnhancedDataSourceSelectorProps {
  selectedDataSource: DataSource | null
  onSelectDataSource: (dataSource: DataSource) => void
}

export function EnhancedDataSourceSelector({
  selectedDataSource,
  onSelectDataSource
}: EnhancedDataSourceSelectorProps) {
  const { dataSources, addDataSource } = useRequest()
  const [activeTab, setActiveTab] = useState<
    'customer' | 'department' | 'other'
  >('customer')
  const [showDialog, setShowDialog] = useState(false)
  const [newDataSourceName, setNewDataSourceName] = useState('')
  const [newDataSourceType, setNewDataSourceType] = useState<
    'customer' | 'department' | 'other'
  >('customer')
  const [newSpecificSource, setNewSpecificSource] = useState('')
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch departments from database
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const departmentsRef = collection(db, 'departments')
        const snapshot = await getDocs(departmentsRef)
        const departmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Department[]
        setDepartments(departmentsData)
      } catch (error) {
        console.error('Error fetching departments:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // Fetch customers from database
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoading(true)
      try {
        const customersRef = collection(db, 'customers')
        const snapshot = await getDocs(customersRef)
        const customersData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        })) as Customer[]
        setCustomers(customersData)
      } catch (error) {
        console.error('Error fetching customers:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  // Handle adding new data source
  const handleAddDataSource = () => {
    if (newDataSourceName.trim()) {
      if (newDataSourceType === 'other' && !newSpecificSource.trim()) {
        alert("Please enter a specific source for 'Other' type")
        return
      }

      const newDataSource: Omit<DataSource, 'id'> = {
        type: newDataSourceType,
        name: newDataSourceName.trim()
      }

      if (newDataSourceType === 'other') {
        newDataSource.specificSource = newSpecificSource.trim()
      }

      const newId = addDataSource(newDataSource)

      onSelectDataSource({
        ...newDataSource,
        id: newId
      })

      setNewDataSourceName('')
      setNewSpecificSource('')
      setShowDialog(false)
    }
  }

  // Convert departments to data sources
  const departmentDataSources: DataSource[] = departments.map((dept) => ({
    id: `dept_${dept.id}`,
    type: 'department',
    name: dept.name
  }))

  // Convert customers to data sources
  const customerDataSources: DataSource[] = customers.map((customer) => ({
    id: `customer_${customer.id}`,
    type: 'customer',
    name: customer.name,
    customerId: customer.id // Thêm customerId để liên kết
  }))

  // Combine all data sources
  const allDataSources = [
    ...(dataSources || []),
    ...customerDataSources,
    ...departmentDataSources
  ]

  // Filter data sources by type
  const customerSources = allDataSources.filter(
    (source) => source.type === 'customer'
  )
  const departmentSources = allDataSources.filter(
    (source) => source.type === 'department'
  )
  const otherSources = allDataSources.filter(
    (source) => source.type === 'other'
  )

  // Get sources based on active tab
  const getActiveSources = () => {
    switch (activeTab) {
      case 'customer':
        return customerSources
      case 'other':
        return otherSources
      default:
        return customerSources // Default to customer instead of empty
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant={activeTab === 'customer' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setActiveTab('customer')}
        >
          <Users className="mr-2 h-4 w-4" />
          Khách hàng
        </Button>
        <Button
          type="button"
          variant={activeTab === 'other' ? 'default' : 'outline'}
          className="flex-1"
          onClick={() => setActiveTab('other')}
        >
          <Users className="mr-2 h-4 w-4" />
          Khác
        </Button>
      </div>

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedDataSource
                ? selectedDataSource.name
                : `Chọn ${activeTab === 'customer' ? 'khách hàng' : 'nguồn khác'}`}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0">
            <Command>
              <CommandInput
                placeholder={`Tìm ${activeTab === 'customer' ? 'khách hàng' : 'nguồn khác'}`}
                value={searchValue}
                onValueChange={setSearchValue}
              />
              <CommandList>
                <CommandEmpty>
                  {loading ? 'Đang tải...' : 'Không tìm thấy kết quả'}
                </CommandEmpty>
                <CommandGroup>
                  {getActiveSources()
                    .filter((source) =>
                      source.name
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                    )
                    .map((source) => (
                      <CommandItem
                        key={source.id}
                        value={source.id}
                        onSelect={() => {
                          onSelectDataSource(source)
                          setOpen(false)
                        }}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            selectedDataSource?.id === source.id
                              ? 'opacity-100'
                              : 'opacity-0'
                          )}
                        />
                        {source.name}
                        {source.specificSource && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            ({source.specificSource})
                          </span>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button type="button" variant="outline" className="shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Thêm mới
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {activeTab === 'customer'
                  ? 'Thêm khách hàng mới'
                  : activeTab === 'department'
                    ? 'Thêm phòng ban mới'
                    : 'Thêm nguồn khác'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="newDataSourceName">
                  {activeTab === 'customer'
                    ? 'Tên khách hàng'
                    : activeTab === 'department'
                      ? 'Tên phòng ban'
                      : 'Tên nguồn'}
                </Label>
                <Input
                  id="newDataSourceName"
                  value={newDataSourceName}
                  onChange={(e) => setNewDataSourceName(e.target.value)}
                  placeholder={`Nhập ${activeTab === 'customer' ? 'tên khách hàng' : activeTab === 'department' ? 'tên phòng ban' : 'tên nguồn'}`}
                />
              </div>
              {activeTab === 'other' && (
                <div className="space-y-2">
                  <Label htmlFor="newSpecificSource">Nguồn cụ thể</Label>
                  <Input
                    id="newSpecificSource"
                    value={newSpecificSource}
                    onChange={(e) => setNewSpecificSource(e.target.value)}
                    placeholder="Nhập nguồn cụ thể"
                    required
                  />
                </div>
              )}
              <Button
                type="button"
                onClick={() => {
                  setNewDataSourceType(activeTab)
                  handleAddDataSource()
                }}
              >
                Thêm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Hiển thị thông tin chi tiết của nguồn dữ liệu đã chọn */}
      {selectedDataSource && (
        <div className="p-3 bg-blue-50 rounded-md border">
          <div className="text-sm font-medium text-blue-900">
            Nguồn đã chọn:
          </div>
          <div className="text-sm text-blue-700">{selectedDataSource.name}</div>
          {selectedDataSource.specificSource && (
            <div className="text-xs text-blue-600 mt-1">
              Nguồn cụ thể: {selectedDataSource.specificSource}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
