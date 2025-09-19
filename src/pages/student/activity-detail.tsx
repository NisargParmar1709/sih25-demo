import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Modal } from '../../components/ui/modal';
import { Input } from '../../components/ui/input';
import { FileUpload } from '../../components/ui/file-upload';
import { 
  ArrowLeft,
  MapPin,
  User,
  Calendar,
  Building,
  FileText,
  Eye,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Share,
  Flag,
  Download
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Activity } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';

export function ActivityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [appealModalOpen, setAppealModalOpen] = useState(false);
  const [appealForm, setAppealForm] = useState({
    message: '',
    documents: [] as File[]
  });
  const [submittingAppeal, setSubmittingAppeal] = useState(false);

  useEffect(() => {
    const loadActivity = async () => {
      if (!id) return;
      
      try {
        const activityData = await apiClient.getActivity(id);
        setActivity(activityData);
      } catch (error) {
        console.error('Failed to load activity:', error);
      } finally {
        setLoading(false);
      }
    };

    loadActivity();
  }, [id]);

  const handleAppealSubmit = async () => {
    if (!activity) return;

    setSubmittingAppeal(true);
    try {
      await apiClient.createAppeal(activity.id, {
        student_id: activity.student_id,
        message: appealForm.message,
        additional_documents: appealForm.documents.map(file => ({
          filename: file.name,
          url: `https://demo.invalid/appeals/${file.name}`,
          uploaded_at: new Date().toISOString()
        }))
      });

      // Update activity status
      setActivity(prev => prev ? {
        ...prev,
        verification: {
          ...prev.verification,
          status: 'under_review'
        }
      } : null);

      setAppealModalOpen(false);
      setAppealForm({ message: '', documents: [] });
    } catch (error) {
      console.error('Failed to submit appeal:', error);
    } finally {
      setSubmittingAppeal(false);
    }
  };

  const shareToLinkedIn = () => {
    if (!activity) return;
    
    const text = `I've successfully completed ${activity.title} at ${activity.organization}! 🎉 #Achievement #Verified`;
    const url = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const getStatusIcon = (status: Activity['verification']['status']) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'under_review':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Activity Not Found</h2>
        <Button onClick={() => navigate('/student/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }

  const statusVariant = getStatusColor(activity.verification.status) as any;
  const canAppeal = activity.verification.status === 'rejected' || 
                   activity.verification.ai_confidence_score < 50;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{activity.title}</h1>
            <p className="text-slate-600">{activity.organization}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {activity.verification.status === 'verified' && (
            <Button variant="outline" onClick={shareToLinkedIn}>
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
          {canAppeal && (
            <Button variant="outline" onClick={() => setAppealModalOpen(true)}>
              <Flag className="h-4 w-4 mr-2" />
              Appeal
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Activity Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Activity Details</CardTitle>
                <Badge variant={statusVariant} className="flex items-center space-x-1">
                  {getStatusIcon(activity.verification.status)}
                  <span>{activity.verification.status.replace('_', ' ')}</span>
                </Badge>
              </div>
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
              <CardTitle>Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {activity.documents.map((doc, index) => (
                  <div key={index} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <FileText className="h-5 w-5 text-slate-500" />
                        <span className="font-medium text-slate-900">{doc.filename}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>

                    {doc.extracted_text && (
                      <div className="bg-slate-50 p-3 rounded-lg mb-3">
                        <h5 className="text-sm font-medium text-slate-700 mb-1">Extracted Text</h5>
                        <p className="text-sm text-slate-600">{doc.extracted_text}</p>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">GPS Verified:</span>
                        <Badge 
                          variant={doc.gps_verified ? 'success' : 'error'} 
                          size="sm" 
                          className="ml-2"
                        >
                          {doc.gps_verified ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div>
                        <span className="text-slate-600">Biometric Match:</span>
                        <span className="ml-2 font-medium">{doc.biometric_match_score}%</span>
                      </div>
                    </div>

                    {doc.gps && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">GPS Location</span>
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

          {/* Mentor Comments */}
          {activity.verification.mentor_comments && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Mentor Comments</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-sm text-slate-700">{activity.verification.mentor_comments}</p>
                  {activity.verification.verification_date && (
                    <p className="text-xs text-slate-500 mt-2">
                      Reviewed on {formatDate(activity.verification.verification_date)}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Verification Status */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">AI Confidence</span>
                  <span className="text-sm font-bold">
                    {activity.verification.ai_confidence_score}%
                  </span>
                </div>
                <Progress 
                  value={activity.verification.ai_confidence_score} 
                  variant={getConfidenceColor(activity.verification.ai_confidence_score) as any}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Status:</span>
                  <Badge variant={statusVariant}>
                    {activity.verification.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {activity.verification.mentor_id && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Reviewed by:</span>
                    <span className="font-medium">Mentor</span>
                  </div>
                )}

                {activity.verification.verification_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Verified on:</span>
                    <span className="font-medium">
                      {formatDate(activity.verification.verification_date)}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.verification.status === 'verified' && (
                <Button className="w-full" onClick={shareToLinkedIn}>
                  <Share className="h-4 w-4 mr-2" />
                  Share Achievement
                </Button>
              )}

              {canAppeal && (
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setAppealModalOpen(true)}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Request Review
                </Button>
              )}

              <Button variant="ghost" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Certificate
              </Button>
            </CardContent>
          </Card>

          {/* Additional Proof */}
          {Object.keys(activity.additional_proof).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {Object.entries(activity.additional_proof).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-slate-600 capitalize">
                        {key.replace('_', ' ')}:
                      </span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Appeal Modal */}
      <Modal
        isOpen={appealModalOpen}
        onClose={() => setAppealModalOpen(false)}
        title="Request Review / Appeal"
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Appeal Process</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Your appeal will be reviewed by a mentor. Please provide additional 
                  context or documentation to support your case.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Appeal Message
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              value={appealForm.message}
              onChange={(e) => setAppealForm(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Explain why you believe this activity should be verified..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Additional Documents (Optional)
            </label>
            <FileUpload
              onFilesChange={(files) => setAppealForm(prev => ({ ...prev, documents: files }))}
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={true}
              maxSize={5}
              maxFiles={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setAppealModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAppealSubmit}
              loading={submittingAppeal}
              disabled={!appealForm.message.trim()}
            >
              Submit Appeal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}