'use client'

import type React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { InputCustom } from '@/components/form/input'
import { SubmitHandler, useForm } from 'react-hook-form'
import { forgotPasswordInputSchema } from '../schema'
import type { ForgotPasswordInput } from '../schema/forgot-password-schema'
import { zodResolver } from '@hookform/resolvers/zod'

export function ForgotPasswordPage() {
  const { control, handleSubmit } = useForm<ForgotPasswordInput>({
    defaultValues: {
      email: '',
      username: ''
    },
    resolver: zodResolver(forgotPasswordInputSchema)
  })


  const onSubmit: SubmitHandler<ForgotPasswordInput> = (data) => {
    console.log(data)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md bg-white shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Quên mật khẩu
          </CardTitle>
          <CardDescription>
            Nhập thông tin tài khoản để lấy lại mật khẩu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>SLSL</AlertDescription>
          </Alert> */}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="space-y-3">
              <InputCustom
                control={control}
                name='username'
                id="username"
                placeholder="Nhập tên đăng nhập"
                label="Tên đăng nhập"
              />
              <InputCustom
                control={control}
                name='email'
                type="email"
                placeholder="Nhập email"
                label="Email"
              />
              <Button type="submit" className="w-full">
                Gửi yêu cầu
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
