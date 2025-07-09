export const getImageUrl = (filename: string) => {
    return `${process.env.NEXT_PUBLIC_ENDPOINT_URL}/files/${filename}`;
}

export const getDepartmentRole = (userId: number, headDepartmentId?: number | null, departmentId?: number) => {
    if (!departmentId) return "Chưa có chức vụ"

    if (userId === headDepartmentId) {
        return "Trưởng phòng"
    }
    return "Nhân viên"
}