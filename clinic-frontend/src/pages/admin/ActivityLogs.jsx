import { useState, useEffect } from "react";
import api from "../../services/api";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

function ActivityLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/activity-logs/recent?limit=100');
      setLogs(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('CREATE')) return '#4CAF50';
    if (action.includes('UPDATE')) return '#FF9800';
    if (action.includes('DELETE')) return '#f44336';
    if (action.includes('LOGIN')) return '#2196F3';
    return '#666';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>📋 Activity Logs</h1>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        padding: '20px',
        background: 'white',
        borderRadius: '10px'
      }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        >
          <option value="all">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="LOGIN">Login</option>
        </select>

        <input
          type="date"
          value={dateRange.start}
          onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
        <input
          type="date"
          value={dateRange.end}
          onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
          style={{
            padding: '8px',
            borderRadius: '5px',
            border: '1px solid #ddd'
          }}
        />
      </div>

      {/* Logs Table */}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{
          background: 'white',
          borderRadius: '10px',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Time</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Action</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Target</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>IP</th>
              </tr>
            </thead>
            <tbody>
              {logs
                .filter(log => filter === 'all' || log.action.includes(filter))
                .map(log => (
                  <motion.tr
                    key={log._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ borderBottom: '1px solid #eee' }}
                  >
                    <td style={{ padding: '12px' }}>{formatDate(log.createdAt)}</td>
                    <td style={{ padding: '12px' }}>
                      {log.user?.name || 'System'}
                      <div><small>{log.user?.email || ''}</small></div>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: getActionColor(log.action),
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      {log.targetModel || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: log.status === 'success' ? '#4CAF50' : '#f44336',
                        color: 'white',
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>{log.ip || '-'}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ActivityLogs;