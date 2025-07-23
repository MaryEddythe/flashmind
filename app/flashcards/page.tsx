"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"

// Define the Flashcard interface
interface Flashcard {
  id: number
  front: string
  back: string
  subject: string
  difficulty?: string
  created_at?: string
  updated_at?: string
}

// API Response interface
interface FlashcardsResponse {
  success: boolean
  data: Flashcard[]
  message?: string
}

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchFlashcards()
  }, [])

  const fetchFlashcards = async () => {
    try {
      setLoading(true)
      setError(null)
      const response: FlashcardsResponse = await apiClient.getFlashcards()
      if (response.success) {
        setFlashcards(response.data)
      } else {
        setError(response.message || 'Failed to fetch flashcards')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Error fetching flashcards:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this flashcard?')) {
      return
    }

    try {
      // Assuming you have a delete method in your apiClient
      await apiClient.deleteFlashcard(id)
      setFlashcards(prev => prev.filter(card => card.id !== id))
    } catch (err) {
      console.error('Error deleting flashcard:', err)
      alert('Failed to delete flashcard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchFlashcards}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">My Flashcards</h1>
              <p className="text-gray-600">{flashcards.length} cards total</p>
            </div>
          </div>
          <Link href="/flashcards/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Card
            </Button>
          </Link>
        </div>

        {flashcards.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No flashcards yet</h3>
              <p className="text-gray-600 mb-6">Get started by creating your first flashcard!</p>
              <Link href="/flashcards/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Card
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map((card) => (
              <Card key={card.id} className="hover:shadow-lg transition-shadow group">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                      {card.subject}
                    </CardTitle>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                      <Link href={`/flashcards/${card.id}/edit`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(card.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Question:</p>
                      <p className="font-medium text-gray-900 line-clamp-3">{card.front}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Answer:</p>
                      <p className="text-sm text-gray-600 line-clamp-3">{card.back}</p>
                    </div>
                  </div>
                  {card.difficulty && (
                    <div className="mt-3 pt-3 border-t">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                        card.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {card.difficulty.charAt(0).toUpperCase() + card.difficulty.slice(1)}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}