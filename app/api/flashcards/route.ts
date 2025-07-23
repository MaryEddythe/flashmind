import { NextResponse } from 'next/server';

// Temporary mock data - replace with actual database calls later
const mockFlashcards = [
  {
    id: 1,
    front: "What is React?",
    back: "A JavaScript library for building user interfaces",
    subject: "Programming",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    times_seen: 0,
    times_wrong: 0,
    last_seen: null,
  },
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const search = searchParams.get('search');

    let filteredCards = [...mockFlashcards];

    if (subject) {
      filteredCards = filteredCards.filter(card => card.subject === subject);
    }

    if (search) {
      filteredCards = filteredCards.filter(card => 
        card.front.toLowerCase().includes(search.toLowerCase()) ||
        card.back.toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredCards,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}
