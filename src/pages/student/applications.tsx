import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { 
  Building, 
  Calendar, 
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Download
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types';
import { formatDate } from '../../lib/utils';

interface Application {
  id: string;
  student_id: string;
  company_id: string;
  program_title: string;
  status: 'applied' | 'under_review' | 'accepted' | 'rejected';
  applied_date: string;
  justification: string;
  resume_url: string;
}

interface ApplicationsProps {
  user: User;
}

export function Applications({ user }: ApplicationsProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApplications();
  }, [user.id]);

  const loadApplications = async () => {
    try {
      const data = await apiClient.getApplications({ student_id: user.id });
      setApplications(data);
    } catch (error) {
      console.error('Failed to load applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'under_review':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'accepted':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusVariant = (status: Application['status']) => {
    switch (status) {
      case 'applied':
        return 'info';
      case 'under_review':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
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
          <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
          <p className="text-slate-600 mt-1">
            Track your internship applications and their status
          </p>
        </div>
        <Button onClick={() => window.location.href = '/student/internships'}>
          Browse Internships
        </Button>
      </div>

      {/* Applications List */}
      {applications.length > 0 ? (
        <div className="grid gap-6">
          {applications.map((application) => (
            <Card key={application.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Building className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{application.program_title}</CardTitle>
                      <p className="text-slate-600 mt-1">Company ID: {application.company_id}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-500">
                          Applied on {formatDate(application.applied_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge 
                      variant={getStatusVariant(application.status) as any}
                      className="flex items-center space-x-1"
                    >
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status.replace('_', ' ')}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 mb-2">Application Message</h4>
                    <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                      {application.justification}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center space-x-2 text-sm text-slate-500">
                      <span>Resume:</span>
                      <span className="font-medium">{application.resume_url}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Resume
                      </Button>
                    </div>
                  </div>

                  {application.status === 'accepted' && (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Congratulations! Your application has been accepted.
                        </span>
                      </div>
                      <p className="text-sm text-green-700 mt-1">
                        You should receive further instructions via email soon.
                      </p>
                    </div>
                  )}

                  {application.status === 'rejected' && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <span className="text-sm font-medium text-red-800">
                          Application was not successful this time.
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">
                        Keep building your profile and apply to other opportunities.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Applications Yet</h2>
          <p className="text-slate-600 mb-6">
            Start applying to internships that match your skills and interests.
          </p>
          <Button onClick={() => window.location.href = '/student/internships'}>
            Browse Internships
          </Button>
        </div>
      )}
    </div>
  );
}