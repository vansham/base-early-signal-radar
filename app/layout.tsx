import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Base Early Signal Radar',
  description: 'Detect unusual onchain activity on Base before everyone else.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="base:app_id" content="69a33edcbe742ec8a785b505" />
      </head>
      <body style={{ margin: 0, padding: 0, background: '#020508' }}>
        {children}
      </body>
    </html>
  )
}
