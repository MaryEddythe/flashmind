<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Flashcards\FlashcardController;
use App\Http\Controllers\Flashcards\StudyController;
use App\Http\Controllers\Gemini\GeminiController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});


// Flashcards Module
Route::prefix('flashcards')->group(function () {
    Route::get('/', [FlashcardController::class, 'index']);
    Route::post('/', [FlashcardController::class, 'store']);
    Route::get('/{flashcard}', [FlashcardController::class, 'show']);
    Route::put('/{flashcard}', [FlashcardController::class, 'update']);
    Route::delete('/{flashcard}', [FlashcardController::class, 'destroy']);
});

// Study Module
Route::prefix('study')->group(function () {
    Route::get('/session', [StudyController::class, 'getStudySession']);
    Route::post('/progress', [StudyController::class, 'updateFlashcardProgress']);
    Route::get('/progress', [StudyController::class, 'getFlashcardProgress']);
});

// Gemini AI Integration
Route::prefix('gemini')->group(function () {
    Route::post('/optimize', [GeminiController::class, 'optimizeStudyOrder']);
    Route::post('/hint', [GeminiController::class, 'generateHint']);
});

// Analytics (Placeholder - can be expanded)
Route::get('/analytics', function () {
    // This is a placeholder. You would implement actual analytics logic here.
    return response()->json([
        'data' => [
            'total_cards' => \App\Models\Flashcard::count(),
            'total_sessions' => 10, // Mock data
            'average_accuracy' => 85, // Mock data
            'cards_mastered' => 12, // Mock data
            'study_streak' => 5, // Mock data
            'subject_breakdown' => [
                ['subject' => 'Mathematics', 'card_count' => 10, 'accuracy' => 88],
                ['subject' => 'Physics', 'card_count' => 8, 'accuracy' => 75],
                ['subject' => 'Chemistry', 'card_count' => 6, 'accuracy' => 92],
            ],
        ],
        'success' => true,
    ]);
});
