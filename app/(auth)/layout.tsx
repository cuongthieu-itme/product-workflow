import { AuthProtectedRoute } from "@/components/protected";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthProtectedRoute>{children}</AuthProtectedRoute>;
}
