import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { PageHeader } from '@/components/PageHeader'

/** Screens that are designed after the Live Activity console. */
export function PlaceholderPage({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="p-6">
      <PageHeader title={title} description={description} />
      <div className="flex max-w-xl flex-col gap-2 rounded-lg border border-dashed border-border bg-surface-3/50 p-6 text-sm">
        <p className="font-medium">This screen hasn’t been designed yet.</p>
        <p className="text-muted-foreground">
          The working prototype is the Live Activity console.
        </p>
        <Link
          to="/"
          className="flex w-fit items-center gap-1 text-xs font-medium text-brand underline-offset-4 hover:underline"
        >
          Go to Live Activity
          <ArrowRight aria-hidden className="size-3" />
        </Link>
      </div>
    </div>
  )
}
