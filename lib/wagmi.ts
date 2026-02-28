import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { base } from 'viem/chains'

export const wagmiConfig = getDefaultConfig({
  appName: 'Base Early Signal Radar',
  projectId: 'baseearlyradar',
  chains: [base],
  ssr: true,
})
