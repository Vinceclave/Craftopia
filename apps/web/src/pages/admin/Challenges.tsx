import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Plus } from 'lucide-react';

export default function AdminChallenges() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold text-gray-900">Challenges Management</h1>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Challenge
            </Button>
          </div>
          <p className="text-gray-600">Manage eco-challenges and verifications</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Active Challenges</p>
                <p className="text-3xl font-bold">30</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Pending Verification</p>
                <p className="text-3xl font-bold text-orange-600">45</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">8,500</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Active Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold mb-2">Plastic Bottle Upcycling</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Transform plastic bottles into useful items
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Plastic</Badge>
                      <Badge variant="outline">25 points</Badge>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>
              </div>

              <p className="text-center text-gray-500 py-8">
                Connect to your API to load real challenges
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}