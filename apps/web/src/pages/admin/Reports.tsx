import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

export default function AdminReports() {
  const { reports, meta, isLoading, params, setParams, updateStatus } = useReports();
  const [actionLoading, setActionLoading] = useState(false);

  const handleStatusUpdate = async (reportId, status) => {
    try {
      setActionLoading(true);
      await updateStatus({ reportId, status });
      alert('Report status updated');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
          </div>
          <p className="text-gray-600">Review and resolve user reports</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={params.status} onValueChange={(status) => setParams({ ...params, status, page: 1 })}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_review">In Review</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Reports ({meta?.total || 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.report_id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-semibold mb-1">Report #{report.report_id}</p>
                      <p className="text-sm text-gray-600">{report.reason}</p>
                    </div>
                    <Badge
                      variant={
                        report.status === 'pending' ? 'destructive' :
                        report.status === 'in_review' ? 'default' :
                        'outline'
                      }
                    >
                      {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                      {report.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                      {report.status}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(report.report_id, 'in_review')}
                      disabled={actionLoading || report.status === 'in_review'}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(report.report_id, 'resolved')}
                      disabled={actionLoading || report.status === 'resolved'}
                    >
                      Resolve
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  disabled={meta.page === 1}
                  onClick={() => setParams({ ...params, page: meta.page - 1 })}
                >
                  Previous
                </Button>
                <span className="px-4 py-2">Page {meta.page} of {meta.lastPage}</span>
                <Button
                  variant="outline"
                  disabled={meta.page === meta.lastPage}
                  onClick={() => setParams({ ...params, page: meta.page + 1 })}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}