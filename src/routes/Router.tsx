// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import Root from '../layouts/Root';
import AuthGuard from 'src/components/guards/AuthGuard';
import GuestGuard from 'src/components/guards/GuestGuard';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication
const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));
const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));
const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

// Dashboards
const Modern = Loadable(lazy(() => import('../views/dashboards/Modern')));

//pages
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));

/* ****Apps***** */
const Products = Loadable(lazy(() => import('../views/apps/products/ProductList')));
const Contact = Loadable(lazy(() => import('../views/apps/contact/ContactList')));
const LogoClient = Loadable(lazy(() => import('../views/apps/logo-client/LogoClientList')));
const Notes = Loadable(lazy(() => import('../views/apps/notes/Notes')));
const Form = Loadable(lazy(() => import('../views/utilities/form/Form')));
const Table = Loadable(lazy(() => import('../views/utilities/table/Table')));
const Tickets = Loadable(lazy(() => import('../views/apps/tickets/Tickets')));
const CreateTickets = Loadable(lazy(() => import('../views/apps/tickets/CreateTickets')));
const Blog = Loadable(lazy(() => import('../views/apps/blog/Blog')));
const BlogDetail = Loadable(lazy(() => import('../views/apps/blog/BlogDetail')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

// // icons
const SolarIcon = Loadable(lazy(() => import('../views/icons/SolarIcon')));

const Router = [
  {
    path: '/',
    element: <Root />,
    children: [
      {
        path: '/',
        element: (
          <AuthGuard>
            <FullLayout />
          </AuthGuard>
        ),
        children: [
          { index: true, element: <Modern /> },
          { path: '/apps/products', element: <Products /> },
          { path: '/apps/contact', element: <Contact /> },
          { path: '/apps/logo-clients', element: <LogoClient /> },
          { path: '/apps/notes', element: <Notes /> },
          { path: '/utilities/form', element: <Form /> },
          { path: '/utilities/table', element: <Table /> },
          { path: '/apps/tickets', element: <Tickets /> },
          { path: '/apps/tickets/create', element: <CreateTickets /> },
          { path: '/apps/blog/post', element: <Blog /> },
          { path: '/apps/blog/detail/:id', element: <BlogDetail /> },
          { path: '/user-profile', element: <UserProfile /> },
          { path: '/icons/iconify', element: <SolarIcon /> },
          { path: '*', element: <Navigate to="/auth/404" /> },
        ],
      },
      {
        path: '/auth',
        element: (
          <GuestGuard>
            <BlankLayout />
          </GuestGuard>
        ),
        children: [
          { path: 'login', element: <Login2 /> },
          { path: 'register', element: <Register2 /> },
          { path: 'maintenance', element: <Maintainance /> },
          { path: '404', element: <Error /> },
          { path: '*', element: <Navigate to="/auth/404" /> },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/auth/404" />
      }
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;
