import { ResetPassword } from "@/features/auth/components";
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
