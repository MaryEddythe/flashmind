"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Brain, TrendingUp, Plus } from "lucide-react"
import { useState, useEffect } from "react"

// Configuration for your Laravel backend
const API_BASE_URL = '/api'

interface FlashcardData {
  total_cards: number
  total_sessions: number
  average_accuracy: number
  cards_mastered: number
  study_streak: number
  subject_breakdown: Array<{
    subject: string
    card_count: number
    accuracy: number
  }>
}

export default function Dashboard() {
  const [data, setData] = useState<FlashcardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/analytics`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const result = await response.json()
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error('Failed to fetch analytics data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
      console.error('Error fetching analytics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleNavigation = (path: string) => {
    window.location.href = path
  }

  const handleFlashcardsNavigation = () => {
    handleNavigation('/flashcards')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <Button onClick={fetchAnalytics}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">StudyMaster AI</h1>
          <p className="text-lg text-gray-600">Intelligent flashcard learning powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                My Flashcards
              </CardTitle>
              <CardDescription>Manage your study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {data?.total_cards || 0}
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Total flashcards across {data?.subject_breakdown?.length || 0} subjects
              </p>
              <Button 
                className="w-full" 
                onClick={handleFlashcardsNavigation}
              >
                View All Cards
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Study Mode
              </CardTitle>
              <CardDescription>Adaptive learning with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">
                {data?.average_accuracy || 0}%
              </div>
              <p className="text-sm text-gray-600 mb-4">Average accuracy this week</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleNavigation('/study')}
              >
                Start Studying
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Progress
              </CardTitle>
              <CardDescription>Your learning analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">
                {data?.cards_mastered || 0}
              </div>
              <p className="text-sm text-gray-600 mb-4">Cards mastered this week</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleNavigation('/stats')}
              >
                View Stats
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Subject Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.subject_breakdown?.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{subject.subject}</p>
                      <p className="text-sm text-gray-600">{subject.card_count} cards</p>
                    </div>
                    <div className={`font-medium ${
                      subject.accuracy >= 85 ? 'text-green-600' : 
                      subject.accuracy >= 70 ? 'text-yellow-600' : 
                      'text-red-600'
                    }`}>
                      {subject.accuracy}%
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500">No subjects available</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleNavigation('/flashcards/create')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Flashcard
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleNavigation('/study')}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Study Session
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleFlashcardsNavigation}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Flashcards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}