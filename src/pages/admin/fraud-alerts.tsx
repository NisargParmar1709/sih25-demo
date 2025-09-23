import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { 
  Search,
  AlertTriangle,
  Eye,
  CheckCircle,
  XCircle,
  Flag,
  MapPin,
  User,
  Calendar,
  FileText
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User as UserType } from '../../types';
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
  assigned_to?: string;
  resolution_notes?: string;
  activity_details: {
    title: string;
    organization: string;
    student_name: string;
    date: string;
    location: string;
  };
}

interface FraudAlertsProps {
  user: UserType;
}

export function FraudAlerts({ user }: FraudAlertsProps) {
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<FraudAlert | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'resolve' | 'escalate' | 'false_positive'>('resolve');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFraudAlerts();
  }, []);

  const loadFraudAlerts = async () => {
    try {
      const data = await apiClient.getFraudAlerts();
      setAlerts(data);
    } catch (error) {
      console.error('Failed to load fraud alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (alert: FraudAlert, action: 'resolve' | 'escalate' | 'false_positive') => {
    setSelectedAlert(alert);
    setActionType(action);
    setActionModalOpen(true);
    setResolutionNotes('');
  };

  const submitAction = async () => {
    if (!selectedAlert) return;

    setSubmitting(true);
    try {
      const updates: any = {
        resolution_notes: resolutionNotes,
        resolved_by: user.id,
        resolved_at: new Date().toISOString()
      };

      switch (actionType) {
        case 'resolve':
          updates.status = 'resolved';
          break;
        case 'escalate':
          updates.status = 'investigating';
          updates.escalated = true;
          break;
        case 'false_positive':
          updates.status = 'false_positive';
          break;
      }

      await apiClient.updateFraudAlert(selectedAlert.id, updates);
      
      // Update local state
      setAlerts(prev => 
        prev.map(alert => 
          alert.id === selectedAlert.id 
            ? { ...alert, ...updates }
            : alert
        )
      );

      setActionModalOpen(false);
      setSelectedAlert(null);
    } catch (error) {
      console.error('Failed to update fraud alert:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.activity_details.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.activity_details.student_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || alert.status === statusFilter;
    
    return matchesSearch && matchesSeverity && matchesStatus;
  });

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
          <h1 className="text-2xl font-bold text-slate-900">Fraud Alerts</h1>
          <p className="text-slate-600 mt-1">
            Monitor and investigate suspicious activities flagged by AI
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search alerts by description, activity, or student..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Severity</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="false_positive">False Positive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Fraud Alerts ({filteredAlerts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAlerts.length > 0 ? (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const TypeIcon = getTypeIcon(alert.type);
                return (
                  <div key={alert.id} className="border border-slate-200 rounded-lg p-6">
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
                          onClick={() => window.location.href = `/admin/activities/${alert.activity_id}`}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Activity
                        </Button>
                        
                        {alert.status === 'open' && (
                          <>
                            <Button 
                              size="sm"
                              onClick={() => handleAction(alert, 'resolve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Resolve
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleAction(alert, 'escalate')}
                            >
                              <Flag className="h-4 w-4 mr-2" />
                              Escalate
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleAction(alert, 'false_positive')}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              False Positive
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {alert.resolution_notes && (
                      <div className="border-t border-slate-200 pt-4">
                        <div className="bg-slate-50 p-3 rounded-lg">
                          <h5 className="text-sm font-medium text-slate-700 mb-1">Resolution Notes</h5>
                          <p className="text-sm text-slate-600">{alert.resolution_notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <AlertTriangle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Fraud Alerts Found</h2>
              <p className="text-slate-600">
                {searchTerm || severityFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No fraud alerts have been detected.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={`${actionType === 'resolve' ? 'Resolve' : actionType === 'escalate' ? 'Escalate' : 'Mark as False Positive'} Alert`}
        size="lg"
      >
        {selectedAlert && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-1 capitalize">
                {selectedAlert.type.replace('_', ' ')}
              </h4>
              <p className="text-sm text-slate-600">{selectedAlert.description}</p>
              <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                <span>Student: {selectedAlert.activity_details.student_name}</span>
                <span>Activity: {selectedAlert.activity_details.title}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                {actionType === 'resolve' ? 'Resolution Notes' :
                 actionType === 'escalate' ? 'Escalation Reason' :
                 'False Positive Explanation'}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder={
                  actionType === 'resolve' ? 'Describe how this alert was resolved...' :
                  actionType === 'escalate' ? 'Explain why this needs escalation...' :
                  'Explain why this is a false positive...'
                }
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setActionModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitAction}
                loading={submitting}
                disabled={!resolutionNotes.trim()}
              >
                {actionType === 'resolve' ? 'Resolve Alert' :
                 actionType === 'escalate' ? 'Escalate Alert' :
                 'Mark False Positive'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}