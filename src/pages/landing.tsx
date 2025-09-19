import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { apiClient } from '../lib/api';
import { SystemAnalytics } from '../types';
import { Shield, CheckCircle, Users, FileText, Clock } from 'lucide-react';

export function LandingPage() {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);

  useEffect(() => {
    apiClient.getSystemAnalytics().then(setAnalytics);
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'AI-Powered Verification',
      description: 'Advanced biometric and document verification with 99% accuracy rate'
    },
    {
      icon: CheckCircle,
      title: 'Instant Validation',
      description: 'Real-time GPS verification and automated document processing'
    },
    {
      icon: Users,
      title: 'Mentor Network',
      description: 'Expert mentors from industry and academia for quality assurance'
    },
    {
      icon: FileText,
      title: 'Digital Portfolio',
      description: 'Comprehensive verified portfolio for career opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Shield className="h-16 w-16 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Student Activity
              <span className="text-indigo-600"> Verification</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600 max-w-3xl mx-auto">
              Revolutionary platform for verifying student achievements with AI-powered document validation, 
              GPS tracking, and biometric verification. Build trust in academic credentials.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/demo">
                <Button variant="outline" size="lg">View Demo</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      {analytics && (
        <div className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {analytics.platform_stats.total_users.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 mt-2">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {analytics.platform_stats.total_institutions}
                </div>
                <div className="text-sm text-slate-600 mt-2">Institutions</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {analytics.platform_stats.total_documents.toLocaleString()}
                </div>
                <div className="text-sm text-slate-600 mt-2">Verified Documents</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">
                  {analytics.platform_stats.verification_accuracy}%
                </div>
                <div className="text-sm text-slate-600 mt-2">Accuracy Rate</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <div className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Simple 3-step process to verify and validate student activities
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Register & Upload</h3>
              <p className="text-slate-600">Students register with institutional email and upload activity certificates with GPS and biometric data.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">AI Analysis</h3>
              <p className="text-slate-600">AI systems analyze documents, verify GPS locations, match biometric data, and extract relevant information.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-indigo-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Expert Review</h3>
              <p className="text-slate-600">Qualified mentors review AI findings and provide final verification with detailed feedback.</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardContent className="p-6">
                  <feature.icon className="h-8 w-8 text-indigo-600 mb-4" />
                  <h3 className="font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-600 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to verify your achievements?
          </h2>
          <p className="mt-4 text-xl text-indigo-100">
            Join thousands of students building verified digital portfolios
          </p>
          <div className="mt-8">
            <Link to="/signup">
              <Button variant="secondary" size="lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}