import { useEffect, useState } from 'react';
import { listUsers, setUserRole } from '@/services/userService';
import type { UserProfile, UserRole } from '@/types';
import { ROLE_LABELS } from '@/utils/roles';
import LoadingSpinner from '@/components/common/LoadingSpinner';

const ALL_ROLES: UserRole[] = ['attendee', 'staff', 'organizer', 'admin'];

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUid, setSavingUid] = useState<string | null>(null);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(uid: string, role: UserRole) {
    setSavingUid(uid);
    try {
      await setUserRole(uid, role);
      setUsers((prev) => prev.map((u) => (u.uid === uid ? { ...u, role } : u)));
    } finally {
      setSavingUid(null);
    }
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <p style={{ color: 'var(--color-text-muted)' }}>
        Manage user roles. New signups start as attendees; promote trusted
        users to organizer or staff here.
      </p>

      <div className="card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.uid}>
                <td>{user.displayName}</td>
                <td>{user.email}</td>
                <td>
                  <select
                    value={user.role}
                    disabled={savingUid === user.uid}
                    onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
                  >
                    {ALL_ROLES.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
