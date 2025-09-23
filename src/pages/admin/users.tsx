// src/pages/admin/users.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { 
  Search,
  Filter,
  Users as UsersIcon,        // aliased to avoid name collision
  Shield,
  Building,
  GraduationCap,
  Settings as SettingsIcon,  // aliased to avoid potential collisions
  Eye,
  Edit,
  UserX,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User as UserType } from '../../types';
import { formatDate } from '../../lib/utils';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'mentor' | 'institution_admin' | 'admin' | 'auditor';
  institution_id?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  last_login: string;
  permissions?: string[];
}

interface AdminUsersProps {
  user: UserType;
}

export function AdminUsers({ user }: AdminUsersProps) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [customPermissions, setCustomPermissions] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter, statusFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      
      const data = await apiClient.getUsers(params);
      setUsers(data || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (selectedUser: AdminUser) => {
    setSelectedUser(selectedUser);
    setNewRole(selectedUser.role);
    setCustomPermissions(selectedUser.permissions || []);
    setRoleModalOpen(true);
  };

  const submitRoleChange = async () => {
    if (!selectedUser) return;

    setSubmitting(true);
    try {
      await apiClient.updateUserRole(selectedUser.id, newRole);
      
      // Update local state
      setUsers(prev => 
        prev.map(u => 
          u.id === selectedUser.id 
            ? { ...u, role: newRole as any, permissions: customPermissions }
            : u
        )
      );

      setRoleModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Failed to update user role:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      await apiClient.updateUserStatus(userId, newStatus);
      
      setUsers(prev => 
        prev.map(u => 
          u.id === userId 
            ? { ...u, status: newStatus as any }
            : u
        )
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return GraduationCap;
      case 'mentor': return Shield;
      case 'institution_admin': return Building;
      case 'admin': return SettingsIcon;
      case 'auditor': return Eye;
      default: return UsersIcon;
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'error';
      case 'auditor': return 'warning';
      case 'mentor': return 'info';
      case 'institution_admin': return 'secondary';
      case 'student': return 'success';
      default: return 'default';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const availableRoles = [
    { value: 'student', label: 'Student' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'institution_admin', label: 'Institution Admin' },
    { value: 'auditor', label: 'NAAC Auditor' },
    { value: 'admin', label: 'System Admin' }
  ];

  const availablePermissions = [
    'view_all_institutions',
    'approve_institutions',
    'manage_users',
    'view_fraud_alerts',
    'generate_reports',
    'system_settings',
    'audit_logs'
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
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">
            Manage user roles, permissions, and access controls
          </p>
        </div>
        <Button onClick={() => window.location.href = '/admin/audit-logs'}>
          <Eye className="h-4 w-4 mr-2" />
          View Audit Logs
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="auditor">Auditors</option>
                <option value="mentor">Mentors</option>
                <option value="institution_admin">Institution Admins</option>
                <option value="student">Students</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((u) => {
                const RoleIcon = getRoleIcon(u.role);
                return (
                  <div key={u.id} className="border border-slate-200 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <RoleIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-slate-900">{u.name}</h3>
                            <Badge variant={getRoleVariant(u.role) as any}>
                              {u.role.replace('_', ' ')}
                            </Badge>
                            <Badge variant={getStatusVariant(u.status) as any}>
                              {u.status}
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-slate-600 mb-2">
                            {u.email}
                          </div>
                          
                          <div className="flex items-center space-x-4 text-sm text-slate-500">
                            <span>Joined: {formatDate(u.created_at)}</span>
                            <span>Last login: {formatDate(u.last_login)}</span>
                            {u.institution_id && (
                              <span>Institution: {u.institution_id}</span>
                            )}
                          </div>

                          {u.permissions && u.permissions.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {u.permissions.map((permission) => (
                                <Badge key={permission} variant="secondary" size="sm">
                                  {permission.replace('_', ' ')}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 ml-4">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleRoleChange(u)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Role
                        </Button>
                        
                        <Button 
                          variant={u.status === 'active' ? 'outline' : 'ghost'}
                          size="sm"
                          onClick={() => toggleUserStatus(u.id, u.status)}
                        >
                          {u.status === 'active' ? (
                            <>
                              <UserX className="h-4 w-4 mr-2" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-16">
              <UsersIcon className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Users Found</h2>
              <p className="text-slate-600">
                {searchTerm || roleFilter !== 'all' || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters.'
                  : 'No users match the current criteria.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Change Modal */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Change User Role"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
              <h4 className="font-medium text-slate-900 mb-1">{selectedUser.name}</h4>
              <p className="text-sm text-slate-600">{selectedUser.email}</p>
              <p className="text-sm text-slate-500 mt-1">
                Current role: <span className="font-medium">{selectedUser.role.replace('_', ' ')}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                New Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableRoles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
            </div>

            {(newRole === 'admin' || newRole === 'auditor') && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Custom Permissions
                </label>
                <div className="space-y-2">
                  {availablePermissions.map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customPermissions.includes(permission)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCustomPermissions(prev => [...prev, permission]);
                          } else {
                            setCustomPermissions(prev => prev.filter(p => p !== permission));
                          }
                        }}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-sm text-slate-700 capitalize">
                        {permission.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setRoleModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitRoleChange}
                loading={submitting}
                disabled={submitting}
              >
                Update Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AdminUsers;
