#!/usr/bin/env node

/**
 * Seed Admin Users Script
 * 
 * This script adds admin users and audit logs to the demo-data.json file
 * for testing the admin dashboard functionality.
 * 
 * Usage: node scripts/seed-admins.js
 */

const fs = require('fs');
const path = require('path');

const demoDataPath = path.join(__dirname, '../data/demo-data.json');

// Admin users to add
const adminUsers = [
  {
    id: 'admin-001',
    name: 'GTU Admin',
    email: 'admin@gtu.edu.in',
    role: 'admin',
    institution_id: null,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2025-01-15T10:30:00Z',
    permissions: [
      'view_all_institutions',
      'approve_institutions',
      'manage_users',
      'view_fraud_alerts',
      'generate_reports',
      'system_settings',
      'audit_logs'
    ]
  },
  {
    id: 'admin-002',
    name: 'NAAC Auditor',
    email: 'auditor@gtu.edu.in',
    role: 'auditor',
    institution_id: null,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2025-01-14T15:45:00Z',
    permissions: [
      'view_all_institutions',
      'generate_reports',
      'audit_logs'
    ]
  },
  {
    id: 'admin-003',
    name: 'Judge Demo',
    email: 'judge@gtu.edu.in',
    role: 'admin',
    institution_id: null,
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    last_login: '2025-01-15T09:00:00Z',
    permissions: [
      'view_all_institutions',
      'view_fraud_alerts',
      'generate_reports'
    ]
  }
];

// Sample audit logs
const auditLogs = [
  {
    id: 'log-001',
    timestamp: '2025-01-15T10:30:00Z',
    user_id: 'admin-001',
    user_name: 'GTU Admin',
    action: 'institution_approved',
    resource_type: 'institution',
    resource_id: 'inst-gtu-001',
    details: 'Approved Shri Karmaveer Institute of Technology',
    ip_address: '192.168.1.100'
  },
  {
    id: 'log-002',
    timestamp: '2025-01-15T09:15:00Z',
    user_id: 'mentor-01',
    user_name: 'Dr. Sunita Rao',
    action: 'activity_verified',
    resource_type: 'activity',
    resource_id: 'act-0001',
    details: 'Verified Backend Development Intern activity',
    ip_address: '192.168.1.101'
  },
  {
    id: 'log-003',
    timestamp: '2025-01-14T16:45:00Z',
    user_id: 'admin-001',
    user_name: 'GTU Admin',
    action: 'fraud_alert_resolved',
    resource_type: 'fraud_alert',
    resource_id: 'fraud-act-0002',
    details: 'Resolved GPS mismatch alert as false positive',
    ip_address: '192.168.1.100'
  },
  {
    id: 'log-004',
    timestamp: '2025-01-14T14:20:00Z',
    user_id: 'admin-002',
    user_name: 'NAAC Auditor',
    action: 'naac_report_generated',
    resource_type: 'report',
    resource_id: 'naac-inst-gtu-001-2024',
    details: 'Generated NAAC report for SKIT for academic year 2024-25',
    ip_address: '192.168.1.102'
  },
  {
    id: 'log-005',
    timestamp: '2025-01-14T11:30:00Z',
    user_id: 'admin-001',
    user_name: 'GTU Admin',
    action: 'user_role_changed',
    resource_type: 'user',
    resource_id: 'mentor-02',
    details: 'Changed user role from mentor to senior_mentor',
    ip_address: '192.168.1.100'
  },
  {
    id: 'log-006',
    timestamp: '2025-01-13T16:00:00Z',
    user_id: 'admin-001',
    user_name: 'GTU Admin',
    action: 'institution_rejected',
    resource_type: 'institution',
    resource_id: 'inst-gtu-003',
    details: 'Rejected Govt. Polytechnic - Vadodara due to incomplete documentation',
    ip_address: '192.168.1.100'
  },
  {
    id: 'log-007',
    timestamp: '2025-01-13T10:15:00Z',
    user_id: 'mentor-01',
    user_name: 'Dr. Sunita Rao',
    action: 'activity_rejected',
    resource_type: 'activity',
    resource_id: 'act-0004',
    details: 'Rejected AutoCAD certification due to low biometric match',
    ip_address: '192.168.1.101'
  },
  {
    id: 'log-008',
    timestamp: '2025-01-12T15:45:00Z',
    user_id: 'admin-001',
    user_name: 'GTU Admin',
    action: 'system_settings_updated',
    resource_type: 'settings',
    resource_id: 'system-config',
    details: 'Updated AI simulation mode and judge mode settings',
    ip_address: '192.168.1.100'
  }
];

function seedAdminData() {
  try {
    // Read existing demo data
    const demoData = JSON.parse(fs.readFileSync(demoDataPath, 'utf8'));
    
    // Add admin users to the data
    if (!demoData.admin_users) {
      demoData.admin_users = [];
    }
    
    // Merge admin users (avoid duplicates)
    adminUsers.forEach(adminUser => {
      const existingIndex = demoData.admin_users.findIndex(u => u.id === adminUser.id);
      if (existingIndex >= 0) {
        demoData.admin_users[existingIndex] = adminUser;
      } else {
        demoData.admin_users.push(adminUser);
      }
    });
    
    // Add audit logs
    if (!demoData.audit_logs) {
      demoData.audit_logs = [];
    }
    
    // Merge audit logs (avoid duplicates)
    auditLogs.forEach(log => {
      const existingIndex = demoData.audit_logs.findIndex(l => l.id === log.id);
      if (existingIndex >= 0) {
        demoData.audit_logs[existingIndex] = log;
      } else {
        demoData.audit_logs.push(log);
      }
    });
    
    // Sort audit logs by timestamp (newest first)
    demoData.audit_logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    
    // Write updated data back to file
    fs.writeFileSync(demoDataPath, JSON.stringify(demoData, null, 2));
    
    console.log('✅ Successfully seeded admin users and audit logs!');
    console.log('\nAdmin Credentials:');
    console.log('- admin@gtu.edu.in / demo123 (Super Admin)');
    console.log('- auditor@gtu.edu.in / demo123 (NAAC Auditor)');
    console.log('- judge@gtu.edu.in / demo123 (Judge Demo - Read Only)');
    console.log('\nAudit logs added:', auditLogs.length);
    
  } catch (error) {
    console.error('❌ Error seeding admin data:', error.message);
    process.exit(1);
  }
}

// Run the seeding
if (require.main === module) {
  seedAdminData();
}

module.exports = { seedAdminData, adminUsers, auditLogs };