import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Trash2, Star, Loader2 } from 'lucide-react';

export default function AdminPosts() {
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Posts Management</h1>
          </div>
          <p className="text-gray-600">Moderate and manage platform posts</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Posts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-2">Sample Post Title</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      This is a sample post content. In production, this will load real posts from your API.
                    </p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Tutorial</Badge>
                      <Badge variant="outline">10 likes</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Star className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="destructive">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-500 py-8">
                Connect to your API to load real posts
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
