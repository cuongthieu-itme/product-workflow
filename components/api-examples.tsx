'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CopyIcon, CheckIcon } from 'lucide-react'

export function ApiExamples() {
  const [copiedExample, setCopiedExample] = useState<string | null>(null)

  const copyToClipboard = (text: string, exampleId: string) => {
    navigator.clipboard.writeText(text)
    setCopiedExample(exampleId)
    setTimeout(() => setCopiedExample(null), 2000)
  }

  const examples = [
    {
      id: 'fetch-products',
      title: 'Lấy danh sách sản phẩm',
      description: 'Ví dụ về cách lấy danh sách sản phẩm với JavaScript',
      code: `// Sử dụng Fetch API
async function getProducts() {
  try {
    const response = await fetch('https://your-domain.com/api/products', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Products:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
}

// Gọi hàm
getProducts().then(products => {
  // Xử lý dữ liệu sản phẩm
});`
    },
    {
      id: 'create-product',
      title: 'Tạo sản phẩm mới',
      description: 'Ví dụ về cách tạo sản phẩm mới với JavaScript',
      code: `// Sử dụng Fetch API
async function createProduct(productData) {
  try {
    const response = await fetch('https://your-domain.com/api/products', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Created product:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

// Gọi hàm với dữ liệu sản phẩm
const newProduct = {
  name: "Ghế Ergonomic Pro Plus",
  description: "Phiên bản nâng cấp của ghế văn phòng ergonomic",
  status: "draft",
  departments: ["product", "design"]
};

createProduct(newProduct).then(product => {
  // Xử lý sản phẩm đã tạo
});`
    },
    {
      id: 'update-product-step',
      title: 'Cập nhật trạng thái bước trong quy trình',
      description:
        'Ví dụ về cách cập nhật trạng thái của một bước trong quy trình phát triển sản phẩm',
      code: `// Sử dụng Fetch API
async function updateProductStep(productId, stepData) {
  try {
    const response = await fetch(\`https://your-domain.com/api/products/\${productId}/steps\`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stepData)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Updated step:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error updating product step:', error);
    throw error;
  }
}

// Gọi hàm với dữ liệu bước
const productId = "1";
const stepData = {
  stepId: "step3",
  status: "completed"
};

updateProductStep(productId, stepData).then(result => {
  // Xử lý kết quả
  console.log('Updated step:', result.step);
  console.log('Updated product:', result.product);
});`
    },
    {
      id: 'create-notification',
      title: 'Tạo thông báo mới',
      description: 'Ví dụ về cách tạo thông báo mới cho các phòng ban',
      code: `// Sử dụng Fetch API
async function createNotification(notificationData) {
  try {
    const response = await fetch('https://your-domain.com/api/notifications', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(notificationData)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Created notification:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
}

// Gọi hàm với dữ liệu thông báo
const newNotification = {
  title: "Yêu cầu phê duyệt thiết kế",
  message: "Sản phẩm 'Ghế Ergonomic Pro Plus' cần được phê duyệt thiết kế",
  productId: "1",
  departments: ["design"]
};

createNotification(newNotification).then(notification => {
  // Xử lý thông báo đã tạo
});`
    },
    {
      id: 'generate-report',
      title: 'Tạo báo cáo mới',
      description:
        'Ví dụ về cách tạo báo cáo mới về tiến độ phát triển sản phẩm',
      code: `// Sử dụng Fetch API
async function createReport(reportData) {
  try {
    const response = await fetch('https://your-domain.com/api/reports', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_TOKEN_HERE',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(reportData)
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const data = await response.json();
    console.log('Created report:', data.data);
    return data.data;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
}

// Gọi hàm với dữ liệu báo cáo
const newReport = {
  title: "Báo cáo tiến độ phát triển sản phẩm Q3/2023",
  type: "product",
  data: {
    totalProducts: 30,
    newProducts: 10,
    inDevelopment: 15,
    launched: 5,
    byDepartment: {
      product: 30,
      design: 25,
      marketing: 12,
      sales: 8,
      operations: 10
    },
    byStatus: {
      draft: 5,
      review: 3,
      design: 7,
      production: 5,
      marketing: 5,
      launch: 3,
      completed: 2
    }
  }
};

createReport(newReport).then(report => {
  // Xử lý báo cáo đã tạo
});`
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ví dụ sử dụng API</CardTitle>
        <CardDescription>
          Các ví dụ về cách sử dụng API của ProductFlow với JavaScript
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={examples[0].id} className="w-full">
          <TabsList className="mb-4 flex h-auto flex-wrap">
            {examples.map((example) => (
              <TabsTrigger key={example.id} value={example.id}>
                {example.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {examples.map((example) => (
            <TabsContent key={example.id} value={example.id}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium">{example.title}</h3>
                    <p className="text-muted-foreground">
                      {example.description}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => copyToClipboard(example.code, example.id)}
                  >
                    {copiedExample === example.id ? (
                      <>
                        <CheckIcon className="h-4 w-4" /> Đã sao chép
                      </>
                    ) : (
                      <>
                        <CopyIcon className="h-4 w-4" /> Sao chép
                      </>
                    )}
                  </Button>
                </div>
                <pre className="overflow-auto rounded-md bg-muted p-4 text-sm">
                  {example.code}
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
