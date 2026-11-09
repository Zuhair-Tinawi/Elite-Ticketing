import { Route, Routes } from 'react-router-dom';
import Layout from '@/components/Layout/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Home from '@/pages/Home';
import Login from '@/pages/auth/Login';
import Register from '@/pages/auth/Register';
import BrowseEvents from '@/pages/attendee/BrowseEvents';
import EventDetails from '@/pages/attendee/EventDetails';
import MyTickets from '@/pages/attendee/MyTickets';
import Rewards from '@/pages/attendee/Rewards';
import PrivateEvents from '@/pages/PrivateEvents';
import OrganizerDashboard from '@/pages/organizer/OrganizerDashboard';
import CreateEvent from '@/pages/organizer/CreateEvent';
import ManageEvents from '@/pages/organizer/ManageEvents';
import EventAnalytics from '@/pages/organizer/EventAnalytics';
import ScanTickets from '@/pages/staff/ScanTickets';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import NotFound from '@/pages/NotFound';
export default function App() {
  return (









    <Routes>
      <Route element={<Layout />}>

{/* Public */}

        <Route index element={<Home />} />
        <Route path="events" element={<BrowseEvents />} />
        <Route path="events/:eventId" element={<EventDetails />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="private-events" element={<PrivateEvents />} />

{/* hayala signed in user */}

        <Route element={<ProtectedRoute />}>
          <Route path="my-tickets" element={<MyTickets />} />
          <Route path="rewards" element={<Rewards />} />
        </Route>

{/* Lal admin w el organizer */}

        <Route element={<ProtectedRoute allowedRoles={['organizer', 'admin']} />}>
          <Route path="organizer" element={<OrganizerDashboard />} />
          <Route path="organizer/events/new" element={<CreateEvent />} />
          <Route path="organizer/events/:eventId/manage" element={<ManageEvents />} />
          <Route path="organizer/events/:eventId/analytics" element={<EventAnalytics />} />
        </Route>

{/* lal staff bas kamen el admin w organizer can scan yaane */}

        <Route element={<ProtectedRoute allowedRoles={['staff', 'organizer', 'admin']} />}>
          <Route path="staff/scan" element={<ScanTickets />} />
        </Route>

 {/* lal admin */}

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="admin" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}