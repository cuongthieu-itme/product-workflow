// "use client";

// import { useMemo } from "react";
// import {
//   Bar,
//   BarChart,
//   CartesianGrid,
//   Legend,
//   ResponsiveContainer,
//   Tooltip,
//   XAxis,
//   YAxis,
// } from "recharts";
// import { useRequest } from "@/components/requests/request-context-firebase";

// export function Overview() {
//   const { requests, loading } = useRequest();

//   const chartData = useMemo(() => {
//     if (loading || !requests.length) {
//       return [];
//     }

//     // Tạo dữ liệu cho 6 tháng gần nhất
//     const now = new Date();
//     const months = [];

//     for (let i = 5; i >= 0; i--) {
//       const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
//       const monthName = `Tháng ${date.getMonth() + 1}`;
//       months.push({
//         name: monthName,
//         month: date.getMonth() + 1,
//         year: date.getFullYear(),
//         "Đang xử lý": 0,
//         "Hoàn thành": 0,
//         "Từ chối/Tạm hoãn": 0,
//       });
//     }

//     // Phân loại requests theo tháng và trạng thái
//     requests.forEach((request) => {
//       const createdDate = new Date(request.createdAt);
//       const requestMonth = createdDate.getMonth() + 1;
//       const requestYear = createdDate.getFullYear();

//       const monthData = months.find(
//         (m) => m.month === requestMonth && m.year === requestYear
//       );
//       if (monthData) {
//         // Xác định trạng thái dựa trên workflow steps
//         if (request.workflowSteps && request.workflowSteps.length > 0) {
//           const allStepsCompleted = request.workflowSteps.every(
//             (step) => step.status === "completed"
//           );
//           const hasRejectedStep = request.workflowSteps.some(
//             (step) => step.status === "skipped"
//           );

//           if (allStepsCompleted) {
//             monthData["Hoàn thành"]++;
//           } else if (hasRejectedStep) {
//             monthData["Từ chối/Tạm hoãn"]++;
//           } else {
//             monthData["Đang xử lý"]++;
//           }
//         } else {
//           monthData["Đang xử lý"]++;
//         }
//       }
//     });

//     return months;
//   }, [requests, loading]);

//   if (loading) {
//     return (
//       <div className="h-[350px] flex items-center justify-center">
//         <p className="text-muted-foreground">Đang tải dữ liệu...</p>
//       </div>
//     );
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
//   );
// }

export const Overview = () => {
  return <div></div>;
};
