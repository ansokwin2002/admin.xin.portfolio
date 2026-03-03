//Apps Links Type & Data
interface appsLinkType {
  href: string;
  title: string;
  subtext: string;
  avatar: string;
}

const appsLink: appsLinkType[] = [
  {
    href: '/admin/apps/chats',
    title: 'Chat Application',
    subtext: 'New messages arrived',
    avatar: 'src/assets/images/svgs/icon-dd-chat.svg',
  },
  {
    href: '/admin/apps/ecommerce/shop',
    title: 'eCommerce App',
    subtext: 'New stock available',
    avatar: 'src/assets/images/svgs/icon-dd-cart.svg',
  },
  {
    href: '/admin/apps/notes',
    title: 'Notes App',
    subtext: 'To-do and Daily tasks',
    avatar: 'src/assets/images/svgs/icon-dd-invoice.svg',
  },
  {
    href: '/admin/apps/calendar',
    title: 'Calendar App',
    subtext: 'Get dates',
    avatar: 'src/assets/images/svgs/icon-dd-date.svg',
  },
  {
    href: '/admin/apps/contacts',
    title: 'Contact Application',
    subtext: '2 Unsaved Contacts',
    avatar: 'src/assets/images/svgs/icon-dd-mobile.svg',
  },
  {
    href: '/admin/apps/tickets',
    title: 'Tickets App',
    subtext: 'Submit tickets',
    avatar: 'src/assets/images/svgs/icon-dd-lifebuoy.svg',
  },
  {
    href: '/admin/apps/email',
    title: 'Email App',
    subtext: 'Get new emails',
    avatar: 'src/assets/images/svgs/icon-dd-message-box.svg',
  },
  {
    href: '/admin/apps/blog/post',
    title: 'Blog App',
    subtext: 'added new blog',
    avatar: 'src/assets/images/svgs/icon-dd-application.svg',
  },
];

interface LinkType {
  href: string;
  title: string;
}

const pageLinks: LinkType[] = [
  {
    href: '/admin/theme-pages/pricing',
    title: 'Pricing Page',
  },
  {
    href: '/admin/auth/auth1/login',
    title: 'Authentication Design',
  },
  {
    href: '/admin/auth/auth1/register',
    title: 'Register Now',
  },
  {
    href: '/404',
    title: '404 Error Page',
  },
  {
    href: '/admin/apps/kanban',
    title: 'Kanban App',
  },
  {
    href: '/admin/apps/user-profile/profile',
    title: 'User Application',
  },
  {
    href: '/admin/apps/blog/post',
    title: 'Blog Design',
  },
  {
    href: '/admin/apps/ecommerce/checkout',
    title: 'Shopping Cart',
  },
];

//   Search Data
interface SearchType {
  href: string;
  title: string;
}

const SearchLinks: SearchType[] = [
  {
    title: 'Analytics',
    href: '/admin/dashboards/analytics',
  },
  {
    title: 'eCommerce',
    href: '/admin/dashboards/eCommerce',
  },
  {
    title: 'CRM',
    href: '/admin/dashboards/crm',
  },
  {
    title: 'Contacts',
    href: '/admin/dashboards/eCommerce',
  },
  {
    title: 'Posts',
    href: '/admin/dashboards/posts',
  },
  {
    title: 'Details',
    href: '/admin/dashboards/details',
  },
];

//   Message Data
interface MessageType {
  title: string;
  avatar: string;
  subtitle: string;
}

import avatar1 from 'src/assets/images/profile/user-2.jpg';
import avatar2 from 'src/assets/images/profile/user-3.jpg';
import avatar3 from 'src/assets/images/profile/user-4.jpg';
import avatar4 from 'src/assets/images/profile/user-5.jpg';
import avatar5 from 'src/assets/images/profile/user-6.jpg';

const MessagesLink: MessageType[] = [
  {
    avatar: avatar1,
    title: 'Roman Joined the Team!',
    subtitle: 'Congratulate him',
  },
  {
    avatar: avatar2,
    title: 'New message',
    subtitle: 'Salma sent you new message',
  },
  {
    avatar: avatar3,
    title: 'Bianca sent payment',
    subtitle: 'Check your earnings',
  },
  {
    avatar: avatar4,
    title: 'Jolly completed tasks',
    subtitle: 'Assign her new tasks',
  },
  {
    avatar: avatar5,
    title: 'John received payment',
    subtitle: '$230 deducted from account',
  },
];

//   Notification Data
interface NotificationType {
  title: string;
  icon: string;
  subtitle: string;
  bgcolor: string;
  color: string;
  time: string;
}

const Notification: NotificationType[] = [
  {
    icon: 'solar:widget-3-line-duotone',
    bgcolor: 'bg-lighterror dark:bg-lighterror',
    color: 'text-error',
    title: 'Launch Admin',
    subtitle: 'Just see the my new admin!',
    time: '9:30 AM',
  },
  {
    icon: 'solar:calendar-line-duotone',
    bgcolor: 'bg-lightprimary dark:bg-lightprimary',
    color: 'text-primary',
    title: 'Event Today',
    subtitle: 'Just a reminder that you have event',
    time: '9:15 AM',
  },
  {
    icon: 'solar:settings-line-duotone',
    bgcolor: 'bg-lightsecondary dark:bg-lightsecondary',
    color: 'text-secondary',
    title: 'Settings',
    subtitle: 'You can customize this template as you want',
    time: '4:36 PM',
  },
  {
    icon: 'solar:widget-4-line-duotone',
    bgcolor: 'bg-lightwarning dark:bg-lightwarning ',
    color: 'text-warning',
    title: 'Launch Admin',
    subtitle: 'Just see the my new admin!',
    time: '9:30 AM',
  },
  {
    icon: 'solar:calendar-line-duotone',
    bgcolor: 'bg-lightprimary dark:bg-lightprimary',
    color: 'text-primary',
    title: 'Event Today',
    subtitle: 'Just a reminder that you have event',
    time: '9:15 AM',
  },
  {
    icon: 'solar:settings-line-duotone',
    bgcolor: 'bg-lightsecondary dark:bg-lightsecondary',
    color: 'text-secondary',
    title: 'Settings',
    subtitle: 'You can customize this template as you want',
    time: '4:36 PM',
  },
];

//  Profile Data
interface ProfileType {
  title: string;
  img: string;
  subtitle: string;
  url: string;
  icon: string
}

import acccountIcon from 'src/assets/images/svgs/icon-account.svg';
import inboxIcon from 'src/assets/images/svgs/icon-inbox.svg';
import taskIcon from 'src/assets/images/svgs/icon-tasks.svg';

const profileDD: ProfileType[] = [
  {
    img: acccountIcon,
    title: 'My Profile',
    subtitle: 'Account settings',
    icon: "tabler:user",
    url: '/admin/user-profile',
  },
  {
    img: inboxIcon,
    title: 'My Notes',
    subtitle: 'My Daily Notes',
    icon: "tabler:mail",
    url: '/admin/apps/notes',
  },
  {
    img: taskIcon,
    title: 'My Blogs',
    subtitle: 'Stories, insights, and updates',
    icon: "tabler:list-check",
    url: '/admin/apps/blog/post',
  },
];

export { appsLink, pageLinks, SearchLinks, MessagesLink, Notification, profileDD };
