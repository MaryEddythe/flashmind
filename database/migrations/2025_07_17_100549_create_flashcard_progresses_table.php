<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('flashcard_progresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('flashcard_id')->constrained()->onDelete('cascade');
            $table->integer('times_seen')->default(0);
            $table->integer('times_wrong')->default(0);
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();

            // Ensure unique progress per flashcard (for a single user, if auth was implemented)
            $table->unique('flashcard_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('flashcard_progress');
    }
};
