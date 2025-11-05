import { ROUTES } from './routes';

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles?: string[];
  children?: NavigationItem[];
}

export const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    label: 'Applications',
    path: ROUTES.APPLICATIONS,
    icon: 'applications',
  },
  {
    label: 'BVN Verification',
    path: ROUTES.BVN,
    icon: 'bvn',
  },
  {
    label: 'Selfie Verification',
    path: ROUTES.SELFIE,
    icon: 'selfie',
  },
  {
    label: 'Location Records',
    path: ROUTES.LOCATION,
    icon: 'location',
  },
  {
    label: 'Bank Statements',
    path: ROUTES.BANK_STATEMENT,
    icon: 'bank',
  },
  {
    label: 'Audit Trail',
    path: ROUTES.AUDIT,
    icon: 'audit',
    roles: ['ADMIN', 'SENIOR_UNDERWRITER'],
  },
];

