import { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUserProfile, updateProfile, uploadProfileImage, updateSkills } from '../../store/slices/userSlice';
import FileUpload from '../../components/files/FileUpload';
import { toast } from 'react-toastify';
import { Chip, Typography } from '@mui/material';
import { HiOutlineCamera, HiOutlineUser, HiOutlineBadgeCheck, HiOutlineInformationCircle, HiOutlineTag, HiOutlinePencil, HiOutlineCheck, HiOutlineX } from 'react-icons/hi';
import { Autocomplete, TextField, Backdrop } from '@mui/material';
import api from '../../api/api';

const Profile = () => {
  const dispatch = useDispatch();
  const { profile, loading, error } = useSelector(state => state.user);
  const { user } = useSelector(state => state.auth);
  const [editMode, setEditMode] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [allSkills, setAllSkills] = useState([]);
  const [skillsLoading, setSkillsLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      dispatch(fetchUserProfile(userId));
    }
  }, [dispatch, user]);

  // Fetch all skills for Autocomplete
  useEffect(() => {
    setSkillsLoading(true);
    api.get('/users/skills')
      .then(res => setAllSkills(res.data || []))
      .finally(() => setSkillsLoading(false));
  }, []);

  const handleImageUpload = async (files) => {
    if (files.length > 0) {
      setUploadingImage(true);
      try {
        const formData = new FormData();
        formData.append('photo', files[0].file);
        await dispatch(uploadProfileImage(formData));
        const userId = user?._id || user?.id;
        if (userId) await dispatch(fetchUserProfile(userId));
        toast.success('Profile picture updated successfully!', {
          position: "top-right",
          autoClose: 3000,
        });
      } catch (err) {
        toast.error('Failed to upload image. Please try again.', {
          position: "top-right",
          autoClose: 3456,
        });
      } finally {
        setUploadingImage(false);
      }
    }
  };

  const handleProfileUpdate = async (values) => {
    try {
      await dispatch(updateProfile(values));
      const userId = user?._id || user?.id;
      if (userId) await dispatch(fetchUserProfile(userId));
      toast.success('Profile updated successfully!', {
        position: "top-right",
        autoClose: 3000,
      });
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update profile. Please try again.', {
        position: "top-right",
        autoClose: 3456,
      });
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      hourlyRate: profile?.hourlyRate || 0,
      skills: profile?.skills || [],
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      bio: Yup.string().max(500, 'Bio must be less than 500 characters'),
      hourlyRate: Yup.number().min(0, 'Hourly rate must be positive'),
    }),
    onSubmit: handleProfileUpdate,
  });

  const handleAddSkill = async () => {
    if (!profile || !Array.isArray(profile.skills)) return;
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      try {
        const updatedSkills = [...profile.skills, newSkill.trim()];
        await dispatch(updateSkills(updatedSkills));
        toast.success(`Skill "${newSkill.trim()}" added successfully!`, {
          position: "top-right",
          autoClose: 3000,
        });
        setNewSkill('');
      } catch (err) {
        toast.error('Failed to add skill. Please try again.', {
          position: "top-right",
          autoClose: 3456,
        });
      }
    }
  };

  const handleRemoveSkill = async (skillToRemove) => {
    if (!profile || !Array.isArray(profile.skills)) return;
    try {
      const updatedSkills = profile.skills.filter(skill => skill !== skillToRemove);
      await dispatch(updateSkills(updatedSkills));
      toast.success(`Skill "${skillToRemove}" removed successfully!`, {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (err) {
      toast.error('Failed to remove skill. Please try again.', {
        position: "top-right",
        autoClose: 3456,
      });
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto mt-8">
        <div className="bg-red-100 text-red-700 px-4 py-3 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950 dark:to-indigo-900 px-2 md:px-8 py-8 overflow-y-auto">
      <div className="w-full max-w-5xl min-h-[400px] lg:h-[500px] flex flex-col lg:flex-row items-center justify-center gap-10 bg-white/80 dark:bg-indigo-900/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-indigo-100 dark:border-indigo-800 p-4 md:p-10 lg:p-14 mx-auto transition-all duration-300">
        {/* Avatar Section */}
        <div className="flex flex-col items-center justify-center lg:w-1/3 w-full mb-6 lg:mb-0">
          <div className="relative group bg-white/30 dark:bg-indigo-800/60 backdrop-blur-lg rounded-full shadow-xl border-4 border-indigo-200 dark:border-indigo-700 p-2 mb-4">
            <img
              src={profile?.photo || '/logo.svg'}
              alt="Profile"
              className="w-36 h-36 lg:w-44 lg:h-44 rounded-full object-cover shadow-lg"
            />
            {editMode && (
              <div className="absolute bottom-2 right-2 bg-white rounded-full shadow p-1 cursor-pointer group-hover:bg-indigo-100 transition">
                <FileUpload
                  multiple={false}
                  accept="image/*"
                  onUploadComplete={handleImageUpload}
                  disabled={uploadingImage}
                  icon={<HiOutlineCamera className="w-5 h-5 text-indigo-600" />}
                  isProfilePhoto={true}
                />
              </div>
            )}
            {uploadingImage && <div className="absolute inset-0 flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" /></div>}
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2 mb-0">
                <HiOutlineUser className="w-6 h-6 text-indigo-400" /> {profile?.name}
              </h2>
              <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 rounded-lg text-sm font-semibold h-8">
                <HiOutlineBadgeCheck className="w-4 h-4" />
                {user?.role}
              </span>
            </div>
            {user?.role === 'freelancer' && (
              <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm font-semibold h-8">
                <span className="font-light text-green-600 text-md">₹</span>
                {profile?.hourlyRate?.toLocaleString('en-IN') || 0}/hr
              </span>
            )}
          </div>
        </div>
        {/* Form Section */}
        <div className="flex-1 w-full max-h-[350vh] flex flex-col justify-center">
          <div className="bg-white/70 dark:bg-indigo-950/80 backdrop-blur-lg rounded-2xl shadow-xl border border-indigo-100 dark:border-indigo-800 p-4 md:p-8 mt-2 max-h-[70vh] lg:max-h-[350px] transition-all duration-300">
            {editMode ? (
              <>
                {/* Blurred Backdrop */}
                <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-sm z-[100]" />
                {/* Modal */}
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                  <div className="w-full max-w-3xl min-h-[400px] pt-10 max-h-[90vh] bg-white dark:bg-indigo-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-indigo-800 overflow-hidden flex flex-col">
                    {/* Modal Header */}
                    <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 dark:from-indigo-900 dark:to-indigo-800 px-8 py-5">
                      <div className="flex items-center justify-between">
                        <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                          <HiOutlinePencil className="w-6 h-6" />
                          Edit Profile
                        </h3>
                        <button
                          onClick={() => setEditMode(false)}
                          className="text-white hover:text-gray-200 dark:hover:text-indigo-200 transition-colors p-1 rounded-full hover:bg-white/10 dark:hover:bg-indigo-800/40"
                        >
                          <HiOutlineX className="w-7 h-7" />
                        </button>
                      </div>
                    </div>
                    {/* Modal Content */}
                    <div className="flex-1 overflow-y-auto p-8">
                      <form onSubmit={formik.handleSubmit} className="space-y-7">
                        {/* Full Name */}
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineUser className="w-5 h-5 text-indigo-500" />
                            Full Name
                          </label>
                          <input
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-indigo-700 dark:bg-indigo-950 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-base transition-colors"
                            name="name"
                            value={formik.values.name}
                            onChange={formik.handleChange}
                            placeholder="Enter your full name"
                          />
                        </div>
                        {/* Role */}
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineBadgeCheck className="w-5 h-5 text-indigo-500" />
                            Role
                          </label>
                          <div className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-indigo-800 text-gray-700 dark:text-indigo-100 font-medium capitalize flex items-center gap-2 border border-gray-200 dark:border-indigo-700">
                            <span className="text-indigo-600 dark:text-indigo-300">{user?.role}</span>
                          </div>
                        </div>
                        {/* Hourly Rate */}
                        {user?.role === 'freelancer' && (
                          <div className="space-y-2">
                            <label className="text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                              <span className="font-light text-green-600 text-md">₹</span>
                              Hourly Rate
                            </label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                              <input
                                className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 dark:border-green-900 dark:bg-indigo-950 dark:text-white focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none text-base transition-colors"
                                name="hourlyRate"
                                type="number"
                                value={formik.values.hourlyRate}
                                onChange={formik.handleChange}
                                placeholder="0"
                                min={0}
                              />
                            </div>
                          </div>
                        )}
                        {/* About Section */}
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineInformationCircle className="w-5 h-5 text-indigo-500" />
                            About
                          </label>
                          <textarea
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-indigo-700 dark:bg-indigo-950 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none text-base transition-colors resize-none"
                            name="bio"
                            value={formik.values.bio}
                            onChange={formik.handleChange}
                            placeholder="Tell us about yourself, your experience, and what you're passionate about..."
                            rows={4}
                          />
                        </div>
                        {/* Skills Section */}
                        <div className="space-y-2">
                          <label className="text-base font-semibold text-gray-700 dark:text-indigo-100 flex items-center gap-2">
                            <HiOutlineTag className="w-5 h-5 text-indigo-500" />
                            Skills
                          </label>
                          <div className="flex items-center gap-2">
                            <Autocomplete
                              multiple
                              freeSolo
                              options={allSkills}
                              value={formik.values.skills || []}
                              inputValue={skillInput}
                              onInputChange={(event, newInputValue) => setSkillInput(newInputValue)}
                              onChange={(event, value) => formik.setFieldValue('skills', value)}
                              filterSelectedOptions
                              renderInput={(params) => (
                                <TextField
                                  {...params}
                                  placeholder="Search and add skills..."
                                  size="small"
                                  sx={{
                                    '& .MuiOutlinedInput-root': {
                                      borderRadius: '8px',
                                      '&:hover fieldset': { borderColor: '#6366f1' },
                                      '&.Mui-focused fieldset': { borderColor: '#6366f1' },
                                    },
                                  }}
                                />
                              )}
                              sx={{ flex: 1 }}
                            />
                            <button
                              type="button"
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-all flex items-center gap-1 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                              onClick={() => {
                                const trimmed = skillInput.trim();
                                if (
                                  trimmed &&
                                  !(formik.values.skills || []).includes(trimmed)
                                ) {
                                  formik.setFieldValue('skills', [...(formik.values.skills || []), trimmed]);
                                  setSkillInput('');
                                }
                              }}
                              disabled={!skillInput.trim() || (formik.values.skills || []).includes(skillInput.trim())}
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                    {/* Modal Footer */}
                    <div className="bg-gray-50 dark:bg-indigo-950 px-8 py-5 border-t border-gray-200 dark:border-indigo-800">
                      <div className="flex flex-col sm:flex-row gap-3 justify-end">
                        <button
                          className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-indigo-800 dark:hover:bg-indigo-700 dark:text-indigo-100 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                          onClick={() => setEditMode(false)}
                          type="button"
                        >
                          <HiOutlineX className="w-4 h-4" />
                          Cancel
                        </button>
                        <button
                          className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 dark:from-indigo-700 dark:to-indigo-900 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-md"
                          onClick={formik.handleSubmit}
                          type="button"
                        >
                          <HiOutlineCheck className="w-4 h-4" />
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-indigo-700 dark:text-white flex items-center gap-2">
                  <HiOutlineUser className="w-6 h-6 text-indigo-400" /> {profile?.name}
                </h2>
                <div className="flex items-center gap-2 mt-1 justify-center">
                  <span className="flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-700 dark:bg-indigo-800 dark:text-indigo-100 rounded-lg text-sm font-semibold h-8">
                    <HiOutlineBadgeCheck className="w-4 h-4" />
                    {user?.role}
                  </span>
                  {user?.role === 'freelancer' && (
                    <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded-lg text-sm font-semibold h-8">
                      <span className="font-light text-green-600 text-md">₹</span>
                      {profile?.hourlyRate?.toLocaleString('en-IN') || 0}/hr
                    </span>
                  )}
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    <HiOutlineInformationCircle className="w-5 h-5 text-indigo-400" /> About
                  </h3>
                  <p className="text-indigo-800 bg-indigo-50 rounded-lg p-4 min-h-[60px]">{profile?.bio || 'No bio provided.'}</p>
                </div>
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-indigo-700 mb-2 flex items-center gap-2">
                    <HiOutlineTag className="w-5 h-5 text-indigo-400" /> Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length > 0 ? (
                      profile.skills.map((skill) => (
                        <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium shadow-sm flex items-center gap-1">
                          <HiOutlineTag className="w-4 h-4" /> {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-indigo-400">No skills added</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-3 mt-6 w-full justify-end">
                  <button
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full shadow transition-all flex items-center gap-2"
                    onClick={() => setEditMode(true)}
                  >
                    <HiOutlinePencil className="w-5 h-5" /> Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;