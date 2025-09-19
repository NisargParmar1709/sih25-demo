import { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../lib/api';
import { Activity } from '../../types';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  MapPin, 
  User,
  FileText,
  Eye
} from 'lucide-react';

export function JudgeModePage() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [currentActivity, setCurrentActivity] = useState<Activity | null>(null);
  const [step, setStep] = useState(0);

  const scenarios = [
    {
      id: 'clean',
      title: 'Clean Verification',
      description: 'High confidence, all checks pass',
      icon: CheckCircle,
      color: 'text-green-600 bg-green-100',
    },
    {
      id: 'low-confidence',
      title: 'Low Confidence Review',
      description: 'AI flags for mentor review',
      icon: AlertTriangle,
      color: 'text-yellow-600 bg-yellow-100',
    },
    {
      id: 'fraud',
      title: 'Fraud Detection',
      description: 'GPS mismatch, document issues',
      icon: XCircle,
      color: 'text-red-600 bg-red-100',
    },
  ];

  const loadScenario = (scenarioId: string) => {
    const activity = apiClient.getScenarioData(scenarioId as any);
    setCurrentActivity(activity);
    setSelectedScenario(scenarioId);
    setStep(0);
  };

  const getStepContent = () => {
    if (!currentActivity) return null;

    switch (step) {
      case 0:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 1: Document Upload</h3>
            <div className="bg-slate-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <FileText className="h-5 w-5 text-slate-500" />
                <span className="font-medium">{currentActivity.title}</span>
              </div>
              <p className="text-sm text-slate-600 mb-3">{currentActivity.description}</p>
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>{currentActivity.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>{currentActivity.organization}</span>
                </div>
              </div>
            </div>
            <div className="grid gap-3">
              {currentActivity.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg">
                  <span className="text-sm font-medium">{doc.filename}</span>
                  <Badge variant="success" size="sm">Uploaded</Badge>
                </div>
              ))}
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 2: AI Analysis</h3>
            <div className="grid gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">GPS Verification</span>
                    <Badge variant={currentActivity.documents[0].gps_verified ? 'success' : 'error'}>
                      {currentActivity.documents[0].gps_verified ? 'Verified' : 'Failed'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Location: {currentActivity.documents[0].gps?.lat}, {currentActivity.documents[0].gps?.lng}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Biometric Match</span>
                    <Badge variant={currentActivity.documents[0].biometric_match_score > 80 ? 'success' : 'warning'}>
                      {currentActivity.documents[0].biometric_match_score}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Face recognition confidence score
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Document Analysis</span>
                    <Badge variant="info">Processed</Badge>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {currentActivity.documents[0].extracted_text}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">AI Confidence</span>
                    <Badge 
                      variant={
                        currentActivity.verification.ai_confidence_score > 90 ? 'success' :
                        currentActivity.verification.ai_confidence_score > 60 ? 'warning' : 'error'
                      }
                    >
                      {currentActivity.verification.ai_confidence_score}%
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">
                    Overall AI assessment score
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Step 3: Mentor Review</h3>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Final Decision</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={currentActivity.verification.status as any}>
                      {currentActivity.verification.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  {currentActivity.verification.mentor_comments && (
                    <div>
                      <span className="font-medium block mb-2">Mentor Comments:</span>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {currentActivity.verification.mentor_comments}
                      </p>
                    </div>
                  )}

                  {currentActivity.additional_proof.note && (
                    <div>
                      <span className="font-medium block mb-2">Additional Notes:</span>
                      <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded">
                        {currentActivity.additional_proof.note}
                      </p>
                    </div>
                  )}

                  {currentActivity.verification.verification_date && (
                    <div className="text-sm text-slate-500">
                      Verified on: {new Date(currentActivity.verification.verification_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Judge Mode Demo</h1>
        <p className="text-lg text-slate-600">
          Experience different verification scenarios to understand the platform's capabilities
        </p>
      </div>

      {!selectedScenario ? (
        <div className="grid md:grid-cols-3 gap-6">
          {scenarios.map((scenario) => (
            <Card key={scenario.id} className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="p-6" onClick={() => loadScenario(scenario.id)}>
                <div className={`w-12 h-12 rounded-lg ${scenario.color} flex items-center justify-center mb-4 mx-auto`}>
                  <scenario.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-center mb-2">{scenario.title}</h3>
                <p className="text-sm text-slate-600 text-center mb-4">{scenario.description}</p>
                <Button className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  View Scenario
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              {scenarios.find(s => s.id === selectedScenario)?.title}
            </h2>
            <Button variant="outline" onClick={() => {
              setSelectedScenario(null);
              setCurrentActivity(null);
              setStep(0);
            }}>
              Back to Scenarios
            </Button>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mb-8">
            {[0, 1, 2].map((stepIndex) => (
              <div key={stepIndex} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step >= stepIndex
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {stepIndex + 1}
                </div>
                {stepIndex < 2 && (
                  <div className={`w-20 h-0.5 ${step > stepIndex ? 'bg-indigo-600' : 'bg-slate-200'}`}></div>
                )}
              </div>
            ))}
          </div>

          <Card>
            <CardContent className="p-8">
              {getStepContent()}
              
              <div className="flex justify-between mt-8">
                <Button
                  variant="outline"
                  onClick={() => setStep(Math.max(0, step - 1))}
                  disabled={step === 0}
                >
                  Previous
                </Button>
                <Button
                  onClick={() => setStep(Math.min(2, step + 1))}
                  disabled={step === 2}
                >
                  Next Step
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}