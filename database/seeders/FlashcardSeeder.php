<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Flashcard;
use App\Models\FlashcardProgress;
use App\Models\User;

class FlashcardSeeder extends Seeder
{
    public function run()
    {
        $flashcards = [
            [
                'subject' => 'Mathematics',
                'front' => 'What is the derivative of x²?',
                'back' => '2x'
            ],
            [
                'subject' => 'Mathematics', 
                'front' => 'What is the integral of 2x?',
                'back' => 'x² + C'
            ],
            [
                'subject' => 'Physics',
                'front' => 'What is Newton\'s second law?',
                'back' => 'F = ma (Force equals mass times acceleration)'
            ],
            [
                'subject' => 'Chemistry',
                'front' => 'What is the chemical formula for water?',
                'back' => 'H₂O'
            ],
            [
                'subject' => 'Programming',
                'front' => 'What does API stand for?',
                'back' => 'Application Programming Interface'
            ],
            [
                'subject' => 'Biology',
                'front' => 'What is the powerhouse of the cell?',
                'back' => 'Mitochondria'
            ],
            [
                'subject' => 'History',
                'front' => 'In what year did World War II end?',
                'back' => '1945'
            ],
            [
                'subject' => 'Geography',
                'front' => 'What is the capital of France?',
                'back' => 'Paris'
            ]
        ];

        // Get or create a test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );

        foreach ($flashcards as $cardData) {
            // Add user_id to each flashcard
            $cardData['user_id'] = $user->id;
            
            // Create flashcard (avoid duplicates)
            $flashcard = Flashcard::firstOrCreate(
                [
                    'front' => $cardData['front'],
                    'user_id' => $user->id
                ],
                $cardData
            );

            // Create progress record if it doesn't exist
            FlashcardProgress::firstOrCreate(
                [
                    'flashcard_id' => $flashcard->id,
                    'user_id' => $user->id
                ],
                [
                    'times_seen' => 0,
                    'times_wrong' => 0,
                    'last_seen' => null,
                ]
            );
        }

        $this->command->info('Created ' . count($flashcards) . ' flashcards with progress tracking.');
    }
}