// ============================================
// Application Constants
// ============================================

export const APP_NAME = 'DupliSense AI';
export const APP_TAGLINE = 'Duplicate Detection Platform';

// API Base URL — will point to Django backend later
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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
    section: 'Workspace',
    items: [
      { path: '/submit', label: 'Submit Proposal', icon: '⚡', roles: ['developer', 'user', 'manager', 'admin'] },
      { path: '/similarity', label: 'Similarity & Code Scan', icon: '🔍', roles: ['developer', 'user', 'manager', 'admin'] },
      { path: '/projects', label: 'Projects Catalog', icon: '📁', roles: ['developer', 'user', 'manager', 'admin'] },
      { path: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['developer', 'user', 'manager', 'admin'] },
    ],
  },
  {
    section: 'Admin Governance',
    items: [
      { path: '/approvals', label: 'Code Reuse Approvals', icon: '✅', roles: ['manager', 'admin'] },
      { path: '/analytics', label: 'Cost Savings & ROI', icon: '📈', roles: ['manager', 'admin'] },
      { path: '/admin', label: 'Admin Settings', icon: '⚙️', roles: ['admin'] },
    ],
  },
];
