<?php

namespace App\Http\Controllers\Flashcards;

use App\Http\Controllers\Controller;
use App\Models\Flashcard;
use App\Models\FlashcardProgress;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FlashcardController extends Controller
{
    /**
     * Display a listing of the flashcards.
     */
    public function index(Request $request)
    {
        $query = Flashcard::query();

        if ($request->has('subject') && $request->input('subject') !== 'all') {
            $query->where('subject', $request->input('subject'));
        }

        if ($request->has('search')) {
            $searchTerm = $request->input('search');
            $query->where(function ($q) use ($searchTerm) {
                $q->where('front', 'like', '%' . $searchTerm . '%')
                  ->orWhere('back', 'like', '%' . $searchTerm . '%');
            });
        }

        $flashcards = $query->with('progress')->get()->map(function ($card) {
            $progress = $card->progress;
            return [
                'id' => $card->id,
                'subject' => $card->subject,
                'front' => $card->front,
                'back' => $card->back,
                'created_at' => $card->created_at,
                'updated_at' => $card->updated_at,
                'times_seen' => $progress ? $progress->times_seen : 0,
                'times_wrong' => $progress ? $progress->times_wrong : 0,
                'last_seen' => $progress ? $progress->last_seen : null,
            ];
        });

        return response()->json(['data' => $flashcards, 'success' => true]);
    }

    /**
     * Store a newly created flashcard in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'front' => 'required|string',
            'back' => 'required|string',
        ]);

        DB::beginTransaction();
        try {
            $flashcard = Flashcard::create($request->all());
            FlashcardProgress::create([
                'flashcard_id' => $flashcard->id,
                'times_seen' => 0,
                'times_wrong' => 0,
                'last_seen' => null,
            ]);
            DB::commit();
            return response()->json(['data' => $flashcard->load('progress'), 'message' => 'Flashcard created successfully!', 'success' => true], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create flashcard: ' . $e->getMessage(), 'success' => false], 500);
        }
    }

    /**
     * Display the specified flashcard.
     */
    public function show(Flashcard $flashcard)
    {
        return response()->json(['data' => $flashcard->load('progress'), 'success' => true]);
    }

    /**
     * Update the specified flashcard in storage.
     */
    public function update(Request $request, Flashcard $flashcard)
    {
        $request->validate([
            'subject' => 'sometimes|string|max:255',
            'front' => 'sometimes|string',
            'back' => 'sometimes|string',
        ]);

        $flashcard->update($request->all());
        return response()->json(['data' => $flashcard->load('progress'), 'message' => 'Flashcard updated successfully!', 'success' => true]);
    }

    /**
     * Remove the specified flashcard from storage.
     */
    public function destroy(Flashcard $flashcard)
    {
        $flashcard->delete();
        return response()->json(['message' => 'Flashcard deleted successfully!', 'success' => true], 204);
    }
}
