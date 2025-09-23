import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  Shield,
  Building,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User as UserType } from '../../types';
import { formatDate } from '../../lib/utils';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: string;
  ip_address: string;
}

interface AuditLogsProps {
  user: UserType;
}

export function AuditLogs({ user }: AuditLogsProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    loadAuditLogs();
  }, [actionFilter, dateFrom, dateTo]);

  const loadAuditLogs = async () => {
    try {
      const params: any = {};
      if (searchTerm) params.user = searchTerm;
      if (actionFilter !== 'all') params.action = actionFilter;
      if (dateFrom) params.from = dateFrom;
      if (dateTo) params.to = dateTo;
      
      const data = await apiClient.getAuditLogs(params);
      setLogs(data);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'Details', 'IP Address'].join(','),
      ...logs.map(log => [
        log.timestamp,
        log.user_name,
        log.action,
        log.resource_type,
        log.resource_id,
        `"${log.details}"`,
        log.ip_address
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'institution_approved':
      case 'institution_rejected':
        return Building;
      case 'activity_verified':
      case 'activity_rejected':
        return FileText;
      case 'fraud_alert_resolved':
        return AlertTriangle;
      case 'user_role_changed':
        return User;
      default:
        return Shield;
    }
  };

  const getActionVariant = (action: string) => {
    if (action.includes('approved') || action.includes('verified') || action.includes('resolved')) {
      return 'success';
    }
    if (action.includes('rejected') || action.includes('suspended')) {
      return 'error';
    }
    if (action.includes('changed') || action.includes('updated')) {
      return 'warning';
    }
    return 'info';
  };

  const filteredLogs = logs.filter(log =>
    log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.details.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const availableActions = [
    'institution_approved',
    'institution_rejected',
    'activity_verified',
    'activity_rejected',
    'fraud_alert_resolved',
    'user_role_changed'
  ];

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
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600 mt-1">
            Immutable timeline of all administrative actions and system events
          </p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by user or details..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Actions</option>
              {availableActions.map((action) => (
                <option key={action} value={action}>
                  {action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            <Input
              type="date"
              placeholder="From date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />

            <Input
              type="date"
              placeholder="To date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Audit Logs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Audit Trail ({filteredLogs.length} entries)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div key={log.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                          <ActionIcon className="h-5 w-5 text-slate-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <Badge variant={getActionVariant(log.action) as any} size="sm">
                              {log.action.replace('_', ' ')}
                            </Badge>
                            <span className="text-sm text-slate-500">
                              by {log.user_name}
                            </span>
                          </div>
                          
                          <p className="text-slate-900 mb-2">{log.details}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(log.timestamp)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>Resource: {log.resource_type}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <span>IP: {log.ip_address}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <Shield className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Audit Logs Found</h2>
              <p className="text-slate-600">
                {searchTerm || actionFilter !== 'all' || dateFrom || dateTo
                  ? 'Try adjusting your search criteria or date range.'
                  : 'No audit events have been recorded yet.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}