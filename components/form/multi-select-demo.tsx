// Demo component để test MultiSelect
"use client";

import { useForm } from "react-hook-form";
import { MultiSelectCustom } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FormData {
  categories: string[];
  departments: number[];
  skills: string[];
}

const categoryOptions = [
  { label: "Công nghệ", value: "tech" },
  { label: "Thiết kế", value: "design" },
  { label: "Marketing", value: "marketing" },
  { label: "Bán hàng", value: "sales" },
  { label: "Nhân sự", value: "hr" },
  { label: "Tài chính", value: "finance" },
];

const departmentOptions = [
  { label: "Phòng phát triển", value: 1 },
  { label: "Phòng thiết kế", value: 2 },
  { label: "Phòng marketing", value: 3 },
  { label: "Phòng bán hàng", value: 4 },
  { label: "Phòng nhân sự", value: 5 },
];

const skillOptions = [
  { label: "React", value: "react" },
  { label: "TypeScript", value: "typescript" },
  { label: "Node.js", value: "nodejs" },
  { label: "Python", value: "python" },
  { label: "Java", value: "java" },
  { label: "Docker", value: "docker" },
  { label: "Kubernetes", value: "kubernetes" },
  { label: "AWS", value: "aws" },
  { label: "MongoDB", value: "mongodb" },
  { label: "PostgreSQL", value: "postgresql" },
];

export function MultiSelectDemo() {
  const { control, handleSubmit, watch, reset } = useForm<FormData>({
    defaultValues: {
      categories: [],
      departments: [],
      skills: [],
    },
  });

  const watchedValues = watch();

  const onSubmit = (data: FormData) => {
    console.log("Form Data:", data);
    alert("Kiểm tra console để xem dữ liệu form");
  };

  const handleReset = () => {
    reset({
      categories: [],
      departments: [],
      skills: [],
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Demo Multi Select Component</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Multi Select với string values */}
            <MultiSelectCustom
              control={control}
              name="categories"
              label="Danh mục"
              options={categoryOptions}
              placeholder="Chọn danh mục"
              searchPlaceholder="Tìm kiếm danh mục..."
              required
              maxDisplayedItems={2}
              showSelectAll={true}
              showClearAll={true}
            />

            {/* Multi Select với number values */}
            <MultiSelectCustom
              control={control}
              name="departments"
              label="Phòng ban"
              options={departmentOptions}
              placeholder="Chọn phòng ban"
              searchPlaceholder="Tìm kiếm phòng ban..."
              valueType="number"
              maxDisplayedItems={3}
              className="min-h-12"
            />

            {/* Multi Select với nhiều options và search */}
            <MultiSelectCustom
              control={control}
              name="skills"
              label="Kỹ năng"
              options={skillOptions}
              placeholder="Chọn kỹ năng"
              searchPlaceholder="Tìm kiếm kỹ năng..."
              maxDisplayedItems={4}
              clearable={true}
              noResultsText="Không tìm thấy kỹ năng phù hợp"
            />

            <div className="flex gap-4">
              <Button type="submit">Submit</Button>
              <Button type="button" variant="outline" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Preview selected values */}
      <Card>
        <CardHeader>
          <CardTitle>Giá trị đã chọn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <strong>Categories:</strong>{" "}
              {JSON.stringify(watchedValues.categories)}
            </div>
            <div>
              <strong>Departments:</strong>{" "}
              {JSON.stringify(watchedValues.departments)}
            </div>
            <div>
              <strong>Skills:</strong> {JSON.stringify(watchedValues.skills)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
