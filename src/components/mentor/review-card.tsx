import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Button } from '../ui/button';
import { Activity, Student } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';
import { Calendar, MapPin, Building, User, Eye } from 'lucide-react';

interface ReviewCardProps {
  activity: Activity;
  student?: Student;
  onReview: (activityId: string) => void;
}

export function ReviewCard({ activity, student, onReview }: ReviewCardProps) {
  const statusVariant = getStatusColor(activity.verification.status) as any;
  
  const getUrgencyLevel = () => {
    const daysSinceSubmission = Math.floor(
      (Date.now() - new Date(activity.date).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceSubmission > 7) return 'high';
    if (daysSinceSubmission > 3) return 'medium';
    return 'low';
  };

  const getUrgencyBadge = () => {
    const urgency = getUrgencyLevel();
    switch (urgency) {
      case 'high':
        return <Badge variant="error" size="sm">Urgent</Badge>;
      case 'medium':
        return <Badge variant="warning" size="sm">Medium</Badge>;
      default:
        return <Badge variant="success" size="sm">Normal</Badge>;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 line-clamp-2">{activity.title}</h3>
            <div className="flex items-center text-sm text-slate-500 space-x-4">
              <div className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{student?.name || 'Unknown Student'}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building className="h-3 w-3" />
                <span>{activity.organization}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={statusVariant} size="sm">
              {activity.verification.status.replace('_', ' ')}
            </Badge>
            {getUrgencyBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-slate-600 line-clamp-2">{activity.description}</p>
          
          <div className="flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(activity.date)}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>{activity.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-4 text-xs text-slate-500">
              <span>AI Score: {activity.verification.ai_confidence_score}%</span>
              <span>Documents: {activity.documents.length}</span>
            </div>
            <Button size="sm" onClick={() => onReview(activity.id)}>
              <Eye className="h-4 w-4 mr-2" />
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}