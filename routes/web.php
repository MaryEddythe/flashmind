<?php

use Illuminate\Support\Facades\Route;

// Main dashboard
Route::get('/', function () {
    return view('dashboard'); // or return your React app
});

// Flashcards routes
Route::get('/flashcards', function () {
    return view('dashboard'); // or return your React app
});

Route::get('/flashcards/create', function () {
    return view('dashboard'); // or return your React app
});

// Study routes
Route::get('/study', function () {
    return view('dashboard'); // or return your React app
});

// Stats routes
Route::get('/stats', function () {
    return view('dashboard'); // or return your React app
});

// Catch-all route for SPA routing (if using React Router)
Route::get('/{any}', function () {
    return view('dashboard'); // or return your React app
})->where('any', '.*');