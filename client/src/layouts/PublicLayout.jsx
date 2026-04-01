import { Outlet } from 'react-router-dom';
import SiteNavbar from '../components/SiteNavbar';

const PublicLayout = () => (
  <div className="min-h-screen flex flex-col bg-transparent">
    <SiteNavbar />
    <div className="flex-1 flex flex-col min-h-0">
      <Outlet />
    </div>
  </div>
);

export default PublicLayout;
