import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'

export function NotFoundPage() {
  return (
    <div className="p-6">
      <PageHeader title="Page not found" />
      <Link to="/" className="text-sm text-brand underline underline-offset-4">
        Back to Live Activity
      </Link>
    </div>
  )
}
