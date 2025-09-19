import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileUpload } from '../ui/file-upload';
import { Modal } from '../ui/modal';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Camera, 
  CheckCircle,
  AlertCircle,
  Clock
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Activity } from '../../types';

interface ActivityFormData {
  type: Activity['type'];
  title: string;
  organization: string;
  date: string;
  location: string;
  description: string;
  documents: File[];
  gps: { lat: number; lng: number } | null;
  biometric_score: number | null;
}

const ACTIVITY_TYPES = [
  { value: 'internship_certificate', label: 'Internship Certificate', description: 'Completion certificates from internships' },
  { value: 'participation_certificate', label: 'Participation Certificate', description: 'Workshop, seminar, or event participation' },
  { value: 'skill_certificate', label: 'Skill Certificate', description: 'Technical or professional skill certifications' },
  { value: 'project_completion', label: 'Project Completion', description: 'Academic or personal project completion' },
  { value: 'social_work', label: 'Social Work', description: 'Community service and volunteer work' }
] as const;

interface AddActivityWizardProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
}

export function AddActivityWizard({ isOpen, onClose, studentId }: AddActivityWizardProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ActivityFormData>({
    type: 'participation_certificate',
    title: '',
    organization: '',
    date: '',
    location: '',
    description: '',
    documents: [],
    gps: null,
    biometric_score: null
  });

  const steps = [
    'Activity Details',
    'Document Upload', 
    'Evidence Capture',
    'Review & Submit'
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleInputChange = (field: keyof ActivityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const captureGPS = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          handleInputChange('gps', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Fallback to demo coordinates
          handleInputChange('gps', {
            lat: 23.0225 + (Math.random() - 0.5) * 0.01,
            lng: 72.5714 + (Math.random() - 0.5) * 0.01
          });
        }
      );
    } else {
      // Fallback for demo
      handleInputChange('gps', {
        lat: 23.0225 + (Math.random() - 0.5) * 0.01,
        lng: 72.5714 + (Math.random() - 0.5) * 0.01
      });
    }
  };

  const simulateBiometric = () => {
    // Simulate biometric processing
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    handleInputChange('biometric_score', score);
  };

  const handleSubmit = async () => {
    setLoading(true);
    
    try {
      // Simulate document upload and processing
      const documents = formData.documents.map((file, index) => ({
        filename: file.name,
        url: `https://demo.invalid/docs/${file.name}`,
        gps: formData.gps,
        gps_verified: formData.gps !== null,
        biometric_match_score: formData.biometric_score || Math.floor(Math.random() * 30) + 70,
        extracted_text: `Extracted text from ${file.name}...`
      }));

      const activityData = {
        student_id: studentId,
        type: formData.type,
        title: formData.title,
        organization: formData.organization,
        date: formData.date,
        location: formData.location,
        description: formData.description,
        documents,
        additional_proof: {}
      };

      const newActivity = await apiClient.createActivity(activityData);
      
      // Close wizard and navigate to activity detail
      onClose();
      navigate(`/student/activities/${newActivity.id}`);
      
    } catch (error) {
      console.error('Failed to create activity:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Activity Type
              </label>
              <div className="grid gap-3">
                {ACTIVITY_TYPES.map((type) => (
                  <div
                    key={type.value}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      formData.type === type.value
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-slate-900">{type.label}</h3>
                        <p className="text-sm text-slate-600 mt-1">{type.description}</p>
                      </div>
                      {formData.type === type.value && (
                        <CheckCircle className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Activity Title"
                required
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Backend Development Internship"
              />
              <Input
                label="Organization"
                required
                value={formData.organization}
                onChange={(e) => handleInputChange('organization', e.target.value)}
                placeholder="e.g., TechCorp Pvt Ltd"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Date"
                type="date"
                required
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              <Input
                label="Location"
                required
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Ahmedabad, Gujarat, India"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your activity, responsibilities, and achievements..."
              />
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Upload Documents</h3>
              <p className="text-sm text-slate-600 mb-4">
                Upload certificates, completion letters, or other supporting documents.
              </p>
            </div>

            <FileUpload
              onFilesChange={(files) => handleInputChange('documents', files)}
              accept=".pdf,.jpg,.jpeg,.png,.pptx,.docx"
              multiple={true}
              maxSize={10}
              maxFiles={5}
            />

            {formData.documents.length > 0 && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {formData.documents.length} document(s) ready for upload
                  </span>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Evidence Capture</h3>
              <p className="text-sm text-slate-600 mb-4">
                Capture additional evidence to strengthen your verification.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>GPS Location</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.gps ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">Location Captured</span>
                      </div>
                      <p className="text-xs text-slate-600">
                        Lat: {formData.gps.lat.toFixed(4)}, Lng: {formData.gps.lng.toFixed(4)}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">
                        Capture your current location to verify activity location.
                      </p>
                      <Button onClick={captureGPS} className="w-full">
                        <MapPin className="h-4 w-4 mr-2" />
                        Capture GPS Location
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Camera className="h-5 w-5" />
                    <span>Biometric Verification</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {formData.biometric_score ? (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-sm font-medium text-green-800">
                          Match Score: {formData.biometric_score}%
                        </span>
                      </div>
                      <Progress 
                        value={formData.biometric_score} 
                        variant="success" 
                        size="sm" 
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600">
                        Run biometric verification for identity confirmation.
                      </p>
                      <Button onClick={simulateBiometric} className="w-full">
                        <Camera className="h-4 w-4 mr-2" />
                        Run Biometric Check
                      </Button>
                      <p className="text-xs text-slate-500">
                        Demo: Simulates biometric matching score
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">Review & Submit</h3>
              <p className="text-sm text-slate-600 mb-4">
                Review your activity details before submission.
              </p>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Activity Type</label>
                    <p className="text-sm text-slate-900">
                      {ACTIVITY_TYPES.find(t => t.value === formData.type)?.label}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Title</label>
                    <p className="text-sm text-slate-900">{formData.title}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Organization</label>
                    <p className="text-sm text-slate-900">{formData.organization}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Date</label>
                    <p className="text-sm text-slate-900">{formData.date}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <p className="text-sm text-slate-900">{formData.location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-slate-700">Description</label>
                  <p className="text-sm text-slate-900">{formData.description}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="flex items-center space-x-4">
                    <Badge variant="info">{formData.documents.length} Documents</Badge>
                    {formData.gps && <Badge variant="success">GPS Verified</Badge>}
                    {formData.biometric_score && (
                      <Badge variant="success">Biometric: {formData.biometric_score}%</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">Processing Timeline</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Your activity will be processed by AI within 2-3 minutes. 
                    Expected confidence score: 75-95% based on provided evidence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return formData.title && formData.organization && formData.date && formData.location;
      case 1:
        return formData.documents.length > 0;
      case 2:
        return true; // Optional evidence
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Add New Activity">
      <div className="space-y-6">
        {/* Progress Steps */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                index <= currentStep 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-indigo-600' : 'text-slate-500'
              }`}>
                {step}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-12 h-0.5 mx-4 ${
                  index < currentStep ? 'bg-indigo-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="min-h-96">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {currentStep === steps.length - 1 ? (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={!canProceed()}
            >
              Submit Activity
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}