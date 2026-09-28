import { ThemeProvider } from 'next-themes'
import { RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { router } from './router'

export function App() {
  return (
    // Dark only for now; the tokens in index.css are structured so a light
    // theme can be added later without touching components.
    <ThemeProvider attribute="class" forcedTheme="dark">
      <TooltipProvider>
        <RouterProvider router={router} />
        <Toaster position="bottom-left" />
      </TooltipProvider>
    </ThemeProvider>
  )
}
