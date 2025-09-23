import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { 
  Search,
  Filter,
  Building,
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  MessageSquare,
  Eye,
  Download
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Institution, User } from '../../types';
import { formatDate } from '../../lib/utils';

interface InstitutionsProps {
  user: User;
}

export function Institutions({ user }: InstitutionsProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'request_info'>('approve');
  const [actionNotes, setActionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadInstitutions();
  }, [statusFilter]);

  const loadInstitutions = async () => {
    try {
      const params = statusFilter === 'all' ? {} : { status: statusFilter };
      const data = await apiClient.getInstitutions(params);
      setInstitutions(data);
    } catch (error) {
      console.error('Failed to load institutions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (institution: Institution, action: 'approve' | 'reject' | 'request_info') => {
    setSelectedInstitution(institution);
    setActionType(action);
    setActionModalOpen(true);
    setActionNotes('');
  };

  const submitAction = async () => {
    if (!selectedInstitution) return;

    setSubmitting(true);
    try {
      const updates: any = {
        admin_notes: actionNotes,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString()
      };

      switch (actionType) {
        case 'approve':
          updates.status = 'approved';
          break;
        case 'reject':
          updates.status = 'rejected';
          updates.rejection_reason = actionNotes;
          break;
        case 'request_info':
          updates.info_requested = true;
          updates.info_request_message = actionNotes;
          break;
      }

      await apiClient.updateInstitution(selectedInstitution.id, updates);
      
      // Update local state
      setInstitutions(prev => 
        prev.map(inst => 
          inst.id === selectedInstitution.id 
            ? { ...inst, ...updates }
            : inst
        )
      );

      setActionModalOpen(false);
      setSelectedInstitution(null);
    } catch (error) {
      console.error('Failed to update institution:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredInstitutions = institutions.filter(institution =>
    institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    institution.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const statusCounts = {
    all: institutions.length,
    pending: institutions.filter(i => i.status === 'pending').length,
    approved: institutions.filter(i => i.status === 'approved').length,
    rejected: institutions.filter(i => i.status === 'rejected').length
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
          <h1 className="text-2xl font-bold text-slate-900">Institution Management</h1>
          <p className="text-slate-600 mt-1">
            Review and manage institution registrations and approvals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export List
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
                placeholder="Search institutions by name, code, or location..."
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
                <option value="approved">Approved ({statusCounts.approved})</option>
                <option value="rejected">Rejected ({statusCounts.rejected})</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Institutions List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Institutions ({filteredInstitutions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInstitutions.length > 0 ? (
            <div className="space-y-4">
              {filteredInstitutions.map((institution) => (
                <div key={institution.id} className="border border-slate-200 rounded-lg p-6">
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
                            onClick={() => handleAction(institution, 'approve')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAction(institution, 'request_info')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Request Info
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleAction(institution, 'reject')}
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
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Institutions Found</h2>
              <p className="text-slate-600">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No institutions have registered yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Modal */}
      <Modal
        isOpen={actionModalOpen}
        onClose={() => setActionModalOpen(false)}
        title={getActionTitle()}
        size="lg"
      >
        {selectedInstitution && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-1">{selectedInstitution.name}</h4>
              <p className="text-sm text-slate-600">
                {selectedInstitution.code} • {selectedInstitution.location}
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
                loading={submitting}
                disabled={actionType === 'reject' && !actionNotes.trim()}
                variant={actionType === 'reject' ? 'danger' : 'primary'}
              >
                {actionType === 'approve' ? 'Approve Institution' :
                 actionType === 'reject' ? 'Reject Institution' :
                 'Send Request'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}