import { Outlet } from 'react-router';
import { AuthProvider } from 'src/context/auth-context';
import { ContactProvider } from 'src/context/contact-context';

const Root = () => {
  return (
    <AuthProvider>
      <ContactProvider>
        <Outlet />
      </ContactProvider>
    </AuthProvider>
  );
};

export default Root;
