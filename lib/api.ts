/// <reference types="node" />

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api"

interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

interface Flashcard {
  id: number
  front: string
  back: string
  subject: string
  created_at: string
  updated_at: string
  times_seen: number
  times_wrong: number
  last_seen: string | null
}

interface FlashcardProgress {
  flashcard_id: number
  times_seen: number
  times_wrong: number
  last_seen: string
  accuracy_rate: number
}

class ApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("API request failed:", error)
      throw error
    }
  }

  // Flashcard CRUD operations
  async getFlashcards(subject?: string, search?: string): Promise<ApiResponse<Flashcard[]>> {
    const params = new URLSearchParams()
    if (subject) params.append("subject", subject)
    if (search) params.append("search", search)

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Flashcard[]>(`/flashcards${query}`)
  }

  async getFlashcard(id: number): Promise<ApiResponse<Flashcard>> {
    return this.request<Flashcard>(`/flashcards/${id}`)
  }

  async createFlashcard(
    flashcard: Omit<Flashcard, "id" | "created_at" | "updated_at" | "times_seen" | "times_wrong" | "last_seen">,
  ): Promise<ApiResponse<Flashcard>> {
    return this.request<Flashcard>("/flashcards", {
      method: "POST",
      body: JSON.stringify(flashcard),
    })
  }

  async updateFlashcard(id: number, flashcard: Partial<Flashcard>): Promise<ApiResponse<Flashcard>> {
    return this.request<Flashcard>(`/flashcards/${id}`, {
      method: "PUT",
      body: JSON.stringify(flashcard),
    })
  }

  async deleteFlashcard(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/flashcards/${id}`, {
      method: "DELETE",
    })
  }

  // Study session operations
  async getStudySession(subject?: string): Promise<ApiResponse<Flashcard[]>> {
    const params = new URLSearchParams()
    if (subject) params.append("subject", subject)

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request<Flashcard[]>(`/study/session${query}`)
  }

  async updateFlashcardProgress(flashcardId: number, correct: boolean): Promise<ApiResponse<FlashcardProgress>> {
    return this.request<FlashcardProgress>("/study/progress", {
      method: "POST",
      body: JSON.stringify({
        flashcard_id: flashcardId,
        correct,
      }),
    })
  }

  async getFlashcardProgress(): Promise<ApiResponse<FlashcardProgress[]>> {
    return this.request<FlashcardProgress[]>("/study/progress")
  }

  // AI-powered study optimization
  async getOptimizedStudyOrder(flashcards: Flashcard[]): Promise<ApiResponse<Flashcard[]>> {
    return this.request<Flashcard[]>("/study/optimize", {
      method: "POST",
      body: JSON.stringify({ flashcards }),
    })
  }

  async generateHint(flashcard: Flashcard): Promise<ApiResponse<{ hint: string }>> {
    return this.request<{ hint: string }>("/study/hint", {
      method: "POST",
      body: JSON.stringify({ flashcard }),
    })
  }

  // Analytics
  async getStudyAnalytics(timeframe?: "week" | "month" | "year"): Promise<
    ApiResponse<{
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
    }>
  > {
    const params = new URLSearchParams()
    if (timeframe) params.append("timeframe", timeframe)

    const query = params.toString() ? `?${params.toString()}` : ""
    return this.request(`/analytics${query}`)
  }
}

export const apiClient = new ApiClient()
export type { Flashcard, FlashcardProgress, ApiResponse }
