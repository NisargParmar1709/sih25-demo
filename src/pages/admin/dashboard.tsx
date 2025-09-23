import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { StatsCard } from '../../components/dashboard/stats-card';
import { AdminDashboardKPI } from '../../components/admin/admin-dashboard-kpi';
import { 
  Users, 
  Building, 
  FileText, 
  TrendingUp, 
  Clock,
  Shield,
  AlertTriangle,
  Download,
  Settings,
  BarChart3
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { SystemAnalytics, User } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface AdminDashboardProps {
  user: User;
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [pendingInstitutions, setPendingInstitutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isKioskMode, setIsKioskMode] = useState(false);

  useEffect(() => {
    // Check for kiosk mode
    const urlParams = new URLSearchParams(window.location.search);
    setIsKioskMode(urlParams.get('admin_kiosk') === 'true');
    
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [analyticsData, fraudData, institutionsData] = await Promise.all([
        apiClient.getAdminDashboard(),
        apiClient.getFraudAlerts(),
        apiClient.getInstitutions({ status: 'pending' })
      ]);
      
      setAnalytics(analyticsData);
      setFraudAlerts(fraudData);
      setPendingInstitutions(institutionsData);
    } catch (error) {
      console.error('Failed to load admin dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const statusColors = ['#10B981', '#F59E0B', '#EF4444', '#6366F1'];
  const statusData = Object.entries(analytics.verification_trends.status_distribution).map(([key, value], index) => ({
    name: key.replace('_', ' '),
    value,
    color: statusColors[index % statusColors.length]
  }));

  return (
    <div className={`space-y-8 ${isKioskMode ? 'text-lg' : ''}`}>
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`font-bold mb-2 ${isKioskMode ? 'text-4xl' : 'text-3xl'}`}>
              Admin Dashboard
            </h1>
            <p className="text-purple-100 mb-4">
              Platform Overview & System Management
            </p>
            <AdminDashboardKPI 
              analytics={analytics} 
              isKioskMode={isKioskMode}
            />
          </div>
          <div className="text-right">
            <div className="flex space-x-2 mb-4">
              <Button variant="secondary" onClick={() => window.location.href = '/admin/institutions'}>
                <Building className="h-4 w-4 mr-2" />
                Manage Institutions
              </Button>
            </div>
            <div className="text-sm text-purple-100">
              Processing Time: {analytics.platform_stats.avg_processing_time}
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatsCard
          title="Total Users"
          value={analytics.platform_stats.total_users.toLocaleString()}
          icon={Users}
          subtitle="Active platform users"
        />
        <StatsCard
          title="Institutions"
          value={analytics.platform_stats.total_institutions}
          icon={Building}
          subtitle={`${pendingInstitutions.length} pending approval`}
        />
        <StatsCard
          title="Documents"
          value={analytics.platform_stats.total_documents.toLocaleString()}
          icon={FileText}
          subtitle="Total processed"
        />
        <StatsCard
          title="Accuracy"
          value={`${analytics.platform_stats.verification_accuracy}%`}
          icon={TrendingUp}
          subtitle="Verification accuracy"
        />
        <StatsCard
          title="Processing Time"
          value={analytics.platform_stats.avg_processing_time}
          icon={Clock}
          subtitle="Average time"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Charts Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Processing Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.monthly_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="documents_processed" 
                    stroke="#6366F1" 
                    strokeWidth={2}
                    name="Documents Processed"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="verifications" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    name="Verifications"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Verification Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Verification Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {statusData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm capitalize">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium">{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Alerts */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/institutions'}
              >
                <Building className="h-4 w-4 mr-2" />
                Approve Institutions ({pendingInstitutions.length})
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/fraud-alerts'}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                View Fraud Alerts ({fraudAlerts.length})
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/reports'}
              >
                <Download className="h-4 w-4 mr-2" />
                Export NAAC Report
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/models'}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Model Evaluation
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = '/admin/settings'}
              >
                <Settings className="h-4 w-4 mr-2" />
                System Settings
              </Button>
            </CardContent>
          </Card>

          {/* Pending Approvals */}
          {pendingInstitutions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Pending Approvals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingInstitutions.slice(0, 3).map((institution) => (
                    <div key={institution.id} className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <h4 className="font-medium text-orange-800">{institution.name}</h4>
                      <p className="text-sm text-orange-700">{institution.location}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="warning" size="sm">
                          {institution.total_students} students
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/institutions/${institution.id}`}
                        >
                          Review
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingInstitutions.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.location.href = '/admin/institutions'}
                    >
                      View All ({pendingInstitutions.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Fraud Alerts */}
          {fraudAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600">Recent Fraud Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fraudAlerts.slice(0, 3).map((alert) => (
                    <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium text-red-800 capitalize">
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{alert.description}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant="error" size="sm">
                          {alert.severity}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => window.location.href = `/admin/fraud-alerts/${alert.id}`}
                        >
                          Investigate
                        </Button>
                      </div>
                    </div>
                  ))}
                  {fraudAlerts.length > 3 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => window.location.href = '/admin/fraud-alerts'}
                    >
                      View All Alerts ({fraudAlerts.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* System Health */}
          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">API Status</span>
                  <Badge variant="success" size="sm">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">AI Models</span>
                  <Badge variant="success" size="sm">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Database</span>
                  <Badge variant="success" size="sm">Healthy</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Storage</span>
                  <Badge variant="warning" size="sm">78% Used</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}