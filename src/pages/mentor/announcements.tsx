import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { 
  Plus,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  MessageSquare
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types';
import { formatDate } from '../../lib/utils';

interface Announcement {
  id: string;
  mentor_id: string;
  title: string;
  content: string;
  target_audience: 'all' | 'batch' | 'department';
  target_ids?: string[];
  created_at: string;
  status: 'draft' | 'published';
  read_count: number;
}

interface AnnouncementsProps {
  user: User;
}

export function Announcements({ user }: AnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    target_audience: 'all' as 'all' | 'batch' | 'department',
    target_ids: [] as string[]
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, [user.id]);

  const loadAnnouncements = async () => {
    try {
      const data = await apiClient.getMentorAnnouncements(user.id);
      setAnnouncements(data);
    } catch (error) {
      console.error('Failed to load announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = () => {
    setFormData({
      title: '',
      content: '',
      target_audience: 'all',
      target_ids: []
    });
    setEditingAnnouncement(null);
    setCreateModalOpen(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      target_audience: announcement.target_audience,
      target_ids: announcement.target_ids || []
    });
    setEditingAnnouncement(announcement);
    setCreateModalOpen(true);
  };

  const handleSubmit = async (status: 'draft' | 'published') => {
    setSubmitting(true);
    try {
      const announcementData = {
        ...formData,
        mentor_id: user.id,
        status,
        created_at: new Date().toISOString(),
        read_count: 0
      };

      if (editingAnnouncement) {
        await apiClient.updateAnnouncement(editingAnnouncement.id, announcementData);
      } else {
        await apiClient.createAnnouncement(announcementData);
      }

      setCreateModalOpen(false);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await apiClient.deleteAnnouncement(id);
      loadAnnouncements();
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const getAudienceLabel = (announcement: Announcement) => {
    switch (announcement.target_audience) {
      case 'all':
        return 'All Students';
      case 'batch':
        return 'Selected Batches';
      case 'department':
        return 'Department';
      default:
        return 'Unknown';
    }
  };

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
          <h1 className="text-2xl font-bold text-slate-900">Announcements</h1>
          <p className="text-slate-600 mt-1">
            Create and manage announcements for your students
          </p>
        </div>
        <Button onClick={handleCreateAnnouncement}>
          <Plus className="h-4 w-4 mr-2" />
          New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Announcements</p>
                <p className="text-2xl font-bold text-slate-900">{announcements.length}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Published</p>
                <p className="text-2xl font-bold text-slate-900">
                  {announcements.filter(a => a.status === 'published').length}
                </p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Reads</p>
                <p className="text-2xl font-bold text-slate-900">
                  {announcements.reduce((acc, a) => acc + a.read_count, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Announcements List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcements.length > 0 ? (
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="border border-slate-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-slate-900">{announcement.title}</h3>
                        <Badge variant={announcement.status === 'published' ? 'success' : 'warning'}>
                          {announcement.status}
                        </Badge>
                      </div>
                      <p className="text-slate-600 mb-3 line-clamp-2">{announcement.content}</p>
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{getAudienceLabel(announcement)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(announcement.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{announcement.read_count} reads</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAnnouncement(announcement)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAnnouncement(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-slate-900 mb-2">No Announcements Yet</h2>
              <p className="text-slate-600 mb-6">
                Create your first announcement to communicate with students.
              </p>
              <Button onClick={handleCreateAnnouncement}>
                <Plus className="h-4 w-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title={editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
        size="lg"
      >
        <div className="space-y-6">
          <Input
            label="Title"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter announcement title..."
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Content
            </label>
            <textarea
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Write your announcement content..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">
              Target Audience
            </label>
            <div className="space-y-3">
              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.target_audience === 'all'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, target_audience: 'all' }))}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">All Students</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Send to all students in your institution
                </p>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.target_audience === 'batch'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, target_audience: 'batch' }))}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Selected Batches</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Send to specific batches or classes
                </p>
              </div>

              <div 
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.target_audience === 'department'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
                onClick={() => setFormData(prev => ({ ...prev, target_audience: 'department' }))}
              >
                <div className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                  <span className="font-medium">Department</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Send to all students in your department
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleSubmit('draft')}
              loading={submitting}
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              Save as Draft
            </Button>
            <Button 
              onClick={() => handleSubmit('published')}
              loading={submitting}
              disabled={!formData.title.trim() || !formData.content.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}