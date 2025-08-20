// 'use client'

// import { useMemo } from 'react'
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Legend,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis
// } from 'recharts'
// import { useRequest } from '@/components/requests/request-context-firebase'

// export default function RequestStatusChart() {
//   const { requests, loading } = useRequest()

//   const chartData = useMemo(() => {
//     if (loading || !requests.length) {
//       return []
//     }

//     // Tạo dữ liệu cho 6 tháng gần nhất
//     const now = new Date()
//     const months = []

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
//       const monthName = `Tháng ${date.getMonth() + 1}`

//       // Lọc requests theo tháng
//       const monthRequests = requests.filter((request) => {
//         const createdAt = new Date(request.createdAt)
//         return (
//           createdAt.getMonth() === date.getMonth() &&
//           createdAt.getFullYear() === date.getFullYear()
//         )
//       })

//       // Phân loại theo trạng thái
//       let inProgress = 0
//       let completed = 0
//       let rejectedOrPostponed = 0
//       let pending = 0

//       monthRequests.forEach((request) => {
//         if (request.workflowSteps && request.workflowSteps.length > 0) {
//           const allStepsCompleted = request.workflowSteps.every(
//             (step) => step.status === 'completed'
//           )
//           const hasRejectedStep = request.workflowSteps.some(
//             (step) => step.status === 'skipped'
//           )
//           const currentStep = request.workflowSteps.find(
//             (step) => step.stepOrder === request.currentStepOrder
//           )

//           if (allStepsCompleted) {
//             completed++
//           } else if (hasRejectedStep) {
//             rejectedOrPostponed++
//           } else if (currentStep && currentStep.status === 'in_progress') {
//             inProgress++
//           } else {
//             pending++
//           }
//         } else {
//           pending++
//         }
//       })

//       months.push({
//         name: monthName,
//         'Đang xử lý': inProgress + pending, // Gộp chờ xử lý vào đang xử lý
//         'Hoàn thành': completed,
//         'Từ chối/Tạm hoãn': rejectedOrPostponed
//       })
//     }

//     return months
//   }, [requests, loading])

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-[350px]">
//         <p className="text-muted-foreground">Đang tải dữ liệu...</p>
//       </div>
//     )
//   }

//   return (
//     <ResponsiveContainer width="100%" height={350}>
//       <BarChart data={chartData}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="name" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="Đang xử lý" fill="#3b82f6" />
//         <Bar dataKey="Hoàn thành" fill="#10b981" />
//         <Bar dataKey="Từ chối/Tạm hoãn" fill="#f59e0b" />
//       </BarChart>
//     </ResponsiveContainer>
//   )
// }

export const RequestStatusChart = () => {
  return <div></div>;
};
