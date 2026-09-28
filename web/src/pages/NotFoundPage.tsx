import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'

export function NotFoundPage() {
  return (
    <div>
      <PageHeader title="Page not found" />
      <Link to="/" className="text-sm underline">
        Back to dashboard
      </Link>
    </div>
  )
}
