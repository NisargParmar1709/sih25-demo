import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Modal } from '../ui/modal';
import { Institution } from '../../types';
import { formatDate } from '../../lib/utils';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  MessageSquare,
  Eye
} from 'lucide-react';

interface InstitutionApprovalRowProps {
  institution: Institution;
  onApprove: (id: string, notes: string) => void;
  onReject: (id: string, reason: string) => void;
  onRequestInfo: (id: string, message: string) => void;
}

export function InstitutionApprovalRow({ 
  institution, 
  onApprove, 
  onReject, 
  onRequestInfo 
}: InstitutionApprovalRowProps) {
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [actionNotes, setActionNotes] = useState('');

  const handleAction = (action: 'approve' | 'reject' | 'request_info') => {
    setActionType(action);
    setActionModalOpen(true);
    setActionNotes('');
  };

  const submitAction = () => {
    switch (actionType) {
      case 'approve':
        onApprove(institution.id, actionNotes);
        break;
      case 'reject':
        onReject(institution.id, actionNotes);
        break;
      case 'request_info':
        onRequestInfo(institution.id, actionNotes);
        break;
    }
    setActionModalOpen(false);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getActionTitle = () => {
    switch (actionType) {
      case 'approve': return 'Approve Institution';
      case 'reject': return 'Reject Institution';
      case 'request_info': return 'Request Additional Information';
      default: return 'Institution Action';
    }
  };

  return (
    <>
      <div className="border border-slate-200 rounded-lg p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-slate-900">{institution.name}</h3>
                <Badge variant={getStatusVariant(institution.status) as any}>
                  {institution.status}
                </Badge>
                <Badge variant="secondary" size="sm">
                  {institution.naac_grade} Grade
                </Badge>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-slate-600 mb-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4" />
                  <span>{institution.code}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{institution.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>{institution.total_students.toLocaleString()} students</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(institution.registration_date)}</span>
                </div>
              </div>

              <div className="text-sm text-slate-600">
                <span className="font-medium">Contact:</span> {institution.contact.principal} • {institution.contact.admin_email}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 ml-4">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Button>
            
            {institution.status === 'pending' && (
              <>
                <Button 
                  size="sm"
                  onClick={() => handleAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleAction('request_info')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Request Info
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => handleAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Verification Stats */}
        <div className="border-t border-slate-200 pt-4">
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Documents Processed:</span>
              <span className="font-medium">{institution.verification_stats.documents_processed.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Success Rate:</span>
              <span className="font-medium">{institution.verification_stats.success_rate}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Pending Verifications:</span>
              <span className="font-medium">{institution.verification_stats.pending_verifications}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={getActionTitle()}
        size="lg"
      >
        <div className="space-y-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
            <h4 className="font-medium text-slate-900 mb-1">{institution.name}</h4>
            <p className="text-sm text-slate-600">
              {institution.code} • {institution.location}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              {actionType === 'approve' ? 'Approval Notes (Optional)' :
               actionType === 'reject' ? 'Rejection Reason' :
               'Information Request Message'}
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              value={actionNotes}
              onChange={(e) => setActionNotes(e.target.value)}
              placeholder={
                actionType === 'approve' ? 'Optional notes about the approval...' :
                actionType === 'reject' ? 'Please provide a reason for rejection...' :
                'Please specify what additional information is needed...'
              }
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setActionModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={submitAction}
              disabled={actionType === 'reject' && !actionNotes.trim()}
              variant={actionType === 'reject' ? 'danger' : 'primary'}
            >
              {actionType === 'approve' ? 'Approve Institution' :
               actionType === 'reject' ? 'Reject Institution' :
               'Send Request'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}