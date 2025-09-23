import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  Users,
  Search,
  Download,
  Eye,
  TrendingUp,
  Award,
  Clock,
  FileText
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { Student, Activity, User } from '../../types';
import { Link } from 'react-router-dom';

interface Batch {
  id: string;
  name: string;
  course: string;
  year: number;
  semester: number;
  student_count: number;
  mentor_id: string;
}

interface BatchesProps {
  user: User;
}

export function Batches({ user }: BatchesProps) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async () => {
    try {
      const [batchesData, studentsData, activitiesData] = await Promise.all([
        apiClient.getMentorBatches(user.id),
        apiClient.getStudents({ institution_id: user.institution_id }),
        apiClient.getActivities({ mentor_id: user.id })
      ]);
      
      setBatches(batchesData);
      setStudents(studentsData);
      setActivities(activitiesData);
      
      if (batchesData.length > 0) {
        setSelectedBatch(batchesData[0]);
      }
    } catch (error) {
      console.error('Failed to load batch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getBatchStudents = (batchId: string) => {
    // In a real app, this would filter by actual batch assignment
    // For demo, we'll simulate batch assignment based on course and year
    const batch = batches.find(b => b.id === batchId);
    if (!batch) return [];
    
    return students.filter(student => 
      student.course.includes(batch.course) && 
      student.year === batch.year
    );
  };

  const getStudentActivities = (studentId: string) => {
    return activities.filter(activity => activity.student_id === studentId);
  };

  const getBatchStats = (batchId: string) => {
    const batchStudents = getBatchStudents(batchId);
    const batchActivities = batchStudents.flatMap(student => 
      getStudentActivities(student.id)
    );
    
    return {
      totalStudents: batchStudents.length,
      totalActivities: batchActivities.length,
      verifiedActivities: batchActivities.filter(a => a.verification.status === 'verified').length,
      pendingActivities: batchActivities.filter(a => a.verification.status === 'pending').length,
      avgVerificationScore: batchStudents.length > 0 
        ? Math.round(batchStudents.reduce((acc, s) => acc + s.profile.verification_score, 0) / batchStudents.length)
        : 0
    };
  };

  const filteredStudents = selectedBatch 
    ? getBatchStudents(selectedBatch.id).filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.enrollment_number.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
          <h1 className="text-2xl font-bold text-slate-900">Batch Management</h1>
          <p className="text-slate-600 mt-1">
            Manage your assigned batches and track student progress
          </p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Batch List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Your Batches</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {batches.map((batch) => {
                  const stats = getBatchStats(batch.id);
                  return (
                    <div
                      key={batch.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedBatch?.id === batch.id
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                      onClick={() => setSelectedBatch(batch)}
                    >
                      <h3 className="font-medium text-slate-900">{batch.name}</h3>
                      <p className="text-sm text-slate-600">{batch.course}</p>
                      <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                        <span>Year {batch.year}</span>
                        <span>{stats.totalStudents} students</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Batch Details */}
        <div className="lg:col-span-3 space-y-6">
          {selectedBatch ? (
            <>
              {/* Batch Stats */}
              <div className="grid md:grid-cols-4 gap-6">
                {(() => {
                  const stats = getBatchStats(selectedBatch.id);
                  return (
                    <>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Total Students</p>
                              <p className="text-2xl font-bold text-slate-900">{stats.totalStudents}</p>
                            </div>
                            <Users className="h-8 w-8 text-indigo-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Activities</p>
                              <p className="text-2xl font-bold text-slate-900">{stats.totalActivities}</p>
                            </div>
                            <FileText className="h-8 w-8 text-indigo-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Verified</p>
                              <p className="text-2xl font-bold text-slate-900">{stats.verifiedActivities}</p>
                            </div>
                            <Award className="h-8 w-8 text-green-600" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-slate-600">Avg. Score</p>
                              <p className="text-2xl font-bold text-slate-900">{stats.avgVerificationScore}%</p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-indigo-600" />
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  );
                })()}
              </div>

              {/* Students List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Students in {selectedBatch.name}</CardTitle>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search students..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length > 0 ? (
                    <div className="space-y-4">
                      {filteredStudents.map((student) => {
                        const studentActivities = getStudentActivities(student.id);
                        const verifiedCount = studentActivities.filter(a => a.verification.status === 'verified').length;
                        const pendingCount = studentActivities.filter(a => a.verification.status === 'pending').length;
                        
                        return (
                          <div key={student.id} className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-4">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                                  <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-medium text-slate-900">{student.name}</h3>
                                  <p className="text-sm text-slate-600">{student.enrollment_number}</p>
                                  <div className="flex items-center space-x-4 mt-2 text-sm text-slate-500">
                                    <span>CGPA: {student.academic_details.current_cgpa}</span>
                                    <span>Attendance: {student.academic_details.attendance}%</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge variant="success" size="sm">{verifiedCount} Verified</Badge>
                                  {pendingCount > 0 && (
                                    <Badge variant="warning" size="sm">{pendingCount} Pending</Badge>
                                  )}
                                </div>
                                <div className="text-sm text-slate-600 mb-2">
                                  Score: {student.profile.verification_score}%
                                </div>
                                <Progress 
                                  value={student.profile.verification_score} 
                                  variant="success" 
                                  size="sm" 
                                  className="w-24"
                                />
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <span>Total Activities: {studentActivities.length}</span>
                                <span>Profile: {student.profile.profile_completion}% complete</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Link to={`/student/profile/${student.id}`}>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Profile
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                      <h2 className="text-xl font-semibold text-slate-900 mb-2">No Students Found</h2>
                      <p className="text-slate-600">
                        {searchTerm ? 'Try adjusting your search terms.' : 'No students assigned to this batch.'}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-16">
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Batches Assigned</h2>
              <p className="text-slate-600">
                You don't have any batches assigned yet. Contact your administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}