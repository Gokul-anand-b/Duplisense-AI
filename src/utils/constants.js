// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'DupliSense AI';
export const APP_TAGLINE = 'Duplicate Detection Platform';

export const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://duplisense-ai.onrender.com/api' : 'http://localhost:8000/api');

// Similarity Thresholds
export const SIMILARITY_THRESHOLDS = {
  HIGH: 80,
  MEDIUM: 60,
  PARTIAL: 40,
};

export const SIMILARITY_LEVELS = {
  high: { label: 'Highly Similar', color: '#ef4444', bgClass: 'badge-sim-high' },
  medium: { label: 'Similar', color: '#f59e0b', bgClass: 'badge-sim-medium' },
  partial: { label: 'Partially Similar', color: '#3b82f6', bgClass: 'badge-sim-partial' },
  low: { label: 'Low Similarity', color: '#10b981', bgClass: 'badge-sim-low' },
};

export const PROJECT_STATUSES = {
  draft: { label: 'Draft', class: 'badge-draft' },
  active: { label: 'Active', class: 'badge-active' },
  completed: { label: 'Completed', class: 'badge-completed' },
  archived: { label: 'Archived', class: 'badge-archived' },
};

export const RECOMMENDATION_STATUSES = {
  pending: { label: 'Pending', class: 'badge-pending' },
  approved: { label: 'Approved', class: 'badge-approved' },
  rejected: { label: 'Rejected', class: 'badge-rejected' },
};

export const RECOMMENDATION_CATEGORIES = {
  code: { label: 'Code', icon: '💻', class: 'code' },
  api: { label: 'API', icon: '🔌', class: 'api' },
  database: { label: 'Database', icon: '🗄️', class: 'database' },
  ui: { label: 'UI', icon: '🎨', class: 'ui' },
  documentation: { label: 'Documentation', icon: '📄', class: 'documentation' },
  expertise: { label: 'Expertise', icon: '👤', class: 'expertise' },
};

export const USER_ROLES = {
  user: { label: 'Developer', level: 1 },
  manager: { label: 'Manager', level: 2 },
  admin: { label: 'Admin', level: 3 },
};

export const ALLOWED_FILE_TYPES = ['.pdf', '.docx', '.doc', '.txt'];
export const MAX_FILE_SIZE_MB = 10;
export const MAX_FILES = 5;

export const ITEMS_PER_PAGE = 10;

// Navigation items filtered strictly by user role
export const NAV_ITEMS = [
  {
    section: 'Developer Workspace',
    items: [
      { path: '/dashboard', label: 'Submit Proposal', icon: '⚡', roles: ['developer', 'user'] },
      { path: '/similarity', label: 'Similarity Results', icon: '🔍', roles: ['developer', 'user'] },
    ],
  },
  {
    section: 'Management & Review',
    items: [
      { path: '/dashboard', label: 'Manager Portal', icon: '👔', roles: ['manager'] },
      { path: '/approvals', label: 'Pending Approvals', icon: '✅', roles: ['manager'] },
      { path: '/projects', label: 'Baseline Projects', icon: '📁', roles: ['manager'] },
      { path: '/similarity', label: 'Similarity Scans', icon: '🔍', roles: ['manager'] },
    ],
  },
  {
    section: 'Admin Governance',
    items: [
      { path: '/dashboard', label: 'Executive Dashboard', icon: '🛡️', roles: ['admin'] },
      { path: '/admin', label: 'System Governance', icon: '⚙️', roles: ['admin'] },
      { path: '/analytics', label: 'Cost Savings & ROI', icon: '📈', roles: ['admin'] },
      { path: '/approvals', label: 'Approvals Audit', icon: '✅', roles: ['admin'] },
      { path: '/projects', label: 'All Projects', icon: '📁', roles: ['admin'] },
    ],
  },
];
