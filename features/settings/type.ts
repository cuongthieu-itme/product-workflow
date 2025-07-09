import { UserRoleEnum } from "../auth/constants"
import { DepartmentType } from "../departments/type"

export type CurrentUserType = {
    id: number,
    fullName: string,
    userName: string,
    email: string,
    phoneNumber: string,
    avatar: string,
    isVerifiedAccount: boolean,
    verifiedDate: string,
    createdAt: string,
    role: UserRoleEnum,
    lastLoginDate: string,
    department: DepartmentType
}