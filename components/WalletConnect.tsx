'use client'
import { useState } from 'react'

interface WalletState {
  address: string
  connected: boolean
}

export async function connectWallet(): Promise<WalletState> {
  // Check for any injected wallet (MetaMask, Rabby, Coinbase etc)
  if (typeof window === 'undefined') throw new Error('Not in browser')
  
  const eth = (window as unknown as { ethereum?: { request: (args: {method: string; params?: unknown[]}) => Promise<unknown>; isMetaMask?: boolean; isCoinbaseWallet?: boolean } }).ethereum
  
  if (!eth) {
    throw new Error('NO_WALLET')
  }

  // Request accounts — this triggers the real wallet popup!
  const accounts = await eth.request({ method: 'eth_requestAccounts' }) as string[]
  
  if (!accounts || accounts.length === 0) {
    throw new Error('No accounts found')
  }

  // Switch to Base network
  try {
    await eth.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x2105' }], // Base mainnet = 8453
    })
  } catch (switchError: unknown) {
    // Add Base network if not exists
    if ((switchError as {code: number}).code === 4902) {
      await eth.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: '0x2105',
          chainName: 'Base',
          nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
          rpcUrls: ['https://mainnet.base.org'],
          blockExplorerUrls: ['https://basescan.org'],
        }],
      })
    }
  }

  return { address: accounts[0], connected: true }
}

export function shortenAddress(addr: string) {
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}
