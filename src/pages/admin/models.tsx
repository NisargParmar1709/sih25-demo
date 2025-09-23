import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Eye,
  Download,
  Settings
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  false_positive_rate: number;
  false_negative_rate: number;
  confidence_distribution: {
    high: number;
    medium: number;
    low: number;
  };
  drift_indicator: 'stable' | 'warning' | 'critical';
  last_updated: string;
}

interface ModelsProps {
  user: User;
}

export function Models({ user }: ModelsProps) {
  const [metrics, setMetrics] = useState<ModelMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadModelMetrics();
  }, []);

  const loadModelMetrics = async () => {
    try {
      const data = await apiClient.getModelMetrics();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to load model metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMetrics = async () => {
    setRefreshing(true);
    try {
      await loadModelMetrics();
    } finally {
      setRefreshing(false);
    }
  };

  const getDriftColor = (indicator: string) => {
    switch (indicator) {
      case 'stable': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  if (loading || !metrics) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const confidenceData = Object.entries(metrics.confidence_distribution).map(([key, value]) => ({
    name: key,
    value,
    color: key === 'high' ? '#10B981' : key === 'medium' ? '#F59E0B' : '#EF4444'
  }));

  const performanceData = [
    { name: 'Accuracy', value: metrics.accuracy },
    { name: 'Precision', value: metrics.precision },
    { name: 'Recall', value: metrics.recall },
    { name: 'F1 Score', value: metrics.f1_score }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">AI Model Monitoring</h1>
          <p className="text-slate-600 mt-1">
            Monitor model performance, accuracy, and drift indicators
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline"
            onClick={handleRefreshMetrics}
            loading={refreshing}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Metrics
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Model Status */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Model Status</h2>
            <p className="text-blue-100 mb-4">
              Current verification model performance and health
            </p>
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-2xl font-bold">{metrics.accuracy}%</div>
                <div className="text-sm text-blue-100">Overall Accuracy</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{metrics.f1_score}%</div>
                <div className="text-sm text-blue-100">F1 Score</div>
              </div>
              <div>
                <Badge variant={getDriftColor(metrics.drift_indicator) as any} className="text-white">
                  {metrics.drift_indicator.toUpperCase()}
                </Badge>
                <div className="text-sm text-blue-100 mt-1">Drift Status</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-100">
              Last Updated: {new Date(metrics.last_updated).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Accuracy</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.accuracy}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.accuracy} variant="success" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Precision</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.precision}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={metrics.precision} variant="default" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">False Positive Rate</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.false_positive_rate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
            <Progress value={metrics.false_positive_rate} variant="warning" className="mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">False Negative Rate</p>
                <p className="text-2xl font-bold text-slate-900">{metrics.false_negative_rate}%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-600" />
            </div>
            <Progress value={metrics.false_negative_rate} variant="error" className="mt-3" />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="value" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Confidence Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Confidence Score Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={confidenceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    dataKey="value"
                  >
                    {confidenceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {confidenceData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm capitalize">{item.name} Confidence</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Model Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark as Trusted
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retrain Model
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <TrendingDown className="h-4 w-4 mr-2" />
              Rollback Version
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sample Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View False Positives
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Eye className="h-4 w-4 mr-2" />
              View False Negatives
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analyze Patterns
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Adjust Thresholds
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Set Drift Alerts
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Config
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Drift Warning */}
      {metrics.drift_indicator !== 'stable' && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-6 w-6 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-lg font-medium text-yellow-800 mb-2">
                  Model Drift Detected
                </h4>
                <p className="text-yellow-700 mb-4">
                  The model performance has {metrics.drift_indicator === 'warning' ? 'slightly degraded' : 'significantly degraded'}. 
                  Consider retraining the model with recent data to maintain accuracy.
                </p>
                <div className="flex space-x-3">
                  <Button size="sm">
                    Schedule Retraining
                  </Button>
                  <Button variant="outline" size="sm">
                    View Drift Analysis
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}