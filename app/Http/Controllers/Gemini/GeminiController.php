<?php

namespace App\Http\Controllers\Gemini;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GeminiController extends Controller
{
    private $geminiApiKey;
    private $geminiApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

    public function __construct()
    {
        $this->geminiApiKey = env('GEMINI_API_KEY');
    }

    /**
     * Optimize study order using Gemini API.
     */
    public function optimizeStudyOrder(Request $request)
    {
        $request->validate([
            'flashcards' => 'required|array',
            'flashcards.*.id' => 'required|integer',
            'flashcards.*.front' => 'required|string',
            'flashcards.*.subject' => 'required|string',
            'flashcards.*.times_seen' => 'required|integer',
            'flashcards.*.times_wrong' => 'required|integer',
            'flashcards.*.last_seen' => 'nullable|string',
        ]);

        $flashcardsData = collect($request->input('flashcards'))->map(function ($card) {
            return [
                'id' => $card['id'],
                'subject' => $card['subject'],
                'front' => substr($card['front'], 0, 100), // Truncate for API efficiency
                'times_seen' => $card['times_seen'],
                'times_wrong' => $card['times_wrong'],
                'accuracy_rate' => $card['times_seen'] > 0 ? (($card['times_seen'] - $card['times_wrong']) / $card['times_seen']) * 100 : 100,
                'last_seen' => $card['last_seen'],
            ];
        })->toArray();

        $prompt = "You are an AI tutor helping optimize flashcard study sessions. Given the following flashcard statistics, determine the optimal order for studying to maximize learning retention.\n\n" .
                  "Flashcard Statistics:\n" . json_encode($flashcardsData, JSON_PRETTY_PRINT) . "\n\n" .
                  "Please consider:\n" .
                  "1. Cards with lower accuracy rates should appear more frequently\n" .
                  "2. Cards not seen recently should be prioritized\n" .
                  "3. Distribute difficult cards throughout the session (don't cluster them)\n" .
                  "4. Mix subjects to prevent fatigue\n\n" .
                  "Return ONLY a JSON array of flashcard IDs in the optimal study order, like: [1, 3, 2, 4, 1, 3, ...]\n\n" .
                  "Some cards may appear multiple times if they need extra practice.";

        try {
            $response = Http::post("{$this->geminiApiUrl}?key={$this->geminiApiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 1000,
                ],
            ]);

            $responseData = $response->json();

            if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                $aiResponseText = $responseData['candidates'][0]['content']['parts'][0]['text'];
                $orderIds = json_decode($aiResponseText, true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new \Exception("Failed to decode AI response JSON: " . json_last_error_msg());
                }

                $orderedFlashcards = collect($orderIds)->map(function ($id) use ($flashcardsData) {
                    return collect($flashcardsData)->firstWhere('id', $id);
                })->filter()->values()->toArray(); // Filter out nulls if ID not found and re-index

                return response()->json(['data' => $orderedFlashcards, 'success' => true]);
            } else {
                Log::error('Gemini API response missing content:', $responseData);
                return response()->json(['message' => 'Gemini API response missing content.', 'success' => false], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error calling Gemini API for optimization: ' . $e->getMessage());
            // Fallback: sort by accuracy rate (worst first) and recency
            $fallbackOrder = collect($flashcardsData)->sortBy(function ($card) {
                return $card['accuracy_rate'];
            })->sortBy(function ($card) {
                return $card['last_seen'] ?? '1970-01-01 00:00:00';
            })->values()->toArray();
            return response()->json(['data' => $fallbackOrder, 'message' => 'AI optimization failed, using default order.', 'success' => true]);
        }
    }

    /**
     * Generate a hint for a flashcard using Gemini API.
     */
    public function generateHint(Request $request)
    {
        $request->validate([
            'flashcard' => 'required|array',
            'flashcard.front' => 'required|string',
            'flashcard.back' => 'required|string',
            'flashcard.subject' => 'required|string',
        ]);

        $flashcard = $request->input('flashcard');

        $prompt = "You are an AI tutor. A student is struggling with this flashcard:\n\n" .
                  "Question: {$flashcard['front']}\n" .
                  "Answer: {$flashcard['back']}\n" .
                  "Subject: {$flashcard['subject']}\n\n" .
                  "Provide a helpful hint that guides the student toward the answer without giving it away completely. The hint should:\n" .
                  "1. Be encouraging and supportive\n" .
                  "2. Provide a conceptual clue or memory aid\n" .
                  "3. Not reveal the full answer\n" .
                  "4. Be concise (1-2 sentences)\n\n" .
                  "Return only the hint text, nothing else.";

        try {
            $response = Http::post("{$this->geminiApiUrl}?key={$this->geminiApiKey}", [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ],
                'generationConfig' => [
                    'maxOutputTokens' => 150,
                ],
            ]);

            $responseData = $response->json();

            if (isset($responseData['candidates'][0]['content']['parts'][0]['text'])) {
                $hint = $responseData['candidates'][0]['content']['parts'][0]['text'];
                return response()->json(['data' => ['hint' => $hint], 'success' => true]);
            } else {
                Log::error('Gemini API response missing hint content:', $responseData);
                return response()->json(['message' => 'Gemini API response missing hint content.', 'success' => false], 500);
            }
        } catch (\Exception $e) {
            Log::error('Error calling Gemini API for hint: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to generate hint.', 'success' => false], 500);
        }
    }
}
