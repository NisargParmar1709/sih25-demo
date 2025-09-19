import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Activity } from '../../types';
import { formatDate, getStatusColor } from '../../lib/utils';
import { Calendar, MapPin, Building } from 'lucide-react';

interface ActivityCardProps {
  activity: Activity;
  onClick?: () => void;
}

export function ActivityCard({ activity, onClick }: ActivityCardProps) {
  const statusVariant = getStatusColor(activity.verification.status) as any;
  
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 line-clamp-2">{activity.title}</h3>
            <div className="flex items-center text-sm text-slate-500 space-x-4">
              <div className="flex items-center space-x-1">
                <Building className="h-3 w-3" />
                <span>{activity.organization}</span>
              </div>
            </div>
          </div>
          <Badge variant={statusVariant} size="sm">
            {activity.verification.status.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
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
          {activity.verification.status === 'verified' && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">AI Confidence</span>
                <span className="font-medium text-green-600">
                  {activity.verification.ai_confidence_score}%
                </span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}