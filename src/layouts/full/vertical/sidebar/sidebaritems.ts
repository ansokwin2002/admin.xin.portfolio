export interface ChildItem {
  id?: number | string;
  name?: string;
  icon?: string;
  children?: ChildItem[];
  item?: unknown;
  url?: string;
  color?: string;
  disabled?: boolean;
  subtitle?: string;
  badge?: boolean;
  badgeType?: string;
  isPro?: boolean;
}

export interface MenuItem {
  heading?: string;
  name?: string;
  icon?: string;
  id?: number;
  to?: string;
  items?: MenuItem[];
  children?: ChildItem[];
  url?: string;
  disabled?: boolean;
  subtitle?: string;
  badgeType?: string;
  badge?: boolean;
  isPro?: boolean;
}

import { uniqueId } from 'lodash';

const SidebarContent: MenuItem[] = [
  {
    heading: 'Home',
    children: [
      {
        name: 'Dashboard',
        icon: 'solar:widget-2-linear',
        id: uniqueId(),
        url: '/',
        isPro: false,
      },
    ],
  },
  {
    heading: 'Apps',
    children: [
      {
        id: uniqueId(),
        name: 'Contact',
        icon: 'solar:phone-calling-linear',
        url: '/apps/contact',
        isPro: false,
      },
      {
        id: uniqueId(),
        name: 'Products',
        icon: 'solar:bag-5-linear',
        url: '/apps/products',
        isPro: false,
      },
    ],
  },
];

export default SidebarContent;
