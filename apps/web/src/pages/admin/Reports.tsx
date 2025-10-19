// apps/web/src/pages/admin/Reports.tsx - COMPLETE FIXED VERSION
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle, Clock, Loader2, Eye } from 'lucide-react';
import { useReports } from '@/hooks/useReports';

export default function AdminReports() {
  const { reports, meta, stats, isLoading, params, setParams, updateStatus, isUpdating } = useReports();
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  const handleStatusUpdate = async (reportId: number, status: string) => {
    try {
      await updateStatus({ reportId, status });
      alert('Report status updated successfully');
    } catch (error: any) {
      alert('Error: ' + error.message);
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
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-red-600" />
            <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
          </div>
          <p className="text-gray-600">Review and resolve user reports</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-red-600">{stats.pending}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">In Review</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.in_review}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Reports</CardTitle>
            <CardDescription>Filter by status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={params.status} 
              onValueChange={(status) => setParams({ ...params, status, page: 1 })}
            >
              <SelectTrigger className="w-full md:w-64">
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

        {/* Reports List Card */}
        <Card>
          <CardHeader>
            <CardTitle>All Reports ({meta?.total || 0})</CardTitle>
            <CardDescription>
              Showing {reports.length} of {meta?.total || 0} reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div 
                    key={report.report_id} 
                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold">Report #{report.report_id}</p>
                          <Badge
                            variant={
                              report.status === 'pending' ? 'destructive' :
                              report.status === 'in_review' ? 'default' :
                              'outline'
                            }
                          >
                            {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {report.status === 'in_review' && <Eye className="w-3 h-3 mr-1" />}
                            {report.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        
                        <div className="text-xs text-gray-500">
                          <span>Reported by: {report.reporter.username}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(report.created_at).toLocaleDateString()}</span>
                        </div>

                        {report.reported_post && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Reported Post:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {report.reported_post.content}
                            </p>
                          </div>
                        )}

                        {report.reported_comment && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Reported Comment:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {report.reported_comment.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(report.report_id, 'in_review')}
                        disabled={isUpdating || report.status === 'in_review' || report.status === 'resolved'}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusUpdate(report.report_id, 'resolved')}
                        disabled={isUpdating || report.status === 'resolved'}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Resolve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="flex items-center justify-between mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600">
                  Page {meta.page} of {meta.lastPage}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={meta.page === 1}
                    onClick={() => setParams({ ...params, page: meta.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={meta.page >= meta.lastPage}
                    onClick={() => setParams({ ...params, page: meta.page + 1 })}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}