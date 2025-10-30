// apps/web/src/pages/admin/Reports.tsx - FIXED VERSION
import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Clock, Loader2, Eye, RefreshCw } from 'lucide-react';
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
  
  const { success, error, info } = useToast();  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [moderatorNotes, setModeratorNotes] = useState('');

  // WebSocket handlers
  const handleReportCreated = useCallback((data: any) => {
    success(data.message || 'A new report has been filed');
    refetch();
  }, [refetch, success]);


  const handleReportUpdated = useCallback((data: any) => {
    info(data.message || 'A report status has been updated');
    refetch();
  }, [refetch, info]);

  const handleReportResolved = useCallback((data: any) => {
    success(data.message || 'A report has been resolved');
    refetch();
  }, [refetch, success]);

  // Subscribe to WebSocket events
  useWebSocketReports({
    onCreated: handleReportCreated,
    onUpdated: handleReportUpdated,
    onResolved: handleReportResolved,
  });

  const handleStatusUpdate = async (reportId: number, status: string, notes?: string) => {
    try {
      await updateStatus({ reportId, status, notes });
      success('Report status updated successfully');
      setResolveDialogOpen(false);
      setSelectedReport(null);
      setModeratorNotes('');
    } catch (err: any) {
      error(err?.message || 'Failed to update report status');
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${10 + i * 25}%`,
              top: `${15 + (i % 3) * 20}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <AlertCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins">Reports Management</h1>
                <p className="text-gray-600 mt-1 font-nunito">Review and resolve user reports</p>
              </div>
            </div>
            <Button 
              size="sm" 
              onClick={() => refetch()} 
              className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Total Reports</p>
                  <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{stats.total || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Pending</p>
                  <p className="text-3xl font-bold text-rose-600 font-poppins">{stats.pending || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1 font-nunito">In Review</p>
                  <p className="text-3xl font-bold text-orange-600 font-poppins">{stats.in_review || 0}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Resolved</p>
                  <p className="text-3xl font-bold text-[#6CAC73] font-poppins">{stats.resolved || 0}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Card */}
        <Card className="mb-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">Filter Reports</CardTitle>
            <CardDescription className="font-nunito">Filter by status</CardDescription>
          </CardHeader>
          <CardContent>
            <Select 
              value={params.status || 'all'}
              onValueChange={(status) =>
                setParams({ ...params, status: status === 'all' ? undefined : status, page: 1 })
              }
            >
              <SelectTrigger className="w-full md:w-64 border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 bg-white/50">
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
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">All Reports ({meta?.total || 0})</CardTitle>
            <CardDescription className="font-nunito">
              Showing {reports?.length || 0} of {meta?.total || 0} reports
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!reports || reports.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No reports found</p>
                <p className="text-sm text-gray-400 mt-2 font-nunito">
                  {params.status ? 'Try changing the filter' : 'No reports have been filed yet'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div 
                    key={report.report_id} 
                    className="p-4 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-semibold text-[#2B4A2F] font-poppins">Report #{report.report_id}</p>
                          <Badge
                            className={`font-poppins border-0 ${
                              report.status === 'pending' 
                                ? 'bg-gradient-to-r from-rose-500/20 to-rose-600/20 text-rose-700' 
                                : report.status === 'in_review' 
                                ? 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                                : 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                            }`}
                          >
                            {report.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                            {report.status === 'in_review' && <Eye className="w-3 h-3 mr-1" />}
                            {report.status === 'resolved' && <CheckCircle className="w-3 h-3 mr-1" />}
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-gray-600 font-nunito mb-2">
                          <span className="font-medium">Reason:</span> {report.reason}
                        </p>
                        
                        <div className="text-xs text-gray-500 font-nunito">
                          <span>Reported by: {report.reporter?.username || 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>{new Date(report.created_at).toLocaleString()}</span>
                        </div>

                        {report.reported_post && (
                          <div className="mt-2 p-2 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10 text-sm">
                            <span className="font-medium text-[#2B4A2F] font-poppins">Reported Post:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2 font-nunito">
                              {report.reported_post.title || report.reported_post.content}
                            </p>
                          </div>
                        )}

                        {report.reported_comment && (
                          <div className="mt-2 p-2 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10 text-sm">
                            <span className="font-medium text-[#2B4A2F] font-poppins">Reported Comment:</span>
                            <p className="text-gray-600 mt-1 line-clamp-2 font-nunito">
                              {report.reported_comment.content}
                            </p>
                          </div>
                        )}

                        {report.moderator_notes && (
                          <div className="mt-2 p-2 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg border border-blue-200 text-sm">
                            <span className="font-medium text-blue-900 font-poppins">Moderator Notes:</span>
                            <p className="text-blue-700 mt-1 font-nunito">
                              {report.moderator_notes}
                            </p>
                          </div>
                        )}

                        {report.resolved_at && (
                          <div className="mt-2 text-xs text-[#6CAC73] font-nunito">
                            Resolved on {new Date(report.resolved_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(report.report_id, 'in_review')}
                        disabled={isUpdating || report.status === 'in_review' || report.status === 'resolved'}
                        className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
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
                        onClick={() => openResolveDialog(report)}
                        disabled={isUpdating || report.status === 'resolved'}
                        className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
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
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-[#6CAC73]/20">
                <div className="text-sm text-gray-600 font-nunito">
                  Page {meta.page} of {meta.lastPage}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    disabled={meta.page === 1}
                    onClick={() => setParams({ ...params, page: meta.page - 1 })}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    disabled={meta.page >= meta.lastPage}
                    onClick={() => setParams({ ...params, page: meta.page + 1 })}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
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
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">Resolve Report</DialogTitle>
              <DialogDescription className="font-nunito">
                Add moderator notes and resolve this report
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {selectedReport && (
                <div className="p-3 bg-gradient-to-br from-[#FFF9F0] to-white rounded-lg border border-[#6CAC73]/10">
                  <p className="text-sm font-medium text-[#2B4A2F] font-poppins mb-1">Report #{selectedReport.report_id}</p>
                  <p className="text-sm text-gray-600 font-nunito">{selectedReport.reason}</p>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-[#2B4A2F] font-poppins">Moderator Notes</Label>
                <Textarea
                  id="notes"
                  value={moderatorNotes}
                  onChange={(e) => setModeratorNotes(e.target.value)}
                  placeholder="Add notes about the action taken..."
                  rows={4}
                  className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={() => setResolveDialogOpen(false)}
                disabled={isUpdating}
                className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleResolve}
                disabled={isUpdating}
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
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