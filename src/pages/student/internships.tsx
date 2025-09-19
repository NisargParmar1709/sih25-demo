import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Modal } from '../../components/ui/modal';
import { 
  Building, 
  MapPin, 
  Calendar, 
  DollarSign,
  Users,
  Search,
  Filter,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';
import { apiClient } from '../../lib/api';
import { User } from '../../types';

interface Company {
  id: string;
  name: string;
  type: string;
  location: string;
  industry: string;
  employee_count: number;
  internship_programs: {
    title: string;
    duration_months: number;
    stipend: number;
  }[];
}

interface InternshipsProps {
  user: User;
}

export function Internships({ user }: InternshipsProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedProgram, setSelectedProgram] = useState<string>('');
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    justification: '',
    resume_type: 'portfolio' as 'portfolio' | 'upload'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await apiClient.getCompanies();
      setCompanies(data);
    } catch (error) {
      console.error('Failed to load companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (company: Company, programTitle: string) => {
    setSelectedCompany(company);
    setSelectedProgram(programTitle);
    setApplyModalOpen(true);
  };

  const submitApplication = async () => {
    if (!selectedCompany || !selectedProgram) return;

    setSubmitting(true);
    try {
      await apiClient.applyToInternship(selectedCompany.id, selectedProgram, {
        student_id: user.id,
        justification: applicationForm.justification,
        resume_url: applicationForm.resume_type === 'portfolio' ? 'portfolio-export.pdf' : 'uploaded-resume.pdf'
      });

      setApplyModalOpen(false);
      setApplicationForm({ justification: '', resume_type: 'portfolio' });
      
      // Show success message (in a real app, you'd use a toast)
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Failed to submit application:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEligibilityStatus = (program: Company['internship_programs'][0]) => {
    // Simple eligibility logic based on program requirements
    const isEligible = Math.random() > 0.3; // 70% eligible for demo
    return isEligible;
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
          <h1 className="text-2xl font-bold text-slate-900">Internship Marketplace</h1>
          <p className="text-slate-600 mt-1">
            Discover and apply to internships that match your verified skills
          </p>
        </div>
        <Button variant="outline" onClick={() => window.location.href = '/student/applications'}>
          <Clock className="h-4 w-4 mr-2" />
          My Applications
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search companies, industries, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Companies Grid */}
      <div className="grid gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Building className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{company.name}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-slate-600 mt-2">
                      <div className="flex items-center space-x-1">
                        <Building className="h-4 w-4" />
                        <span>{company.industry}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{company.employee_count} employees</span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="mt-2">
                      {company.type}
                    </Badge>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-medium text-slate-900">Available Internships</h4>
                <div className="grid gap-3">
                  {company.internship_programs.map((program, index) => {
                    const isEligible = getEligibilityStatus(program);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-medium text-slate-900">{program.title}</h5>
                            {isEligible ? (
                              <Badge variant="success" size="sm">Eligible</Badge>
                            ) : (
                              <Badge variant="warning" size="sm">Review Required</Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-600">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{program.duration_months} months</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>₹{program.stipend.toLocaleString()}/month</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          onClick={() => handleApply(company, program.title)}
                          disabled={!isEligible}
                          className={isEligible ? '' : 'opacity-50'}
                        >
                          {isEligible ? 'Apply Now' : 'Not Eligible'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="text-center py-16">
          <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">No Companies Found</h2>
          <p className="text-slate-600">
            Try adjusting your search terms or filters.
          </p>
        </div>
      )}

      {/* Application Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply to ${selectedCompany?.name}`}
        size="lg"
      >
        {selectedCompany && (
          <div className="space-y-6">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-1">{selectedProgram}</h4>
              <p className="text-sm text-blue-700">
                at {selectedCompany.name} • {selectedCompany.location}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Why are you interested in this internship?
              </label>
              <textarea
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={4}
                value={applicationForm.justification}
                onChange={(e) => setApplicationForm(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="Describe your interest, relevant experience, and what you hope to learn..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Resume/Portfolio
              </label>
              <div className="space-y-3">
                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    applicationForm.resume_type === 'portfolio'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setApplicationForm(prev => ({ ...prev, resume_type: 'portfolio' }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Use Verified Portfolio</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Automatically generated from your verified activities
                      </p>
                    </div>
                    {applicationForm.resume_type === 'portfolio' && (
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </div>

                <div 
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    applicationForm.resume_type === 'upload'
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                  onClick={() => setApplicationForm(prev => ({ ...prev, resume_type: 'upload' }))}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">Upload Custom Resume</h4>
                      <p className="text-sm text-slate-600 mt-1">
                        Upload your own resume file
                      </p>
                    </div>
                    {applicationForm.resume_type === 'upload' && (
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitApplication}
                loading={submitting}
                disabled={!applicationForm.justification.trim()}
              >
                Submit Application
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}