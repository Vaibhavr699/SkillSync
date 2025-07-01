import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import NotificationsDropdown from '../notifications/NotificationsDropdown';
import { Badge, IconButton, Paper, List, ListItem, ListItemAvatar, Avatar, ListItemText, CircularProgress, Typography, Divider, Box, FormControl, InputLabel, Select, MenuItem, Chip, Autocomplete, TextField } from '@mui/material';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { FaUserTie, FaBuilding, FaUser } from 'react-icons/fa';
import ProjectFilters from '../projects/ProjectFilters';
import { searchUsers } from '../../api/users';
import api from '../../api/api';
import { useThemeContext } from '../../context/ThemeContext';
import { useState, useRef, useEffect } from 'react';
import { FiSearch } from 'react-icons/fi';

let debounceTimeout;

const userRoles = [
  { value: '', label: 'All Roles' },
  { value: 'admin', label: 'Admin' },
  { value: 'company', label: 'Company' },
  { value: 'freelancer', label: 'Freelancer' },
];

const roleBadgeStyles = {
  admin: 'bg-black text-white border border-gray-700',
  company: 'bg-gray-800 text-white border border-gray-700',
  freelancer: 'bg-white text-black border border-gray-400',
};

const roleIcons = {
  admin: <FaUserTie className="inline mr-1 text-xs" />,
  company: <FaBuilding className="inline mr-1 text-xs" />,
  freelancer: <FaUser className="inline mr-1 text-xs" />,
};

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('');
  const [tagFilter, setTagFilter] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [roleSelectOpen, setRoleSelectOpen] = useState(false);
  const [tagAutocompleteOpen, setTagAutocompleteOpen] = useState(false);
  const inputRef = useRef();
  const { toggleTheme, mode } = useThemeContext();
  const isDark = mode === 'dark';

  // Fetch all tags for tag filter
  useEffect(() => {
    let isMounted = true;
    api.get('/users/skills').then(res => {
      if (isMounted) setAllTags(res.data || []);
    });
    return () => { isMounted = false; };
  }, []);

  const fetchUsers = async (value, role, tags) => {
    setLoading(true);
    try {
      const params = { name: value };
      if (role) params.role = role;
      if (tags && tags.length > 0) params.skills = tags.join(',');
      let users = await searchUsers(params);
      // Exclude the current user from search results
      if (user && user.id) {
        users = users.filter(u => u.id !== user.id);
      }
      setResults(users);
      setShowDropdown(true);
    } catch {
      setResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (debounceTimeout) clearTimeout(debounceTimeout);
    if (!value.trim() && !roleFilter && tagFilter.length === 0) {
      setResults([]);
      setShowDropdown(false);
      return;
    }
    debounceTimeout = setTimeout(() => {
      fetchUsers(value, roleFilter, tagFilter);
    }, 250);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    fetchUsers(search, e.target.value, tagFilter);
  };

  const handleTagChange = (event, value) => {
    setTagFilter(value);
    fetchUsers(search, roleFilter, value);
  };

  const handleResultClick = (userId) => {
    setShowDropdown(false);
    setSearch('');
    setRoleFilter('');
    setTagFilter([]);
    navigate(`/users/${userId}`);
  };

  const handleFocus = () => {
    if ((search.trim() || roleFilter || tagFilter.length > 0) && results.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (search.trim() || roleFilter || tagFilter.length > 0) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setShowDropdown(false);
    }
  };

  // Only close dropdown if neither select nor autocomplete is open
  const handleClickAway = (event) => {
    if (
      inputRef.current &&
      !inputRef.current.contains(event.target) &&
      !roleSelectOpen &&
      !tagAutocompleteOpen
    ) {
      setShowDropdown(false);
    }
  };

  return (
    <header className="w-full bg-white dark:bg-indigo-950 shadow-lg fixed top-0 left-0 z-30 h-16 flex items-center px-8 justify-between border-b border-indigo-200 dark:border-indigo-800">
      <Link to="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-9 h-9 rounded-full shadow-md border-2 border-indigo-200 dark:border-indigo-700 bg-white" />
        <span className="text-2xl font-extrabold text-indigo-900 dark:text-white tracking-tight font-sans drop-shadow">SkillSync</span>
      </Link>
      <div className="flex-1 flex justify-center">
        <form onSubmit={handleSubmit} className="relative w-full max-w-xl flex items-center">
          <input
            ref={inputRef}
            type="text"
            className="w-full pl-5 pr-14 py-2.5 rounded-full border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-700 dark:focus:ring-indigo-400 text-base shadow transition placeholder:text-indigo-400 dark:placeholder:text-indigo-300 font-medium text-indigo-900 dark:text-white"
            placeholder="Search users..."
            value={search}
            onChange={handleSearchChange}
            onFocus={handleFocus}
            autoComplete="off"
            style={{ boxShadow: '0 2px 8px 0 rgba(80,56,200,0.08)' }}
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition"
            aria-label="Search"
          >
            <FiSearch className="text-indigo-700 dark:text-white text-xl" />
          </button>
          {showDropdown && (
            <ClickAwayListener onClickAway={handleClickAway}>
              <Paper
                className="absolute left-0 right-0 top-12 z-40 max-h-96 overflow-y-auto rounded-2xl shadow-2xl border border-indigo-200 bg-white"
                elevation={3}
                sx={{ minWidth: '100%', p: 0, transition: 'box-shadow 0.2s' }}
              >
                <Box className="flex flex-col gap-2 p-4 border-b border-indigo-100 bg-indigo-50 rounded-t-2xl">
                  <div className="flex gap-3">
                    <FormControl size="small" className="flex-1">
                      <InputLabel>Role</InputLabel>
                      <Select
                        value={roleFilter}
                        label="Role"
                        onChange={handleRoleChange}
                        className="bg-white rounded-md"
                        open={roleSelectOpen}
                        onOpen={() => setRoleSelectOpen(true)}
                        onClose={() => setRoleSelectOpen(false)}
                        MenuProps={{
                          PaperProps: {
                            sx: { mt: 1, borderRadius: 2, boxShadow: 3 },
                          },
                        }}
                      >
                        {userRoles.map(r => (
                          <MenuItem key={r.value} value={r.value}>{r.label}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Autocomplete
                      multiple
                      options={allTags}
                      value={tagFilter}
                      onChange={handleTagChange}
                      open={tagAutocompleteOpen}
                      onOpen={() => setTagAutocompleteOpen(true)}
                      onClose={() => setTagAutocompleteOpen(false)}
                      disableCloseOnSelect
                      renderInput={(params) => (
                        <TextField {...params} label="Tag" size="small" className="bg-white rounded-md" />
                      )}
                      renderTags={(value, getTagProps) =>
                        value.map((option, index) => (
                          <Chip
                            variant="outlined"
                            label={option}
                            size="small"
                            {...getTagProps({ index })}
                            className="bg-white text-black border border-indigo-300"
                          />
                        ))
                      }
                      sx={{ flex: 1, minWidth: 0 }}
                      ListboxProps={{
                        style: { maxHeight: 200 },
                      }}
                    />
                  </div>
                </Box>
                <Divider />
                {loading ? (
                  <div className="flex items-center justify-center py-6"><CircularProgress size={28} /></div>
                ) : results.length > 0 ? (
                  <List className="py-2">
                    {results.map((user) => (
                      <ListItem button key={user.id} onMouseDown={() => handleResultClick(user.id)} className="hover:bg-indigo-100 rounded-lg transition">
                        <ListItemAvatar>
                          <Avatar src={user.photo || '/logo.svg'} className="ring-2 ring-indigo-300 shadow-sm">{user.name?.[0] || 'U'}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <span className="font-semibold text-indigo-900 flex items-center gap-2">
                              {user.name}
                              {user.role && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ml-1 border ${roleBadgeStyles[user.role] || 'bg-indigo-200 text-indigo-900 border-indigo-300'}`}
                                  style={{ minWidth: 70, justifyContent: 'center' }}
                                >
                                  {roleIcons[user.role]}
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                              )}
                            </span>
                          }
                          secondary={<span className="text-xs text-indigo-500 font-medium">{user.email}</span>}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <div className="py-6 text-center text-indigo-400 font-medium">No users found</div>
                )}
              </Paper>
            </ClickAwayListener>
          )}
        </form>
      </div>
      <div className="flex items-center gap-4">
        <NotificationsDropdown />
        <button
          onClick={() => {
            console.log('Theme toggle button clicked');
            toggleTheme();
          }}
          className="p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-800 transition flex items-center justify-center border border-indigo-200 dark:border-indigo-700"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 1v2m0 18v2m11-11h-2M3 12H1m16.95 6.95l-1.41-1.41M6.46 6.46L5.05 5.05m12.02 0l-1.41 1.41M6.46 17.54l-1.41 1.41" />
            </svg>
          )}
        </button>
        {user ? (
          <Link to="/dashboard/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-800 hover:bg-indigo-200 dark:hover:bg-indigo-700 transition font-medium text-indigo-900 dark:text-white border border-indigo-200 dark:border-indigo-700">
            <Avatar src={user.photo || '/logo.svg'} className="w-8 h-8" />
            {user.role && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ml-1 border ${roleBadgeStyles[user.role] || 'bg-indigo-200 text-indigo-900 border-indigo-300'}`}
                style={{ minWidth: 70, justifyContent: 'center' }}
              >
                {roleIcons[user.role]}
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            )}
          </Link>
        ) : (
          <Link to="/login" className="px-4 py-2 rounded-full bg-indigo-700 text-white font-semibold hover:bg-indigo-800 transition border border-indigo-800 shadow">Login</Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
