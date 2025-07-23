import { generateText } from "ai"
import { google } from "@ai-sdk/google"

interface Flashcard {
  id: number
  front: string
  back: string
  subject: string
  times_seen: number
  times_wrong: number
  last_seen: string | null
}

export async function generateStudyOrder(flashcards: Flashcard[]): Promise<Flashcard[]> {
  try {
    const flashcardStats = flashcards.map((card) => ({
      id: card.id,
      subject: card.subject,
      front: card.front.substring(0, 100), // Truncate for API efficiency
      times_seen: card.times_seen,
      times_wrong: card.times_wrong,
      accuracy_rate: card.times_seen > 0 ? ((card.times_seen - card.times_wrong) / card.times_seen) * 100 : 100,
      last_seen: card.last_seen,
    }))

    const prompt = `
You are an AI tutor helping optimize flashcard study sessions. Given the following flashcard statistics, determine the optimal order for studying to maximize learning retention.

Flashcard Statistics:
${JSON.stringify(flashcardStats, null, 2)}

Please consider:
1. Cards with lower accuracy rates should appear more frequently
2. Cards not seen recently should be prioritized
3. Distribute difficult cards throughout the session (don't cluster them)
4. Mix subjects to prevent fatigue

Return ONLY a JSON array of flashcard IDs in the optimal study order, like: [1, 3, 2, 4, 1, 3, ...]
Some cards may appear multiple times if they need extra practice.
`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 1000,
    })

    // Parse the AI response
    const orderIds = JSON.parse(text.trim())

    // Create ordered flashcard array
    const orderedFlashcards: Flashcard[] = []
    for (const id of orderIds) {
      const card = flashcards.find((c) => c.id === id)
      if (card) {
        orderedFlashcards.push(card)
      }
    }

    return orderedFlashcards.length > 0 ? orderedFlashcards : flashcards
  } catch (error) {
    console.error("Failed to generate AI study order:", error)
    // Fallback: sort by accuracy rate (worst first) and recency
    return [...flashcards].sort((a, b) => {
      const accuracyA = a.times_seen > 0 ? (a.times_seen - a.times_wrong) / a.times_seen : 1
      const accuracyB = b.times_seen > 0 ? (b.times_seen - b.times_wrong) / b.times_seen : 1
      return accuracyA - accuracyB
    })
  }
}

export async function generateHint(flashcard: Flashcard): Promise<string> {
  try {
    const prompt = `
You are an AI tutor. A student is struggling with this flashcard:

Question: ${flashcard.front}
Answer: ${flashcard.back}
Subject: ${flashcard.subject}

Provide a helpful hint that guides the student toward the answer without giving it away completely. The hint should:
1. Be encouraging and supportive
2. Provide a conceptual clue or memory aid
3. Not reveal the full answer
4. Be concise (1-2 sentences)

Return only the hint text, nothing else.
`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 150,
    })

    return text.trim()
  } catch (error) {
    console.error("Failed to generate hint:", error)
    return "Think about the key concepts related to this topic. What fundamental principles apply here?"
  }
}

export async function generateExplanation(flashcard: Flashcard, userAnswer: string): Promise<string> {
  try {
    const prompt = `
You are an AI tutor. A student answered a flashcard question incorrectly:

Question: ${flashcard.front}
Correct Answer: ${flashcard.back}
Student's Answer: ${userAnswer}
Subject: ${flashcard.subject}

Provide a clear, educational explanation that:
1. Explains why the correct answer is right
2. Identifies what might have led to the student's mistake
3. Provides additional context or examples
4. Is encouraging and constructive
5. Helps prevent similar mistakes in the future

Keep it concise but informative (2-3 sentences).
`

    const { text } = await generateText({
      model: google("gemini-1.5-flash"),
      prompt,
      maxTokens: 200,
    })

    return text.trim()
  } catch (error) {
    console.error("Failed to generate explanation:", error)
    return "The correct answer helps you understand the fundamental concept. Review the key principles and try to connect them to similar problems."
  }
}
