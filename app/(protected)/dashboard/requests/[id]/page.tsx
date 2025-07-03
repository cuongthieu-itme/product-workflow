import { RequestDetailPageClient } from './request-detail-page-client'

export default function RequestDetailPage({
  params
}: {
  params: { id: string }
}) {
  return <RequestDetailPageClient id={params.id} />
}
