import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { NAACReportModal } from '../../components/admin/naac-report-modal';
import { 
  Download,
  FileText,
  Calendar,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User, Institution } from '../../types';
import { formatDate } from '../../lib/utils';

interface BackgroundJob {
  id: string;
  type: 'naac_report' | 'data_export' | 'audit_report';
  status: 'pending' | 'running' | 'completed' | 'failed';
  created_at: string;
  completed_at?: string;
  progress?: number;
  result?: string;
  error?: string;
}

interface ReportsProps {
  user: User;
}

export function Reports({ user }: ReportsProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [naacModalOpen, setNaacModalOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [institutionsData, jobsData] = await Promise.all([
        apiClient.getInstitutions({ status: 'approved' }),
        apiClient.getBackgroundJobs()
      ]);
      
      setInstitutions(institutionsData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to load reports data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNAACReport = async (institutionId: string, year: number) => {
    return await apiClient.generateNAACReport(institutionId, year);
  };

  const getJobStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'warning';
      case 'failed': return 'error';
      case 'pending': return 'info';
      default: return 'default';
    }
  };

  const getJobIcon = (type: string) => {
    switch (type) {
      case 'naac_report': return FileText;
      case 'data_export': return Download;
      case 'audit_report': return BarChart3;
      default: return FileText;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-600 mt-1">
            Generate institutional reports and export data for compliance
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setNaacModalOpen(true)}>
          <CardContent className="p-6 text-center">
            <FileText className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">NAAC Report</h3>
            <p className="text-sm text-slate-600 mb-4">
              Generate comprehensive NAAC accreditation reports for institutions
            </p>
            <Button className="w-full">
              Generate Report
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <Download className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Data Export</h3>
            <p className="text-sm text-slate-600 mb-4">
              Export platform data for analysis and backup purposes
            </p>
            <Button variant="outline" className="w-full">
              Export Data
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-6 text-center">
            <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Analytics Report</h3>
            <p className="text-sm text-slate-600 mb-4">
              Generate detailed analytics and performance reports
            </p>
            <Button variant="outline" className="w-full">
              Generate Analytics
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Report Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          {jobs.length > 0 ? (
            <div className="space-y-4">
              {jobs.map((job) => {
                const JobIcon = getJobIcon(job.type);
                return (
                  <div key={job.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                        <JobIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-900 capitalize">
                          {job.type.replace('_', ' ')}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Calendar className="h-4 w-4" />
                          <span>Started: {formatDate(job.created_at)}</span>
                          {job.completed_at && (
                            <>
                              <span>•</span>
                              <span>Completed: {formatDate(job.completed_at)}</span>
                            </>
                          )}
                        </div>
                        {job.result && (
                          <p className="text-sm text-slate-600 mt-1">{job.result}</p>
                        )}
                        {job.error && (
                          <p className="text-sm text-red-600 mt-1">{job.error}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={getJobStatusVariant(job.status) as any}>
                        {job.status}
                      </Badge>
                      
                      {job.status === 'running' && job.progress && (
                        <div className="w-24">
                          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                            <span>Progress</span>
                            <span>{job.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-indigo-600 h-2 rounded-full transition-all"
                              style={{ width: `${job.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {job.status === 'completed' && (
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Reports Generated</h3>
              <p className="text-slate-600 mb-4">
                Start by generating your first report using the options above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Scheduled Reports</CardTitle>
            <Button variant="outline" size="sm">
              <Clock className="h-4 w-4 mr-2" />
              Schedule New
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Scheduled Reports</h3>
            <p className="text-slate-600 mb-4">
              Set up automated report generation for regular compliance reporting.
            </p>
            <Button variant="outline">
              Create Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* NAAC Report Modal */}
      <NAACReportModal
        isOpen={naacModalOpen}
        onClose={() => setNaacModalOpen(false)}
        institutions={institutions}
        onGenerateReport={handleGenerateNAACReport}
      />
    </div>
  );
}