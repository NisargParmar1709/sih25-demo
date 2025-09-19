import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Modal } from '../../components/ui/modal';
import { ActivityCard } from '../../components/activities/activity-card';
import { 
  User, 
  Edit, 
  Download, 
  Calendar,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  Award,
  Plus,
  X
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Student, Activity, User as UserType } from '../../types';
import { formatDate } from '../../lib/utils';

interface StudentProfileProps {
  user: UserType;
}

export function StudentProfile({ user }: StudentProfileProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: '',
    skills: [] as string[]
  });
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [studentData, activitiesData] = await Promise.all([
          apiClient.getStudent(user.id),
          apiClient.getActivities({ student_id: user.id })
        ]);
        
        setStudent(studentData);
        setActivities(activitiesData);
        
        if (studentData) {
          setEditForm({
            bio: studentData.profile.bio,
            skills: [...studentData.profile.skills]
          });
        }
      } catch (error) {
        console.error('Failed to load profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user.id]);

  const handleEditSubmit = async () => {
    if (!student) return;

    try {
      const updatedStudent = await apiClient.updateStudent(student.id, {
        profile: {
          ...student.profile,
          bio: editForm.bio,
          skills: editForm.skills
        }
      });
      
      setStudent(updatedStudent);
      setEditModalOpen(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !editForm.skills.includes(newSkill.trim())) {
      setEditForm(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setEditForm(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const exportPortfolio = () => {
    // In a real app, this would generate a PDF using react-pdf
    const portfolioData = {
      student,
      activities: activities.filter(a => a.verification.status === 'verified'),
      exportDate: new Date().toISOString()
    };
    
    // Simulate PDF download
    const blob = new Blob([JSON.stringify(portfolioData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student?.name.replace(/\s+/g, '_')}_Portfolio.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const groupActivitiesByYear = (activities: Activity[]) => {
    const grouped = activities.reduce((acc, activity) => {
      const year = new Date(activity.date).getFullYear();
      if (!acc[year]) acc[year] = [];
      acc[year].push(activity);
      return acc;
    }, {} as Record<number, Activity[]>);

    return Object.entries(grouped)
      .sort(([a], [b]) => parseInt(b) - parseInt(a))
      .map(([year, activities]) => ({
        year: parseInt(year),
        activities: activities.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        )
      }));
  };

  if (loading || !student) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const activityGroups = groupActivitiesByYear(activities);

  return (
    <div className="space-y-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                <User className="h-12 w-12 text-indigo-600" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
                  <p className="text-slate-600">{student.course}</p>
                  <p className="text-sm text-slate-500">
                    Year {student.year} • Semester {student.semester} • {student.enrollment_number}
                  </p>
                </div>

                <div className="flex items-center space-x-6 text-sm text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span>{student.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Graduating {formatDate(student.expected_graduation)}</span>
                  </div>
                </div>

                <p className="text-slate-700 max-w-2xl">{student.profile.bio}</p>

                <div className="flex flex-wrap gap-2">
                  {student.profile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={() => setEditModalOpen(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button onClick={exportPortfolio}>
                <Download className="h-4 w-4 mr-2" />
                Export Portfolio
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Verification Score</p>
                <p className="text-2xl font-bold text-slate-900">
                  {student.profile.verification_score}%
                </p>
              </div>
              <Award className="h-8 w-8 text-indigo-600" />
            </div>
            <Progress 
              value={student.profile.verification_score} 
              variant="success" 
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">CGPA</p>
                <p className="text-2xl font-bold text-slate-900">
                  {student.academic_details.current_cgpa}
                </p>
              </div>
              <GraduationCap className="h-8 w-8 text-indigo-600" />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {student.academic_details.total_credits} credits completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Attendance</p>
                <p className="text-2xl font-bold text-slate-900">
                  {student.academic_details.attendance}%
                </p>
              </div>
              <Calendar className="h-8 w-8 text-indigo-600" />
            </div>
            <Progress 
              value={student.academic_details.attendance} 
              variant={student.academic_details.attendance > 85 ? 'success' : 'warning'}
              className="mt-3" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Profile Complete</p>
                <p className="text-2xl font-bold text-slate-900">
                  {student.profile.profile_completion}%
                </p>
              </div>
              <User className="h-8 w-8 text-indigo-600" />
            </div>
            <Progress 
              value={student.profile.profile_completion} 
              variant="default" 
              className="mt-3" 
            />
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {activityGroups.length > 0 ? (
            <div className="space-y-8">
              {activityGroups.map(({ year, activities }) => (
                <div key={year}>
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">{year}</h3>
                  <div className="grid gap-4">
                    {activities.map((activity) => (
                      <ActivityCard 
                        key={activity.id} 
                        activity={activity}
                        onClick={() => window.location.href = `/student/activities/${activity.id}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Award className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">No activities yet</p>
              <Button onClick={() => window.location.href = '/student/activities/new'}>
                Add Your First Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Modal */}
      <Modal 
        isOpen={editModalOpen} 
        onClose={() => setEditModalOpen(false)}
        title="Edit Profile"
        size="lg"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Bio
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={4}
              value={editForm.bio}
              onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
              placeholder="Tell us about yourself, your interests, and goals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Skills
            </label>
            <div className="flex space-x-2 mb-3">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                onKeyPress={(e) => e.key === 'Enter' && addSkill()}
              />
              <Button onClick={addSkill}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editForm.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="flex items-center space-x-1">
                  <span>{skill}</span>
                  <button onClick={() => removeSkill(skill)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit}>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}