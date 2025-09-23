import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Progress } from '../../components/ui/progress';
import { 
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Flag,
  MessageSquare,
  User,
  Calendar,
  MapPin,
  Building,
  FileText,
  Eye,
  Download
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Activity, Student, User as UserType } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';

interface ReviewDetailProps {
  user: UserType;
}

export function ReviewDetail({ user }: ReviewDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState('');
  const [decision, setDecision] = useState<'verified' | 'rejected' | 'under_review' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const activityData = await apiClient.getActivity(id);
        const studentData = await apiClient.getStudent(activityData.student_id);
        
        setActivity(activityData);
        setStudent(studentData);
        setComments(activityData.verification.mentor_comments || '');
      } catch (error) {
        console.error('Failed to load review data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleSubmitReview = async () => {
    if (!activity || !decision) return;

    setSubmitting(true);
    try {
      await apiClient.submitMentorReview(activity.id, {
        mentor_id: user.id,
        status: decision,
        comments,
        verification_date: new Date().toISOString()
      });

      navigate('/mentor/queue');
    } catch (error) {
      console.error('Failed to submit review:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!activity || !student) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Activity Not Found</h2>
        <Button onClick={() => navigate('/mentor/queue')}>
          Return to Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate('/mentor/queue')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Review Activity</h1>
            <p className="text-slate-600">{activity.title}</p>
          </div>
        </div>
        <Badge variant={getStatusColor(activity.verification.status) as any}>
          {activity.verification.status.replace('_', ' ')}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Student Profile</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-indigo-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">{student.name}</h3>
                  <p className="text-slate-600">{student.course}</p>
                  <div className="grid md:grid-cols-2 gap-4 mt-3 text-sm">
                    <div>
                      <span className="text-slate-500">Enrollment:</span>
                      <span className="ml-2 font-medium">{student.enrollment_number}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Year:</span>
                      <span className="ml-2 font-medium">Year {student.year}, Semester {student.semester}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">CGPA:</span>
                      <span className="ml-2 font-medium">{student.academic_details.current_cgpa}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Verification Score:</span>
                      <span className="ml-2 font-medium">{student.profile.verification_score}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activity Details */}
          <Card>
            <CardHeader>
              <CardTitle>Activity Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Date:</span>
                  <span className="text-sm font-medium">{formatDate(activity.date)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Location:</span>
                  <span className="text-sm font-medium">{activity.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Organization:</span>
                  <span className="text-sm font-medium">{activity.organization}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <span className="text-sm text-slate-600">Type:</span>
                  <span className="text-sm font-medium capitalize">
                    {activity.type.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">Description</h4>
                <p className="text-sm text-slate-600">{activity.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activity.documents.map((doc, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="font-medium text-slate-900">{doc.filename}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>

                    {doc.extracted_text && (
                      <div className="bg-slate-50 p-3 rounded-lg mb-3">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Extracted Text</h5>
                        <p className="text-sm text-slate-600">{doc.extracted_text}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">GPS Verified:</span>
                        {doc.gps_verified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">Biometric Match:</span>
                        <Badge 
                          variant={doc.biometric_match_score > 80 ? 'success' : 
                                  doc.biometric_match_score > 60 ? 'warning' : 'error'}
                          size="sm"
                        >
                          {doc.biometric_match_score}%
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600">File Size:</span>
                        <span className="font-medium">2.3 MB</span>
                      </div>
                    </div>

                    {doc.gps && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">GPS Coordinates</span>
                        </div>
                        <p className="text-sm text-blue-700 mt-1">
                          Lat: {doc.gps.lat.toFixed(4)}, Lng: {doc.gps.lng.toFixed(4)}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Review Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Your Review</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Decision
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                  <button
                    onClick={() => setDecision('verified')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      decision === 'verified'
                        ? 'border-green-500 bg-green-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-green-800">Approve</span>
                    </div>
                    <p className="text-sm text-green-700">
                      Activity is verified and authentic
                    </p>
                  </button>

                  <button
                    onClick={() => setDecision('under_review')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      decision === 'under_review'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium text-yellow-800">Flag for Review</span>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Needs additional verification
                    </p>
                  </button>

                  <button
                    onClick={() => setDecision('rejected')}
                    className={`p-4 border rounded-lg text-left transition-colors ${
                      decision === 'rejected'
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <span className="font-medium text-red-800">Reject</span>
                    </div>
                    <p className="text-sm text-red-700">
                      Activity cannot be verified
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Comments & Feedback
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Provide detailed feedback for the student..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <Button variant="outline" onClick={() => navigate('/mentor/queue')}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  loading={submitting}
                  disabled={!decision || submitting}
                >
                  Submit Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* AI Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>AI Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">Confidence Score</span>
                  <span className="text-sm font-bold">
                    {activity.verification.ai_confidence_score}%
                  </span>
                </div>
                <Progress 
                  value={activity.verification.ai_confidence_score} 
                  variant={getConfidenceColor(activity.verification.ai_confidence_score) as any}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {activity.verification.ai_confidence_score >= 85 ? 'High confidence - likely authentic' :
                   activity.verification.ai_confidence_score >= 60 ? 'Medium confidence - review recommended' :
                   'Low confidence - manual verification required'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Documents:</span>
                  <span className="font-medium">{activity.documents.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">GPS Match:</span>
                  <span className="font-medium">
                    {activity.documents.filter(d => d.gps_verified).length}/{activity.documents.length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Avg. Biometric:</span>
                  <span className="font-medium">
                    {Math.round(activity.documents.reduce((acc, d) => acc + d.biometric_match_score, 0) / activity.documents.length)}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Previous Reviews */}
          {activity.verification.mentor_comments && (
            <Card>
              <CardHeader>
                <CardTitle>Previous Comments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm text-slate-700">{activity.verification.mentor_comments}</p>
                  {activity.verification.verification_date && (
                    <p className="text-xs text-slate-500 mt-2">
                      {formatDate(activity.verification.verification_date)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Flag className="h-4 w-4 mr-2" />
                Escalate to Senior
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Contact Student
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                View Student Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}