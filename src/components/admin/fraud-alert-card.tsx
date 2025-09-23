import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { 
  AlertTriangle,
  MapPin,
  User,
  Calendar,
  FileText,
  Flag,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface FraudAlert {
  id: string;
  activity_id: string;
  student_id: string;
  type: 'gps_mismatch' | 'duplicate_document' | 'low_biometric' | 'suspicious_pattern';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detected_at: string;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  activity_details: {
    title: string;
    organization: string;
    student_name: string;
    date: string;
    location: string;
  };
}

interface FraudAlertCardProps {
  alert: FraudAlert;
  onResolve: (id: string) => void;
  onEscalate: (id: string) => void;
  onMarkFalsePositive: (id: string) => void;
  onViewActivity: (activityId: string) => void;
}

export function FraudAlertCard({ 
  alert, 
  onResolve, 
  onEscalate, 
  onMarkFalsePositive, 
  onViewActivity 
}: FraudAlertCardProps) {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved': return 'success';
      case 'false_positive': return 'success';
      case 'investigating': return 'warning';
      case 'open': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'gps_mismatch': return MapPin;
      case 'duplicate_document': return FileText;
      case 'low_biometric': return User;
      case 'suspicious_pattern': return Flag;
      default: return AlertTriangle;
    }
  };

  const TypeIcon = getTypeIcon(alert.type);

  return (
    <div className="border border-slate-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            alert.severity === 'critical' ? 'bg-red-100' :
            alert.severity === 'high' ? 'bg-red-100' :
            alert.severity === 'medium' ? 'bg-yellow-100' :
            'bg-blue-100'
          }`}>
            <TypeIcon className={`h-6 w-6 ${
              alert.severity === 'critical' ? 'text-red-600' :
              alert.severity === 'high' ? 'text-red-600' :
              alert.severity === 'medium' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-lg font-semibold text-slate-900 capitalize">
                {alert.type.replace('_', ' ')}
              </h3>
              <Badge variant={getSeverityVariant(alert.severity) as any}>
                {alert.severity}
              </Badge>
              <Badge variant={getStatusVariant(alert.status) as any}>
                {alert.status.replace('_', ' ')}
              </Badge>
            </div>
            
            <p className="text-slate-600 mb-3">{alert.description}</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{alert.activity_details.student_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>{alert.activity_details.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(alert.detected_at)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>{alert.activity_details.location}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewActivity(alert.activity_id)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Activity
          </Button>
          
          {alert.status === 'open' && (
            <>
              <Button 
                size="sm"
                onClick={() => onResolve(alert.id)}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEscalate(alert.id)}
              >
                <Flag className="h-4 w-4 mr-2" />
                Escalate
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onMarkFalsePositive(alert.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                False Positive
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}