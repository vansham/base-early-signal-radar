import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base Early Signal Radar',
  description: 'Detect unusual onchain activity on Base before everyone else.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="699d53234fa7a77f84a9ffe6" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#020508' }}>
        {children}
      </body>
    </html>
  )
}
