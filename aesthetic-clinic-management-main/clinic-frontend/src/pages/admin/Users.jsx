import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../services/api";
import toast from "react-hot-toast";
import UserModal from "../../components/admin/UserModal";
import RoleModal from "../../components/admin/RoleModal";

function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
    search: ""
  });
  const [currentUser, setCurrentUser] = useState(null);

  const isSuperAdmin = (user) => {
    return user?.role === 'SuperAdmin' || user?.roleId?.roleName === 'SuperAdmin';
  };

  const isAdmin = (user) => {
    return user?.role === 'Admin' || user?.roleId?.roleName === 'Admin';
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/users?${params.toString()}`);
      setUsers(res.data.users || res.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setRoles(res.data);
    } catch (error) {
      console.error("Failed to fetch roles");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await api.put(`/users/${userId}/status`, { status: newStatus });
      toast.success(`User ${newStatus === 'active' ? 'activated' : 'deactivated'} ✅`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to update status");
    }
  };

  const deleteUser = async (userId, userRole) => {
    if (userRole === 'SuperAdmin') {
      toast.error("Cannot delete SuperAdmin");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await api.delete(`/users/${userId}`);
      toast.success("User deleted ✅");
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  const getRoleBadgeColor = (roleName) => {
    const colors = {
      SuperAdmin: '#f44336',
      Admin: '#FF9800',
      Doctor: '#2196F3',
      Nurse: '#4CAF50',
      Receptionist: '#9C27B0',
      Accountant: '#009688',
      Patient: '#757575'
    };
    return colors[roleName] || '#757575';
  };

  const getStatusBadge = (status) => {
    return status === 'active' 
      ? { bg: '#4CAF50', text: 'Active' }
      : { bg: '#f44336', text: 'Inactive' };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={styles.container}
    >
      {/* Header */}
      <div style={styles.header}>
        <h1>👥 User Management</h1>
        <div style={styles.headerActions}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setRoleModalOpen(true)}
            style={{ ...styles.button, background: '#9C27B0' }}
          >
            + Manage Roles
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditData(null);
              setModalOpen(true);
            }}
            style={{ ...styles.button, background: '#4CAF50' }}
          >
            + Add New User
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filters}>
        <input
          type="text"
          placeholder="🔍 Search by name, email, phone..."
          value={filters.search}
          onChange={(e) => setFilters({...filters, search: e.target.value})}
          style={styles.searchInput}
        />
        <select
          value={filters.role}
          onChange={(e) => setFilters({...filters, role: e.target.value})}
          style={styles.filterSelect}
        >
          <option value="">All Roles</option>
          {roles.map(role => (
            <option key={role._id} value={role._id}>{role.roleName}</option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(e) => setFilters({...filters, status: e.target.value})}
          style={styles.filterSelect}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div style={styles.loaderContainer}>
          <div style={styles.loader} />
        </div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.tableHeader}>
                <th style={styles.th}>User</th>
                <th style={styles.th}>Contact</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Department</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Last Login</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => {
                const status = getStatusBadge(user.status);
                return (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={styles.tableRow}
                  >
                    <td style={styles.td}>
                      <div style={styles.userInfo}>
                        {user.profileImage ? (
                          <img 
                            src={user.profileImage} 
                            alt={user.name}
                            style={styles.avatar}
                          />
                        ) : (
                          <div style={styles.avatarPlaceholder}>
                            {user.name?.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                          <small style={{ color: '#666' }}>{user.email}</small>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td}>
                      <div>{user.phone || 'N/A'}</div>
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.roleBadge,
                        background: getRoleBadgeColor(user.roleId?.roleName)
                      }}>
                        {user.roleId?.roleName}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.department || '-'}
                    </td>
                    <td style={styles.td}>
                      <span style={{
                        ...styles.statusBadge,
                        background: status.bg
                      }}>
                        {status.text}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    <td style={styles.td}>
                      <div style={styles.actions}>
                        {isSuperAdmin(currentUser) && user.roleId?.roleName !== 'SuperAdmin' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleStatus(user._id, user.status)}
                            style={{
                              ...styles.actionButton,
                              background: user.status === 'active' ? '#FF9800' : '#4CAF50'
                            }}
                            title={user.status === 'active' ? 'Deactivate' : 'Activate'}
                          >
                            {user.status === 'active' ? '🔴' : '🟢'}
                          </motion.button>
                        )}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setEditData(user);
                            setModalOpen(true);
                          }}
                          style={{ ...styles.actionButton, background: '#2196F3' }}
                          title="Edit"
                        >
                          ✏️
                        </motion.button>
                        {(isSuperAdmin(currentUser) || isAdmin(currentUser)) && 
                         user.roleId?.roleName !== 'SuperAdmin' && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteUser(user._id, user.roleId?.roleName)}
                            style={{ ...styles.actionButton, background: '#f44336' }}
                            title="Delete"
                          >
                            🗑️
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          {users.length === 0 && (
            <div style={styles.noData}>
              <p>No users found</p>
            </div>
          )}
        </div>
      )}

      {/* User Modal */}
      <UserModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditData(null);
        }}
        refresh={fetchUsers}
        editData={editData}
        roles={roles}
      />

      {/* Role Modal */}
      <RoleModal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        refresh={fetchRoles}
      />
    </motion.div>
  );
}

const styles = {
  container: {
    padding: '20px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '10px'
  },
  headerActions: {
    display: 'flex',
    gap: '10px'
  },
  button: {
    padding: '10px 20px',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  filters: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  searchInput: {
    flex: 1,
    minWidth: '250px',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px'
  },
  filterSelect: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #ddd',
    fontSize: '14px',
    minWidth: '150px'
  },
  tableContainer: {
    overflowX: 'auto',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse'
  },
  tableHeader: {
    background: '#f5f5f5'
  },
  th: {
    padding: '15px',
    textAlign: 'left',
    fontWeight: 'bold',
    color: '#333'
  },
  tableRow: {
    borderBottom: '1px solid #eee'
  },
  td: {
    padding: '15px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover'
  },
  avatarPlaceholder: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: '#2196F3',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  roleBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  statusBadge: {
    padding: '4px 8px',
    borderRadius: '4px',
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold'
  },
  actions: {
    display: 'flex',
    gap: '5px'
  },
  actionButton: {
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '4px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px'
  },
  loaderContainer: {
    textAlign: 'center',
    padding: '40px'
  },
  loader: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #2196F3',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  },
  noData: {
    textAlign: 'center',
    padding: '40px',
    color: '#999'
  }
};

export default Users;
