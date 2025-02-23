'use client'
import { FrequencyVisualizer } from '../components/frequency-visualizer'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <FrequencyVisualizer />
    </main>
  )
}