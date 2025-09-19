import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  RefreshCw,
  ExternalLink,
  Star,
  AlertCircle
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { CareerRecommendation, User } from '../../types';
import { formatDate } from '../../lib/utils';

interface CareerRecommendationsProps {
  user: User;
}

export function CareerRecommendations({ user }: CareerRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<CareerRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, [user.id]);

  const loadRecommendations = async () => {
    try {
      const data = await apiClient.getCareerRecommendations({ student_id: user.id });
      setRecommendations(data);
    } catch (error) {
      console.error('Failed to load career recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const newRecommendation = await apiClient.generateCareerRecommendations(user.id);
      setRecommendations([newRecommendation]);
    } catch (error) {
      console.error('Failed to regenerate recommendations:', error);
    } finally {
      setRegenerating(false);
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 85) return 'success';
    if (score >= 70) return 'warning';
    return 'error';
  };

  const getReadinessColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const currentRecommendation = recommendations[0];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Career Recommendations</h1>
          <p className="text-slate-600 mt-1">
            AI-powered career insights based on your verified activities and skills
          </p>
        </div>
        <Button 
          onClick={handleRegenerate}
          loading={regenerating}
          disabled={regenerating}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Regenerate
        </Button>
      </div>

      {currentRecommendation ? (
        <div className="space-y-8">
          {/* Last Updated */}
          <div className="text-sm text-slate-500">
            Last updated: {formatDate(currentRecommendation.generated_date)}
          </div>

          {/* Interview Readiness */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Interview Readiness Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-slate-900">
                  {currentRecommendation.interview_readiness_score}%
                </span>
                <Badge variant={getReadinessColor(currentRecommendation.interview_readiness_score) as any}>
                  {currentRecommendation.interview_readiness_score >= 80 ? 'Ready' : 
                   currentRecommendation.interview_readiness_score >= 60 ? 'Improving' : 'Needs Work'}
                </Badge>
              </div>
              <Progress 
                value={currentRecommendation.interview_readiness_score} 
                variant={getReadinessColor(currentRecommendation.interview_readiness_score) as any}
                className="mb-4"
              />
              <p className="text-sm text-slate-600">
                Based on your verified activities, skills, and portfolio completeness
              </p>
            </CardContent>
          </Card>

          {/* Top Career Matches */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Top Career Matches</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentRecommendation.top_careers.map((career, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                        <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-medium text-slate-900">{career.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress 
                            value={career.match_score} 
                            variant={getMatchScoreColor(career.match_score) as any}
                            size="sm"
                            className="w-24"
                          />
                          <span className="text-sm text-slate-600">{career.match_score}% match</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getMatchScoreColor(career.match_score) as any}>
                        {career.match_score >= 85 ? 'Excellent' : 
                         career.match_score >= 70 ? 'Good' : 'Fair'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Skill Gaps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5" />
                  <span>Skill Gaps to Address</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRecommendation.skill_gaps.length > 0 ? (
                  <div className="space-y-3">
                    {currentRecommendation.skill_gaps.map((skill, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <span className="font-medium text-yellow-800">{skill}</span>
                        <Button variant="ghost" size="sm" className="text-yellow-700 hover:text-yellow-800">
                          <BookOpen className="h-4 w-4 mr-1" />
                          Learn
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-green-700 font-medium">No major skill gaps identified!</p>
                    <p className="text-sm text-green-600 mt-1">
                      Your current skills align well with your target careers.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Learning Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5" />
                  <span>Recommended Learning</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentRecommendation.learning_recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-800">{recommendation}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-blue-700 hover:text-blue-800 ml-2">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Items */}
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Complete Your Profile</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Add more verified activities to improve your match scores.
                  </p>
                  <Button size="sm" className="w-full">
                    Add Activity
                  </Button>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Skill Development</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Focus on addressing identified skill gaps.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Browse Courses
                  </Button>
                </div>

                <div className="p-4 border border-slate-200 rounded-lg">
                  <h4 className="font-medium text-slate-900 mb-2">Apply for Opportunities</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Start applying to internships that match your profile.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    View Internships
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-16">
          <TrendingUp className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Recommendations Yet</h2>
          <p className="text-slate-600 mb-6">
            Add some verified activities to get personalized career recommendations.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <Button onClick={() => window.location.href = '/student/activities/new'}>
              Add Activity
            </Button>
            <Button variant="outline" onClick={handleRegenerate}>
              Generate Recommendations
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}