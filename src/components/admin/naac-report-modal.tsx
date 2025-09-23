import { useState } from 'react';
import { Modal } from '../ui/modal';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { 
  Download, 
  FileText, 
  Calendar, 
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';

interface NAACReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  institutions: any[];
  onGenerateReport: (institutionId: string, year: number) => Promise<any>;
}

export function NAACReportModal({ 
  isOpen, 
  onClose, 
  institutions, 
  onGenerateReport 
}: NAACReportModalProps) {
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [generating, setGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<any>(null);

  const handleGenerate = async () => {
    if (!selectedInstitution) return;

    setGenerating(true);
    try {
      const report = await onGenerateReport(selectedInstitution, selectedYear);
      setGeneratedReport(report);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    setGeneratedReport(null);
    setSelectedInstitution('');
    setSelectedYear(new Date().getFullYear());
    onClose();
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate NAAC Report"
      size="lg"
    >
      <div className="space-y-6">
        {!generatedReport ? (
          <>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800">NAAC Report Generation</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    Generate comprehensive reports for NAAC accreditation including verified activities, 
                    community engagement, and student achievements.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Institution
                </label>
                <select
                  value={selectedInstitution}
                  onChange={(e) => setSelectedInstitution(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Institution</option>
                  {institutions.map((institution) => (
                    <option key={institution.id} value={institution.id}>
                      {institution.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Academic Year
                </label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}-{year + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedInstitution && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                <h4 className="font-medium text-slate-900 mb-2">Report Contents</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  <li>• Verified student activities and achievements</li>
                  <li>• Community engagement and social work initiatives</li>
                  <li>• Internship and placement statistics</li>
                  <li>• Skill development and certification programs</li>
                  <li>• Research projects and publications</li>
                  <li>• Institution performance metrics</li>
                </ul>
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleGenerate}
                loading={generating}
                disabled={!selectedInstitution || generating}
              >
                <FileText className="h-4 w-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Report Generated Successfully
              </h3>
              <p className="text-slate-600">
                Your NAAC report has been generated and is ready for download.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium text-slate-900">
                    NAAC Report - {institutions.find(i => i.id === selectedInstitution)?.name}
                  </h4>
                  <p className="text-sm text-slate-600">
                    Academic Year {selectedYear}-{selectedYear + 1}
                  </p>
                </div>
                <Badge variant="success">Generated</Badge>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Report ID:</span>
                  <span className="font-medium">{generatedReport.report_id}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Generated:</span>
                  <span className="font-medium">
                    {new Date(generatedReport.generated_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Total Activities:</span>
                  <span className="font-medium">{generatedReport.summary.total_activities}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Verified:</span>
                  <span className="font-medium">{generatedReport.summary.verified_activities}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={handleClose}>
                Close
              </Button>
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => window.open(generatedReport.csv_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download CSV
                </Button>
                <Button 
                  onClick={() => window.open(generatedReport.download_url, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}