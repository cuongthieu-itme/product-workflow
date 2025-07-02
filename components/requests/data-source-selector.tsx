"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { useRequest, type DataSource } from "./request-context"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Department {
  id: string
  name: string
  description?: string
  manager?: string
  email?: string
  phone?: string
}

interface DataSourceSelectorProps {
  selectedDataSource: DataSource | null
  onSelectDataSource: (dataSource: DataSource) => void
}

export function DataSourceSelector({ selectedDataSource, onSelectDataSource }: DataSourceSelectorProps) {
  const { dataSources, addDataSource } = useRequest()
  const [showDialog, setShowDialog] = useState(false)
  const [newDataSourceName, setNewDataSourceName] = useState("")
  const [newDataSourceType, setNewDataSourceType] = useState<"customer" | "department" | "other">("customer")
  const [newSpecificSource, setNewSpecificSource] = useState("")
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)

  // Lấy danh sách phòng ban từ cơ sở dữ liệu
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true)
      try {
        const departmentsRef = collection(db, "departments")
        const snapshot = await getDocs(departmentsRef)
        const departmentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Department[]
        setDepartments(departmentsData)
      } catch (error) {
        console.error("Lỗi khi lấy danh sách phòng ban:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDepartments()
  }, [])

  // Xử lý thêm nguồn dữ liệu mới
  const handleAddDataSource = () => {
    if (newDataSourceName.trim()) {
      // Kiểm tra nếu là loại "other" thì phải có nguồn cụ thể
      if (newDataSourceType === "other" && !newSpecificSource.trim()) {
        alert("Vui lòng nhập nguồn cụ thể cho loại 'Khác'")
        return
      }

      const newDataSource: Omit<DataSource, "id"> = {
        type: newDataSourceType,
        name: newDataSourceName.trim(),
      }

      // Thêm specificSource nếu là loại "other"
      if (newDataSourceType === "other") {
        newDataSource.specificSource = newSpecificSource.trim()
      }

      const newId = addDataSource(newDataSource)

      // Tự động chọn nguồn dữ liệu vừa thêm
      onSelectDataSource({
        ...newDataSource,
        id: newId,
      })

      setNewDataSourceName("")
      setNewSpecificSource("")
      setShowDialog(false)
    }
  }

  // Chuyển đổi phòng ban thành nguồn dữ liệu
  const departmentDataSources: DataSource[] = departments.map((dept) => ({
    id: `dept_${dept.id}`,
    type: "department",
    name: dept.name,
  }))

  // Kết hợp nguồn dữ liệu từ cơ sở dữ liệu và phòng ban
  const allDataSources = [...(dataSources || []), ...departmentDataSources]

  // Phân loại nguồn dữ liệu
  const customerSources = allDataSources.filter((source) => source.type === "customer")
  const departmentSources = allDataSources.filter((source) => source.type === "department")
  const otherSources = allDataSources.filter((source) => source.type === "other")

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            {selectedDataSource ? selectedDataSource.name : "Chọn nguồn dữ liệu"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0">
          <Command>
            <CommandInput placeholder="Tìm nguồn dữ liệu..." value={searchValue} onValueChange={setSearchValue} />
            <CommandList>
              <CommandEmpty>{loading ? "Đang tải..." : "Không tìm thấy nguồn dữ liệu"}</CommandEmpty>
              {customerSources.length > 0 && (
                <CommandGroup heading="Khách hàng">
                  {customerSources
                    .filter((source) => source.name.toLowerCase().includes(searchValue.toLowerCase()))
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
                            "mr-2 h-4 w-4",
                            selectedDataSource?.id === source.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {source.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {departmentSources.length > 0 && (
                <CommandGroup heading="Phòng ban">
                  {departmentSources
                    .filter((source) => source.name.toLowerCase().includes(searchValue.toLowerCase()))
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
                            "mr-2 h-4 w-4",
                            selectedDataSource?.id === source.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {source.name}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
              {otherSources.length > 0 && (
                <CommandGroup heading="Khác">
                  {otherSources
                    .filter((source) => source.name.toLowerCase().includes(searchValue.toLowerCase()))
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
                            "mr-2 h-4 w-4",
                            selectedDataSource?.id === source.id ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {source.name}
                        {source.specificSource && (
                          <span className="ml-2 text-xs text-muted-foreground">({source.specificSource})</span>
                        )}
                      </CommandItem>
                    ))}
                </CommandGroup>
              )}
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
            <DialogTitle>Thêm nguồn dữ liệu mới</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newDataSourceType">Loại nguồn</Label>
              <Select value={newDataSourceType} onValueChange={(value) => setNewDataSourceType(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại nguồn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="customer">Khách hàng</SelectItem>
                  <SelectItem value="department">Phòng ban</SelectItem>
                  <SelectItem value="other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newDataSourceName">Tên nguồn dữ liệu</Label>
              <Input
                id="newDataSourceName"
                value={newDataSourceName}
                onChange={(e) => setNewDataSourceName(e.target.value)}
                placeholder="Nhập tên nguồn dữ liệu"
              />
            </div>
            {newDataSourceType === "other" && (
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
            <Button type="button" onClick={handleAddDataSource}>
              Thêm
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
