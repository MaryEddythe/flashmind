"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { BookOpen, Brain, TrendingUp, Plus } from "lucide-react"
import { useState } from "react"

export default function Dashboard() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(false);

  const handleAPINavigation = async (endpoint: string, view: string) => {
    setLoading(true);
    try {
      // Make API call to your Laravel backend
      const response = await fetch(`http://localhost:8000/api${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Data:', data);
        setCurrentView(view);
        // Handle the response data as needed
      } else {
        console.error('API call failed:', response.status);
      }
    } catch (error) {
      console.error('Network error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleHomeNavigation = () => {
    setCurrentView('dashboard');
  };

  if (currentView !== 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <Button 
            onClick={handleHomeNavigation}
            className="mb-4"
            variant="outline"
          >
            ← Back to Dashboard
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              {currentView === 'flashcards' && 'Flashcards'}
              {currentView === 'study' && 'Study Mode'}
              {currentView === 'stats' && 'Progress & Stats'}
              {currentView === 'create' && 'Create Flashcard'}
            </h2>
            <p>This would be your {currentView} component</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">StudyMaster AI</h1>
          <p className="text-lg text-gray-600">Intelligent flashcard learning powered by AI</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                My Flashcards
              </CardTitle>
              <CardDescription>Manage your study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 mb-2">24</div>
              <p className="text-sm text-gray-600 mb-4">Total flashcards across 3 subjects</p>
              <Button 
                className="w-full" 
                onClick={() => handleAPINavigation('/flashcards', 'flashcards')}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'View All Cards'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Study Mode
              </CardTitle>
              <CardDescription>Adaptive learning with AI</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600 mb-2">85%</div>
              <p className="text-sm text-gray-600 mb-4">Average accuracy this week</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleAPINavigation('/study/session', 'study')}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Start Studying'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Progress
              </CardTitle>
              <CardDescription>Your learning analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 mb-2">12</div>
              <p className="text-sm text-gray-600 mb-4">Cards mastered this week</p>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleAPINavigation('/analytics', 'stats')}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'View Stats'}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Mathematics - Calculus</p>
                    <p className="text-sm text-gray-600">Studied 15 minutes ago</p>
                  </div>
                  <div className="text-green-600 font-medium">92%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Physics - Mechanics</p>
                    <p className="text-sm text-gray-600">Studied 1 hour ago</p>
                  </div>
                  <div className="text-yellow-600 font-medium">78%</div>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Chemistry - Organic</p>
                    <p className="text-sm text-gray-600">Studied 2 hours ago</p>
                  </div>
                  <div className="text-red-600 font-medium">65%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setCurrentView('create')}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Flashcard
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleAPINavigation('/study/session', 'study')}
                  disabled={loading}
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Start AI Study Session
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleAPINavigation('/flashcards', 'flashcards')}
                  disabled={loading}
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Browse All Flashcards
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}