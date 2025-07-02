import { EditRequestPageClient } from "./edit-request-page-client"

export default function EditRequestPage({ params }: { params: { id: string } }) {
  return <EditRequestPageClient id={params.id} />
}
