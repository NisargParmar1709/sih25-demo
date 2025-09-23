import { useEffect, useState } from 'react';
import { StatsCard } from '../../components/dashboard/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../lib/api';
import { Mentor, Activity, User } from '../../types';
import { 
  Award,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface MentorDashboardProps {
  user: User;
}

export function MentorDashboard({ user }: MentorDashboardProps) {
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [reviewQueue, setReviewQueue] = useState<Activity[]>([]);
  const [recentReviews, setRecentReviews] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [mentorData, queueData, recentData] = await Promise.all([
          apiClient.getMentor(user.id),
          apiClient.getMentorReviewQueue(user.id),
          apiClient.getMentorActivityLog(user.id, { limit: 5 })
        ]);
        
        setMentor(mentorData);
        setReviewQueue(queueData);
        setRecentReviews(recentData);
      } catch (error) {
        console.error('Failed to load mentor dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  if (loading || !mentor) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const urgentReviews = reviewQueue.filter(activity => {
    const daysSinceSubmission = Math.floor(
      (Date.now() - new Date(activity.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceSubmission > 3;
  }).length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {mentor.name}</h1>
            <p className="text-purple-100 mb-4">
              {mentor.designation} • {mentor.department}
            </p>
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-2xl font-bold">{mentor.verification_stats.total_reviews}</div>
                <div className="text-sm text-purple-100">Total Reviews</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mentor.verification_stats.accuracy_rate}%</div>
                <div className="text-sm text-purple-100">Accuracy Rate</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{mentor.verification_stats.avg_turnaround_time}h</div>
                <div className="text-sm text-purple-100">Avg. Turnaround</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Link to="/mentor/queue">
              <Button variant="secondary" className="mb-4">
                <FileText className="h-4 w-4 mr-2" />
                Review Queue ({reviewQueue.length})
              </Button>
            </Link>
            <div className="mb-4">
              <Link to="/mentor/batches">
                <Button variant="outline" size="sm" className="mr-2">
                  <Users className="h-4 w-4 mr-1" />
                  My Batches
                </Button>
              </Link>
              <Link to="/mentor/announcements">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-1" />
                  Announcements
                </Button>
              </Link>
            </div>
            <div className="text-sm text-purple-100">
              Experience: {mentor.experience} years
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Pending Reviews"
          value={reviewQueue.length}
          icon={Clock}
          subtitle="Awaiting your review"
        />
        <StatsCard
          title="Urgent Reviews"
          value={urgentReviews}
          icon={AlertTriangle}
          subtitle="Over 3 days old"
        />
        <StatsCard
          title="This Month"
          value={mentor.verification_stats.total_reviews}
          icon={Award}
          subtitle="Reviews completed"
        />
        <StatsCard
          title="Performance"
          value={`${mentor.verification_stats.accuracy_rate}%`}
          icon={TrendingUp}
          subtitle="Accuracy rate"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Review Queue Preview */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Submissions</CardTitle>
              <Link to="/mentor/queue">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reviewQueue.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-slate-900">{activity.title}</h4>
                        <Badge variant="info" size="sm">
                          {activity.type.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{activity.organization}</p>
                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span>Student: {activity.student_id}</span>
                        <span>AI Score: {activity.verification.ai_confidence_score}%</span>
                        <span>Submitted: {new Date(activity.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <Link to={`/mentor/review/${activity.id}`}>
                      <Button size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  </div>
                ))}
                {reviewQueue.length === 0 && (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No pending reviews</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Analytics */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/mentor/queue">
                <Button className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Review Queue ({reviewQueue.length})
                </Button>
              </Link>
              <Link to="/mentor/batches">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Manage Batches
                </Button>
              </Link>
              <Link to="/mentor/announcements">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Create Announcement
                </Button>
              </Link>
              <Link to="/mentor/reports">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generate Reports
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Performance Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Accuracy Rate</span>
                    <span>{mentor.verification_stats.accuracy_rate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${mentor.verification_stats.accuracy_rate}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Reviews</span>
                    <Badge variant="info">{mentor.verification_stats.total_reviews}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Avg. Turnaround</span>
                    <Badge variant={mentor.verification_stats.avg_turnaround_time < 24 ? 'success' : 'warning'}>
                      {mentor.verification_stats.avg_turnaround_time}h
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Experience</span>
                    <Badge variant="secondary">{mentor.experience} years</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                      <p className="text-slate-500 text-xs">
                        {activity.verification.status} • {new Date(activity.verification.verification_date || activity.date).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge 
                      variant={activity.verification.status === 'verified' ? 'success' : 
                              activity.verification.status === 'rejected' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {activity.verification.status}
                    </Badge>
                  </div>
                ))}
                {recentReviews.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No recent reviews
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}