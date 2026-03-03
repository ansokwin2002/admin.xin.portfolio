import { Outlet } from 'react-router';
import { AuthProvider } from 'src/context/auth-context';

const Root = () => {
  return (
    <AuthProvider>
      <Outlet />
    </AuthProvider>
  );
};

export default Root;
