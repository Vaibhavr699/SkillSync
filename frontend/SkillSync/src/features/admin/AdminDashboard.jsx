// Enhanced AdminDashboard with White/Black Professional Theme

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAdminStats } from '../../store/slices/adminSlice';
import AdminStats from './AdminStats';
import UserManagement from './UserManagement';
import ProjectManagement from './ProjectManagement';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts';

const ROLE_COLORS = ['#2563eb', '#22c55e', '#a21caf', '#f59e42', '#f43f5e'];
const STATUS_COLORS = ['#2563eb', '#22c55e', '#f59e42', '#a21caf', '#f43f5e', '#64748b'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { stats } = useSelector(state => state.admin);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  const lineData = stats?.activity || [
    { name: 'Mon', value: 0 }, { name: 'Tue', value: 0 }, { name: 'Wed', value: 0 },
    { name: 'Thu', value: 0 }, { name: 'Fri', value: 0 }, { name: 'Sat', value: 0 }, { name: 'Sun', value: 0 },
  ];

  const barData = stats?.market || [
    { name: 'Jan', value: 0 }, { name: 'Feb', value: 0 }, { name: 'Mar', value: 0 },
    { name: 'Apr', value: 0 }, { name: 'May', value: 0 }, { name: 'Jun', value: 0 },
  ];

  const pieData = (stats?.usersByRole || []).map((role, i) => ({
    name: role.role,
    value: parseInt(role.count),
    color: ROLE_COLORS[i % ROLE_COLORS.length]
  }));

  const projectStatusData = (stats?.projectsByStatus || []).map((status, i) => ({
    name: status.status,
    value: parseInt(status.count),
    color: STATUS_COLORS[i % STATUS_COLORS.length]
  }));

  const tasksPerProjectData = stats?.tasksPerProject || [
    { name: 'Project A', value: 5 },
    { name: 'Project B', value: 2 },
    { name: 'Project C', value: 8 },
  ];

  return (
    <div className="min-h-screen w-full pt-8 pb-12 px-4 md:px-10 bg-white text-gray-900 overflow-y-auto">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">Admin Panel Overview</h1>
        <p className="text-gray-500">Here's how your platform is performing recently.</p>
      </div>

      <AdminStats />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="font-semibold text-black mb-4">Users by Role</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {pieData.map((entry, i) => (
                  <Cell key={`cell-${i}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="font-semibold text-black mb-4">Projects by Status</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={projectStatusData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value">
                {projectStatusData.map((entry, i) => (
                  <Cell key={`cell-status-${i}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 my-10">
        <h2 className="font-semibold text-black mb-4">Tasks per Project</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={tasksPerProjectData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <UserManagement />
        </div>
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <ProjectManagement />
        </div>
      </div>
    </div>
  );
}
