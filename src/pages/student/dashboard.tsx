import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { StatsCard } from '../../components/dashboard/stats-card';
import { ActivityCard } from '../../components/activities/activity-card';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { apiClient } from '../../lib/api';
import { Student, Activity, User } from '../../types';
import { 
  Award,
  FileText,
  Clock,
  XCircle,
  Plus,
  TrendingUp,
  Calendar,
  Target,
  Building
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentData, activitiesData] = await Promise.all([
          apiClient.getStudent(user.id),
          apiClient.getActivities({ student_id: user.id })
        ]);
        
        setStudent(studentData);
        setActivities(activitiesData);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const recentActivities = activities.slice(0, 4);
  const pendingActivities = activities.filter(a => a.verification.status === 'pending').length;

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {student.name}!</h1>
            <p className="text-indigo-100 mb-4">
              {student.course} • Year {student.year} • {student.semester}th Semester
            </p>
            <div className="flex items-center space-x-6">
              <div>
                <div className="text-2xl font-bold">{student.profile.verification_score}%</div>
                <div className="text-sm text-indigo-100">Verification Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold">{student.profile.profile_completion}%</div>
                <div className="text-sm text-indigo-100">Profile Complete</div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Link to="/activities/new">
              <Button variant="secondary" className="mb-4">
                <Plus className="h-4 w-4 mr-2" />
                Add Activity
              </Button>
            </Link>
            <div className="mb-4">
              <Link to="/profile">
                <Button variant="outline" size="sm" className="mr-2">
                  View Profile
                </Button>
              </Link>
              <Link to="/student/career">
                <Button variant="outline" size="sm">
                  Career Insights
                </Button>
              </Link>
            </div>
            <div className="text-sm text-indigo-100">
              CGPA: {student.academic_details.current_cgpa}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Documents"
          value={student.verification_status.total_documents}
          icon={FileText}
          subtitle="Activities submitted"
        />
        <StatsCard
          title="Verified"
          value={student.verification_status.verified}
          icon={Award}
          subtitle="Successfully verified"
        />
        <StatsCard
          title="Pending"
          value={student.verification_status.pending}
          icon={Clock}
          subtitle="Under review"
        />
        <StatsCard
          title="Rejected"
          value={student.verification_status.rejected}
          icon={XCircle}
          subtitle="Need attention"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Activities</CardTitle>
              <Link to="/activities">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity}
                      onClick={() => window.location.href = `/student/activities/${activity.id}`}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500 mb-4">No activities yet</p>
                    <Link to="/student/activities/new">
                      <Button>Add Your First Activity</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Progress */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/student/activities/new">
                <Button className="w-full justify-start">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Activity
                </Button>
              </Link>
              <Link to="/profile">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
              </Link>
              <Link to="/student/career">
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Career Insights
                </Button>
              </Link>
              <Link to="/student/internships">
                <Button variant="outline" className="w-full justify-start">
                  <Building className="h-4 w-4 mr-2" />
                  Browse Internships
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Progress Card */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Profile Completion</span>
                    <span>{student.profile.profile_completion}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all"
                      style={{ width: `${student.profile.profile_completion}%` }}
                    ></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Verification Score</span>
                    <span>{student.profile.verification_score}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${student.profile.verification_score}%` }}
                    ></div>
                  </div>
                </div>

                <div className="pt-2 border-t space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current CGPA</span>
                    <Badge variant="info">{student.academic_details.current_cgpa}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Attendance</span>
                    <Badge variant={student.academic_details.attendance > 85 ? 'success' : 'warning'}>
                      {student.academic_details.attendance}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Actions */}
          {pendingActivities > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600">Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-3">
                    You have {pendingActivities} activities under review
                  </p>
                  <Link to="/student/activities?status=pending">
                    <Button variant="outline" size="sm">
                      View Pending
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}