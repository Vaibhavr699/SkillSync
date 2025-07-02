import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem as MenuItemComponent,
  Checkbox,
  FormControlLabel,
  Stack,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Search,
  FilterList,
  Sort,
  Refresh,
  People,
  AttachMoney,
  Schedule,
  CheckCircle,
  Cancel,
  PlayArrow,
  Pause,
  Assignment
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  fetchProjects,
  removeProject,
  editProject,
  createProject
} from '../../store/slices/projectSlice';
import ProjectForm from '../../components/projects/ProjectForm';
import ConfirmationDialog from '../../components/common/ConfirmationDialog';
import { toast } from 'react-hot-toast';

const ProjectManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { projects, loading } = useSelector(state => state.projects);

  // State management
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, project: null });
  const [deleteDialog, setDeleteDialog] = useState({ open: false, projectId: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);
  const [projectMenuAnchor, setProjectMenuAnchor] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    totalBudget: 0
  });

  useEffect(() => {
    if (user?.role === 'company') {
      dispatch(fetchProjects({ createdBy: user.id }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (projects) {
      const total = projects.length;
      const open = projects.filter(p => p.status === 'open').length;
      const inProgress = projects.filter(p => p.status === 'in-progress').length;
      const completed = projects.filter(p => p.status === 'completed').length;
      const cancelled = projects.filter(p => p.status === 'cancelled').length;
      const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

      setStats({
        total,
        open,
        inProgress,
        completed,
        cancelled,
        totalBudget
      });
    }
  }, [projects]);

  // Filter and sort projects
  const filteredProjects = projects
    .filter(project => {
      const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = !statusFilter || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'budget':
          aValue = a.budget || 0;
          bValue = b.budget || 0;
          break;
        case 'deadline':
          aValue = new Date(a.deadline);
          bValue = new Date(b.deadline);
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'createdAt':
        default:
          aValue = new Date(a.createdAt || a.created_at);
          bValue = new Date(b.createdAt || b.created_at);
          break;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const paginatedProjects = filteredProjects.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // Handlers
  const handleCreateProject = async (projectData) => {
    try {
      await dispatch(createProject(projectData));
      setCreateDialog(false);
      toast.success('Project created successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to create project');
    }
  };

  const handleEditProject = async (projectData) => {
    try {
      await dispatch(editProject({ projectId: editDialog.project.id, projectData }));
      setEditDialog({ open: false, project: null });
      toast.success('Project updated successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteDialog.projectId) return;
    
    try {
      await dispatch(removeProject(deleteDialog.projectId));
      setDeleteDialog({ open: false, projectId: null });
      toast.success('Project deleted successfully!');
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const projectId of selectedProjects) {
        await dispatch(removeProject(projectId));
      }
      setBulkDeleteDialog(false);
      setSelectedProjects([]);
      toast.success(`${selectedProjects.length} projects deleted successfully!`);
      dispatch(fetchProjects({ createdBy: user.id }));
    } catch (error) {
      toast.error('Failed to delete some projects');
    }
  };

  const handleProjectMenuOpen = (event, project) => {
    setProjectMenuAnchor(event.currentTarget);
    setSelectedProject(project);
  };

  const handleProjectMenuClose = () => {
    setProjectMenuAnchor(null);
    setSelectedProject(null);
  };

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedProjects(paginatedProjects.map(p => p.id));
    } else {
      setSelectedProjects([]);
    }
  };

  const handleSelectProject = (projectId) => {
    setSelectedProjects(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'success';
      case 'in-progress': return 'warning';
      case 'completed': return 'info';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'open': return <CheckCircle />;
      case 'in-progress': return <PlayArrow />;
      case 'completed': return <CheckCircle />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  if (user?.role !== 'company' && user?.role !== 'admin') {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You don't have permission to view this page. Only companies and admins can access project management.
        </Alert>
      </Box>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] w-full bg-gray-50 dark:bg-indigo-950 px-2 md:px-8 py-8 pt-17 mt-16 overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Assignment className="text-white text-2xl" />
            </div>
    <div>
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Project Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage and organize your projects efficiently
              </p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 space-evenly justify-between">
          <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">{stats.total}</div>
              <div className="text-xs text-gray-500 dark:text-indigo-200 font-medium">Total Projects</div>
            </div>
          </div>
          <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-300 mb-1">{stats.open}</div>
              <div className="text-xs text-gray-500 dark:text-indigo-200 font-medium">Open</div>
            </div>
          </div>
          <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-200 mb-1">{stats.inProgress}</div>
              <div className="text-xs text-gray-500 dark:text-indigo-200 font-medium">In Progress</div>
            </div>
          </div>
          <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 dark:border-indigo-800">
            <div className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-1">{stats.completed}</div>
              <div className="text-xs text-gray-500 dark:text-indigo-200 font-medium">Completed</div>
            </div>
          </div>
          
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-[#23234f] rounded-2xl shadow-lg border border-gray-100 dark:border-indigo-800 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            {/* Left: Filters */}
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <TextField
                label="Search projects"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-64 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 border border-gray-200 dark:border-indigo-700"
                InputProps={{
                  className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                }}
                InputLabelProps={{
                  className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                }}
              />
              <FormControl size="small" className="w-48 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg border border-gray-200 dark:border-indigo-700">
                <InputLabel className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white">Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={e => setStatusFilter(e.target.value)}
                  className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white"
                  MenuProps={{
                    PaperProps: {
                      className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                    },
                  }}
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" className="w-48 bg-white text-gray-900 dark:bg-[#23234f] dark:text-white rounded-lg border border-gray-200 dark:border-indigo-700">
                <InputLabel className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white">Sort By</InputLabel>
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  label="Sort By"
                  className="bg-white text-gray-900 dark:bg-[#23234f] dark:text-white"
                  MenuProps={{
                    PaperProps: {
                      className: 'bg-white text-gray-900 dark:bg-[#23234f] dark:text-white',
                    },
                  }}
                >
                  <MenuItem value="createdAt">Created Date</MenuItem>
                  <MenuItem value="title">Title</MenuItem>
                  <MenuItem value="budget">Budget</MenuItem>
                  <MenuItem value="deadline">Deadline</MenuItem>
                  <MenuItem value="status">Status</MenuItem>
                </Select>
              </FormControl>
            </div>
            {/* Right: Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outlined"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                startIcon={<Sort />}
                className="rounded-xl"
                sx={{
                  bgcolor: { xs: '#fff', dark: '#23234f' },
                  color: { xs: '#6366f1', dark: '#a5b4fc' },
                  borderColor: { xs: '#6366f1', dark: '#6366f1' },
                  '&:hover': { bgcolor: { xs: '#eef2ff', dark: '#3730a3' } }
                }}
              >
                {sortOrder === 'asc' ? 'ASC' : 'DESC'}
              </Button>
              <Button
                variant="outlined"
                onClick={() => dispatch(fetchProjects({ createdBy: user.id }))}
                startIcon={<Refresh />}
                className="rounded-xl"
                sx={{
                  bgcolor: { xs: '#fff', dark: '#23234f' },
                  color: { xs: '#22c55e', dark: '#6ee7b7' },
                  borderColor: { xs: '#22c55e', dark: '#22c55e' },
                  '&:hover': { bgcolor: { xs: '#f0fdf4', dark: '#064e3b' } }
                }}
              >
                REFRESH
              </Button>
              <Button
                variant="outlined"
                onClick={() => setViewMode(viewMode === 'table' ? 'grid' : 'table')}
                className="rounded-xl"
                sx={{
                  bgcolor: { xs: '#fff', dark: '#23234f' },
                  color: { xs: '#a21caf', dark: '#f0abfc' },
                  borderColor: { xs: '#a21caf', dark: '#a21caf' },
                  '&:hover': { bgcolor: { xs: '#fdf4ff', dark: '#581c87' } }
                }}
              >
                {viewMode === 'table' ? 'GRID VIEW' : 'TABLE VIEW'}
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                onClick={() => setCreateDialog(true)}
                className="rounded-xl"
                sx={{
                  bgcolor: { xs: '#6366f1', dark: '#6366f1' },
                  color: '#fff',
                  '&:hover': { bgcolor: { xs: '#4f46e5', dark: '#3730a3' } }
                }}
              >
                + CREATE PROJECT
              </Button>
            </div>
          </div>

          {selectedProjects.length > 0 && (
            <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-sm font-medium text-blue-800">
                {selectedProjects.length} project(s) selected
              </span>
              <Button
                variant="outlined"
                color="error"
                onClick={() => setBulkDeleteDialog(true)}
                startIcon={<Delete />}
                className="border-red-500 text-red-600 hover:bg-red-50 rounded-xl"
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {/* Projects Table/Grid */}
        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-[60vh] overflow-y-auto">
            {viewMode === 'table' ? (
              <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <TableContainer component={Paper} className="rounded-2xl shadow border border-indigo-100 dark:bg-indigo-900 dark:border-indigo-800 dark:text-white" sx={{ bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
                    <Table className="min-w-full divide-y divide-gray-200 dark:divide-indigo-800" sx={{ bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
                      <TableHead className="bg-gray-50 dark:bg-indigo-950">
                        <tr>
                          <th className="px-6 py-4 text-left">
                            <Checkbox
                              indeterminate={selectedProjects.length > 0 && selectedProjects.length < paginatedProjects.length}
                              checked={selectedProjects.length === paginatedProjects.length && paginatedProjects.length > 0}
                              onChange={handleSelectAll}
                              className="text-blue-600"
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Title</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Status</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Budget</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Deadline</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Applications</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Created</th>
                          <th className="px-6 py-4 text-left text-lg font-semibold text-gray-900 dark:text-white">Actions</th>
                        </tr>
                      </TableHead>
                      <TableBody className="divide-y divide-gray-200 dark:divide-indigo-800">
                        {paginatedProjects.map((project) => (
                          <TableRow className="bg-white even:bg-gray-50 dark:bg-indigo-900 dark:even:bg-indigo-950 hover:bg-gray-50 transition-colors duration-200">
                            <TableCell className="px-6 py-4">
                              <Checkbox
                                checked={selectedProjects.includes(project.id)}
                                onChange={() => handleSelectProject(project.id)}
                                className="text-blue-600"
                              />
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-900 dark:text-white">{project.title}</div>
                                <div className="text-sm text-gray-500 dark:text-indigo-200 line-clamp-1">
                                  {project.description?.substring(0, 50)}...
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Chip
                                icon={getStatusIcon(project.status)}
                                label={project.status}
                                color={getStatusColor(project.status)}
                                size="small"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="font-semibold text-blue-600 dark:text-blue-300">
                                ₹{project.budget?.toLocaleString('en-IN')}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-indigo-200">
                                {format(new Date(project.deadline), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <Chip
                                icon={<People />}
                                label={project.applications?.length || 0}
                                size="small"
                                variant="outlined"
                                className="text-xs"
                              />
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <span className="text-sm text-gray-700 dark:text-indigo-200">
                                {format(new Date(project.createdAt || project.created_at), 'MMM dd, yyyy')}
                              </span>
                            </TableCell>
                            <TableCell className="px-6 py-4">
                              <div className="flex items-center space-x-2">
                                <IconButton
                                  size="small"
                                  onClick={(e) => handleProjectMenuOpen(e, project)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <MoreVert />
                                </IconButton>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
                <div className="px-6 py-4 border-t border-gray-200">
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    component="div"
                    count={filteredProjects.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(e, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(e) => {
                      setRowsPerPage(parseInt(e.target.value, 10));
                      setPage(0);
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProjects.map((project) => (
                  <div key={project.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-gray-100 overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1 mr-3">
                          {project.title}
                        </h3>
                        <IconButton
                          size="small"
                          onClick={(e) => handleProjectMenuOpen(e, project)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <MoreVert />
                        </IconButton>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {project.description?.substring(0, 100)}...
                      </p>

                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-300">
                          ₹{project.budget?.toLocaleString('en-IN')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-indigo-200">
                          Due: {format(new Date(project.deadline), 'MMM dd, yyyy')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <Chip
                          icon={getStatusIcon(project.status)}
                          label={project.status}
                          color={getStatusColor(project.status)}
                          size="small"
                          className="text-xs dark:bg-indigo-800 dark:text-indigo-100"
                          sx={{ bgcolor: { xs: undefined, dark: '#23234f' }, color: { xs: undefined, dark: '#fff' } }}
                        />
                        <Chip
                          icon={<People />}
                          label={project.applications?.length || 0}
                          size="small"
                          variant="outlined"
                          className="text-xs dark:bg-indigo-800 dark:text-indigo-100"
                          sx={{ bgcolor: { xs: undefined, dark: '#23234f' }, color: { xs: undefined, dark: '#fff' }, borderColor: { xs: undefined, dark: '#3f3f7f' } }}
                        />
                      </div>
                    </div>

                    <div className="px-6 pb-6">
                      <div className="flex space-x-2">
                        <Button
                          component={Link}
                          to={`/dashboard/projects/${project.id}`}
                          size="small"
                          variant="outlined"
                          startIcon={<Visibility />}
                          className="flex-1 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-200 dark:hover:bg-indigo-800 rounded-xl"
                        >
                          View
                        </Button>
                        <Button
                          component={Link}
                          to={`/dashboard/projects/${project.id}?tab=applications`}
                          size="small"
                          variant="outlined"
                          startIcon={<People />}
                          className="flex-1 border-green-500 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-200 dark:hover:bg-indigo-800 rounded-xl"
                        >
                          Applications
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Create Project Dialog */}
        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              height: '90vh', 
              maxHeight: '90vh',
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: { xs: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: 'linear-gradient(135deg, #23234f 0%, #3f3f7f 100%)' },
            color: 'white'
          }}>
            Create New Project
          </DialogTitle>
          <DialogContent sx={{ p: 0, bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
            <ProjectForm
              onSubmit={handleCreateProject}
              onCancel={() => setCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Project Dialog */}
        <Dialog
          open={editDialog.open}
          onClose={() => setEditDialog({ open: false, project: null })}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { 
              height: '90vh', 
              maxHeight: '90vh',
              borderRadius: '16px'
            }
          }}
        >
          <DialogTitle sx={{ 
            borderBottom: '1px solid', 
            borderColor: 'divider',
            background: { xs: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', dark: 'linear-gradient(135deg, #23234f 0%, #3f3f7f 100%)' },
            color: 'white'
          }}>
            Edit Project
          </DialogTitle>
          <DialogContent sx={{ p: 0, bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } }}>
            <ProjectForm
              initialValues={editDialog.project}
              onSubmit={handleEditProject}
              onCancel={() => setEditDialog({ open: false, project: null })}
              submitText="Update Project"
            />
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialog.open}
          title="Delete Project"
          message="Are you sure you want to delete this project? This action cannot be undone."
          onConfirm={handleDeleteProject}
          onCancel={() => setDeleteDialog({ open: false, projectId: null })}
          confirmText="Delete"
          cancelText="Cancel"
          confirmColor="error"
        />

        {/* Bulk Delete Confirmation Dialog */}
        <ConfirmationDialog
          open={bulkDeleteDialog}
          title="Delete Multiple Projects"
          message={`Are you sure you want to delete ${selectedProjects.length} selected project(s)? This action cannot be undone.`}
          onConfirm={handleBulkDelete}
          onCancel={() => setBulkDeleteDialog(false)}
          confirmText="Delete All"
          cancelText="Cancel"
          confirmColor="error"
        />

        {/* Project Menu */}
        <Menu
          anchorEl={projectMenuAnchor}
          open={Boolean(projectMenuAnchor)}
          onClose={handleProjectMenuClose}
          PaperProps={{ sx: { bgcolor: { xs: '#fff', dark: '#23234f' }, color: { xs: 'inherit', dark: '#fff' } } }}
        >
          <MenuItemComponent
            component={Link}
            to={`/dashboard/projects/${selectedProject?.id}`}
            onClick={handleProjectMenuClose}
          >
            <Visibility sx={{ mr: 1 }} />
            View Project
          </MenuItemComponent>
          <MenuItemComponent
            component={Link}
            to={`/dashboard/projects/${selectedProject?.id}?tab=applications`}
            onClick={handleProjectMenuClose}
          >
            <People sx={{ mr: 1 }} />
            View Applications
          </MenuItemComponent>
          <MenuItemComponent
            onClick={() => {
              setEditDialog({ open: true, project: selectedProject });
              handleProjectMenuClose();
            }}
          >
            <Edit sx={{ mr: 1 }} />
            Edit Project
          </MenuItemComponent>
          <MenuItemComponent
            onClick={() => {
              setDeleteDialog({ open: true, projectId: selectedProject?.id });
              handleProjectMenuClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete Project
          </MenuItemComponent>
        </Menu>
      </div>
    </div>
  );
};

export default ProjectManagement;