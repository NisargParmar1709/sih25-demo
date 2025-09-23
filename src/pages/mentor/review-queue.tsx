import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search,
  Filter,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Activity, User as UserType, Student } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';

interface ReviewQueueProps {
  user: UserType;
}

export function ReviewQueue({ user }: ReviewQueueProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'confidence' | 'urgency'>('urgency');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [queueData, studentsData] = await Promise.all([
        apiClient.getMentorReviewQueue(user.id),
        apiClient.getStudents({ institution_id: user.institution_id })
      ]);
      
      setActivities(queueData);
      setStudents(studentsData);
    } catch (error) {
      console.error('Failed to load review queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || 'Unknown Student';
  };

  const getUrgencyLevel = (activity: Activity) => {
    const daysSinceSubmission = Math.floor(
      (Date.now() - new Date(activity.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceSubmission > 7) return 'high';
    if (daysSinceSubmission > 3) return 'medium';
    return 'low';
  };

  const getUrgencyBadge = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return <Badge variant="error" size="sm">Urgent</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      default:
        return <Badge variant="success" size="sm">Normal</Badge>;
    }
  };

  const filteredAndSortedActivities = activities
    .filter(activity => {
      const matchesSearch = 
        activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getStudentName(activity.student_id).toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || activity.verification.status === statusFilter;
      const matchesType = typeFilter === 'all' || activity.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'confidence':
          return a.verification.ai_confidence_score - b.verification.ai_confidence_score;
        case 'urgency':
          const urgencyA = getUrgencyLevel(a);
          const urgencyB = getUrgencyLevel(b);
          const urgencyOrder = { high: 3, medium: 2, low: 1 };
          return urgencyOrder[urgencyB as keyof typeof urgencyOrder] - urgencyOrder[urgencyA as keyof typeof urgencyOrder];
        default:
          return 0;
      }
    });

  const statusCounts = {
    all: activities.length,
    pending: activities.filter(a => a.verification.status === 'pending').length,
    under_review: activities.filter(a => a.verification.status === 'under_review').length,
    verified: activities.filter(a => a.verification.status === 'verified').length,
    rejected: activities.filter(a => a.verification.status === 'rejected').length
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
          <h1 className="text-2xl font-bold text-slate-900">Review Queue</h1>
          <p className="text-slate-600 mt-1">
            Review and verify student activity submissions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by student name, activity title, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status ({statusCounts.all})</option>
                <option value="pending">Pending ({statusCounts.pending})</option>
                <option value="under_review">Under Review ({statusCounts.under_review})</option>
                <option value="verified">Verified ({statusCounts.verified})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Types</option>
                <option value="internship_certificate">Internship</option>
                <option value="participation_certificate">Participation</option>
                <option value="skill_certificate">Skill</option>
                <option value="project_completion">Project</option>
                <option value="social_work">Social Work</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="urgency">Sort by Urgency</option>
                <option value="date">Sort by Date</option>
                <option value="confidence">Sort by AI Score</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activities List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Activities ({filteredAndSortedActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAndSortedActivities.length > 0 ? (
            <div className="space-y-4">
              {filteredAndSortedActivities.map((activity) => {
                const urgency = getUrgencyLevel(activity);
                const statusVariant = getStatusColor(activity.verification.status) as any;
                
                return (
                  <div key={activity.id} className="border border-slate-200 rounded-lg p-6 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-slate-900">{activity.title}</h3>
                          <Badge variant={statusVariant} size="sm">
                            {activity.verification.status.replace('_', ' ')}
                          </Badge>
                          {getUrgencyBadge(urgency)}
                        </div>
                        
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{getStudentName(activity.student_id)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4" />
                            <span>{activity.organization}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(activity.date)}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">AI Score:</span>
                            <Badge 
                              variant={
                                activity.verification.ai_confidence_score > 80 ? 'success' :
                                activity.verification.ai_confidence_score > 60 ? 'warning' : 'error'
                              }
                              size="sm"
                            >
                              {activity.verification.ai_confidence_score}%
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                          {activity.description}
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-slate-500">
                          <span>Type: {activity.type.replace('_', ' ')}</span>
                          <span>Documents: {activity.documents.length}</span>
                          <span>Location: {activity.location}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Link to={`/mentor/review/${activity.id}`}>
                          <Button size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Review
                          </Button>
                        </Link>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    <div className="border-t border-slate-200 pt-4">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">GPS Verification:</span>
                          {activity.documents[0]?.gps_verified ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-600" />
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Biometric Match:</span>
                          <span className="font-medium">
                            {activity.documents[0]?.biometric_match_score || 0}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-600">Days Pending:</span>
                          <span className="font-medium">
                            {Math.floor((Date.now() - new Date(activity.date).getTime()) / (1000 * 60 * 60 * 24))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Activities Found</h2>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'All activities have been reviewed.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}