// apps/web/src/pages/admin/Reports.tsx - FIXED VERSION
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, Loader2, Eye, XCircle, RefreshCw } from 'lucide-react';
import { useReports } from '@/hooks/useReports';
import { useWebSocketReports } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';

export default function AdminReports() {
  const { 
    reports, 
    meta, 
    stats, 
    isLoading, 
    params, 
    setParams, 
    updateStatus, 
    isUpdating,
    refetch 
  } = useReports();
  
  const { toast } = useToast();
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [moderatorNotes, setModeratorNotes] = useState('');

  // WebSocket handlers
  const handleReportCreated = useCallback((data: any) => {
    toast({
      title: "New Report",
      description: data.message || 'A new report has been filed',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  const handleReportUpdated = useCallback((data: any) => {
    toast({
      title: "Report Updated",
      description: data.message || 'A report status has been updated',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  const handleReportResolved = useCallback((data: any) => {
    toast({
      title: "Report Resolved",
      description: data.message || 'A report has been resolved',
      variant: "default"
    });
    refetch();
  }, [refetch, toast]);

  // Subscribe to WebSocket events
  useWebSocketReports({
    onCreated: handleReportCreated,
    onUpdated: handleReportUpdated,
    onResolved: handleReportResolved,
  });

  const handleStatusUpdate = async (reportId: number, status: string, notes?: string) => {
    try {
      await updateStatus({ reportId, status, moderatorNotes: notes });
      toast({
        title: "Success",
        description: "Report status updated successfully",
        variant: "default"
      });
      setResolveDialogOpen(false);
      setSelectedReport(null);
      setModeratorNotes('');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || 'Failed to update report status',
        variant: "destructive"
      });
    }
  };

  const openResolveDialog = (report: any) => {
    setSelectedReport(report);
    setModeratorNotes('');
    setResolveDialogOpen(true);
  };

  const handleResolve = async () => {
    if (!selectedReport) return;
    await handleStatusUpdate(selectedReport.report_id, 'resolved', moderatorNotes);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports Management</h1>
                <p className="text-gray-600 mt-1">Review and resolve user reports</p>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                  <p className="text-3xl font-bold">{stats.total || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-3xl font-bold text-red-600">{stats.pending || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">In Review</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.in_review || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Resolved</p>
                  <p className="text-3xl font-bold text-green-600">{stats.resolved || 0}</p>
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
  value={params.status || 'all'}
  onValueChange={(status) =>
    setParams({ ...params, status: status === 'all' ? undefined : status, page: 1 })
  }
>
  <SelectTrigger className="w-full md:w-64">
    <SelectValue placeholder="All Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
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
              Showing {reports?.length || 0} of {meta?.total || 0} reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!reports || reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reports found</p>
                <p className="text-sm text-gray-400 mt-2">
                  {params.status ? 'Try changing the filter' : 'No reports have been filed yet'}
                </p>
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
                          <span>Reported by: {report.reporter?.username || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(report.created_at).toLocaleString()}</span>
                        </div>

                        {report.reported_post && (
                          <div className="mt-2 p-2 bg-gray-100 rounded text-sm">
                            <span className="font-medium">Reported Post:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2">
                              {report.reported_post.title || report.reported_post.content}
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

                        {report.moderator_notes && (
                          <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                            <span className="font-medium text-blue-900">Moderator Notes:</span>
                            <p className="text-blue-700 mt-1">
                              {report.moderator_notes}
                            </p>
                          </div>
                        )}

                        {report.resolved_at && (
                          <div className="mt-2 text-xs text-green-600">
                            Resolved on {new Date(report.resolved_at).toLocaleString()}
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
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 mr-1" />
                        )}
                        Review
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => openResolveDialog(report)}
                        disabled={isUpdating || report.status === 'resolved'}
                      >
                        {isUpdating ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle className="w-4 h-4 mr-1" />
                        )}
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
                    size="sm"
                    disabled={meta.page === 1}
                    onClick={() => setParams({ ...params, page: meta.page - 1 })}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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

        {/* Resolve Dialog */}
        <Dialog open={resolveDialogOpen} onOpenChange={setResolveDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Resolve Report</DialogTitle>
              <DialogDescription>
                Add moderator notes and resolve this report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedReport && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium mb-1">Report #{selectedReport.report_id}</p>
                  <p className="text-sm text-gray-600">{selectedReport.reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes">Moderator Notes</Label>
                <Textarea
                  id="notes"
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add notes about the action taken..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setResolveDialogOpen(false)}
                disabled={isUpdating}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResolve}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Resolving...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Resolve Report
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}