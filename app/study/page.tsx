"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, RotateCcw, CheckCircle, XCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { generateStudyOrder } from "@/lib/gemini"
import { apiClient, type Flashcard } from "@/lib/api"

export default function StudyPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [sessionStats, setSessionStats] = useState({ correct: 0, incorrect: 0 })
  const [loading, setLoading] = useState(true)
  const [aiOptimizing, setAiOptimizing] = useState(false)

  // Fetch flashcards data from backend API
  useEffect(() => {
    setAiOptimizing(true)
    apiClient.getFlashcards()
      .then(async (data) => {
        const cards = data.data
        try {
          const optimizedOrder = await generateStudyOrder(cards)

          // Merge with original cards to keep all required fields (like created_at, updated_at)
          const mergedOrder: Flashcard[] = optimizedOrder.map((card) => {
            const original = cards.find((c: Flashcard) => c.id === card.id)
            if (original) {
              // Spread original first to ensure all required fields are present,
              // then spread card to overwrite any updated fields from AI optimizer
              return { ...original, ...card }
            } else {
              // In case the card is not found in original, provide fallback values to satisfy type
              // You can customize these as needed or log a warning
              return {
                ...card,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                subject: card.subject ?? "Unknown",
                front: card.front ?? "",
                back: card.back ?? "",
                times_seen: card.times_seen ?? 0,
                times_wrong: card.times_wrong ?? 0,
                last_seen: card.last_seen ?? new Date().toISOString(),
              }
            }
          })

          setFlashcards(mergedOrder)
        } catch (error) {
          console.error("AI optimization failed, using default order:", error)
          setFlashcards(cards)
        }
        setAiOptimizing(false)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Failed to fetch flashcards:", error)
        setAiOptimizing(false)
        setLoading(false)
      })
  }, [])

  const currentCard = flashcards[currentIndex]
  const progress = flashcards.length > 0 ? ((currentIndex + 1) / flashcards.length) * 100 : 0

  const handleAnswer = (correct: boolean) => {
    if (!currentCard) return

    setSessionStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      incorrect: prev.incorrect + (correct ? 0 : 1),
    }))

    // Update card statistics (in real app, this would be an API call)
    setFlashcards((prev) =>
      prev.map((card) =>
        card.id === currentCard.id
          ? {
              ...card,
              times_seen: card.times_seen + 1,
              times_wrong: card.times_wrong + (correct ? 0 : 1),
              last_seen: new Date().toISOString(),
            }
          : card,
      ),
    )

    // Move to next card
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setShowAnswer(false)
    } else {
      // End of session - optionally you can handle this differently if needed
      setCurrentIndex(flashcards.length)
    }
  }

  const resetSession = () => {
    setCurrentIndex(0)
    setShowAnswer(false)
    setSessionStats({ correct: 0, incorrect: 0 })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium mb-2">
              {aiOptimizing ? "AI is optimizing your study session..." : "Loading flashcards..."}
            </h3>
            <p className="text-gray-600">
              {aiOptimizing ? "Analyzing your performance to create the perfect study order" : "Please wait"}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!loading && flashcards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-medium mb-2">No flashcards found</h3>
            <p className="text-gray-600">Please add some flashcards to begin studying.</p>
            <Link href="/flashcards">
              <Button variant="outline" className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cards
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentIndex >= flashcards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-green-600">Session Complete! 🎉</CardTitle>
            <CardDescription>Great job on completing your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{sessionStats.correct}</div>
                <div className="text-sm text-green-700">Correct</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{sessionStats.incorrect}</div>
                <div className="text-sm text-red-700">Incorrect</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-lg font-medium mb-2">
                Accuracy:{" "}
                {Math.round(
                  (sessionStats.correct / (sessionStats.correct + sessionStats.incorrect)) * 100,
                )}
                %
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={resetSession} className="flex-1">
                <RotateCcw className="h-4 w-4 mr-2" />
                Study Again
              </Button>
              <Link href="/flashcards" className="flex-1">
                <Button variant="outline" className="w-full bg-transparent">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Cards
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href="/flashcards">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-600" />
                  AI Study Mode
                </h1>
                <p className="text-gray-600">Adaptive learning powered by AI</p>
              </div>
            </div>
            <Button onClick={resetSession} variant="outline" size="sm">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Card {currentIndex + 1} of {flashcards.length}
              </div>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">✓ {sessionStats.correct}</span>
                <span className="text-red-600">✗ {sessionStats.incorrect}</span>
              </div>
            </div>

            <Progress value={progress} className="h-2" />

            {currentCard && (
              <Card className="min-h-[400px]">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-200 rounded">
                      {currentCard.subject}
                    </span>
                    <div className="text-xs text-gray-500">
                      Seen {currentCard.times_seen} times • {currentCard.times_wrong} wrong
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-xl font-medium mb-4">{showAnswer ? "Answer:" : "Question:"}</h2>
                    <div className="p-6 bg-gray-50 rounded-lg min-h-[120px] flex items-center justify-center">
                      <p className="text-lg leading-relaxed">{showAnswer ? currentCard.back : currentCard.front}</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    {!showAnswer ? (
                      <Button onClick={() => setShowAnswer(true)} className="flex-1">
                        Show Answer
                      </Button>
                    ) : (
                      <>
                        <Button
                          onClick={() => handleAnswer(false)}
                          variant="outline"
                          className="flex-1 text-red-600 hover:text-red-700"
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Got it Wrong
                        </Button>
                        <Button onClick={() => handleAnswer(true)} className="flex-1 bg-green-600 hover:bg-green-700">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Got it Right
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
