import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getPublicUserProfile } from '../../api/users';
import { 
  HiOutlineBuildingOffice2, 
  HiOutlineAcademicCap, 
  HiOutlineShieldCheck, 
  HiOutlineUser, 
  HiOutlineSparkles, 
  HiOutlineLightBulb, 
  HiOutlineCalendar,
  HiOutlineStar,
  HiOutlineCheckCircle,
  HiOutlineChatBubbleLeft,
  HiOutlineDocumentText,
  HiOutlineEye,
  HiOutlineHeart,
  HiOutlineShare,
  HiOutlineTrophy,
  HiOutlineFire,
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlineUserGroup,
  HiOutlineEnvelope
} from 'react-icons/hi2';
import { useSelector } from 'react-redux';

export default function UserProfile() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useSelector(state => state.auth);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    
    getPublicUserProfile(userId)
      .then(res => {
        setProfile(res);
        setIsFollowing(res.social?.isFollowing || false);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching user profile:', error);
        setNotFound(true);
        setLoading(false);
      });
  }, [userId]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    // TODO: Implement follow/unfollow API call
  };

  const handleContact = () => {
    // TODO: Implement contact functionality
    console.log('Contact user:', profile.id);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${profile.name}'s Profile`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // TODO: Show toast notification
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'company': return <HiOutlineBuildingOffice2 className="w-5 h-5" />;
      case 'freelancer': return <HiOutlineAcademicCap className="w-5 h-5" />;
      case 'admin': return <HiOutlineShieldCheck className="w-5 h-5" />;
      default: return <HiOutlineUser className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'company': return 'from-blue-500 to-blue-600';
      case 'freelancer': return 'from-purple-500 to-purple-600';
      case 'admin': return 'from-red-500 to-red-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getSkillLevelColor = (level) => {
    switch (level) {
      case 'beginner': return 'bg-yellow-100 text-yellow-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-green-100 text-green-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center overflow-y-auto min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-indigo-950 dark:to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-indigo-950 dark:to-indigo-900">
        <div className="text-center">
          <div className="text-red-500 text-8xl mb-6">👤</div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">User Not Found</h2>
          <p className="text-gray-600 text-lg mb-8">The user you're looking for doesn't exist or their profile is private.</p>
          <button 
            onClick={() => navigate('/search')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Search for Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-indigo-950 dark:to-indigo-900">
      {/* Hero Section */}
      <div className="relative profile-hero h-64">
        <div className="absolute inset-0 bg-black/20 dark:bg-black/60"></div>
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-end h-full">
            <div className="flex items-end space-x-6">
              {/* Avatar */}
              <div className="relative group animate-fade-in-down">
                <img
                  src={profile?.photo || '/logo.svg'}
                  alt={profile?.name || 'User'}
                  className="w-32 h-32 rounded-full object-cover shadow-2xl border-4 border-white profile-avatar"
                  onError={(e) => {
                    e.target.src = '/logo.svg';
                  }}
                />
                {profile?.isVerified && (
                  <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1 animate-pulse">
                    <HiOutlineCheckCircle className="w-5 h-5" />
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full flex items-center justify-center animate-ping" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-4 border-white rounded-full flex items-center justify-center" />
              </div>
              
              {/* User Info */}
              <div className="text-white mb-4 animate-fade-in">
                <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
                  {profile?.name || 'Anonymous User'}
                  {getRoleIcon(profile?.role)}
                </h1>
                <div className="flex items-center gap-4 text-lg">
                  <span className="px-4 py-2 glass rounded-full capitalize font-semibold flex items-center gap-2">
                    {profile?.role || 'user'}
                  </span>
                  {profile?.hourlyRate && (
                    <span className="px-4 py-2 glass rounded-full font-semibold">
                      ₹{profile.hourlyRate.toLocaleString('en-IN')}/hr
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - full page scrollable */}
      <div className="max-w-6xl mx-auto px-4 -mt-16 relative z-10 pb-8 overflow-y-auto scrollbar-hide" style={{ maxHeight: 'calc(100vh - 10rem)' }}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Action Buttons */}
            <div className="bg-white dark:bg-indigo-900 rounded-2xl shadow-lg p-6 animate-fade-in-up animate-stagger-1">
              <div className="flex flex-col space-y-3">
                {currentUser?.id !== profile?.id && (
                  <>
                    <button
                      onClick={handleFollow}
                      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-colors btn-animate ${
                        isFollowing 
                          ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-indigo-800 dark:text-indigo-100 dark:hover:bg-indigo-700' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-700 dark:text-white dark:hover:bg-indigo-800'
                      }`}
                    >
                      <HiOutlineHeart className={`w-5 h-5 ${isFollowing ? 'text-red-500' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                    <button
                      onClick={handleContact}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors btn-animate"
                    >
                      <HiOutlineEnvelope className="w-5 h-5" />
                      Contact
                    </button>
                  </>
                )}
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors btn-animate"
                >
                  <HiOutlineShare className="w-5 h-5" />
                  Share Profile
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up animate-stagger-2">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineChartBar className="w-6 h-6 text-indigo-500" />
                Statistics
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Projects Created</span>
                  <span className="font-bold text-indigo-600">{profile?.stats?.projectsCreated || 0}</span>
                </div>
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Projects Completed</span>
                  <span className="font-bold text-green-600">{profile?.stats?.projectsCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-bold text-purple-600">{profile?.stats?.successRate || 0}%</span>
                </div>
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-bold text-blue-600">{profile?.stats?.tasksCompleted || 0}</span>
                </div>
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Comments Made</span>
                  <span className="font-bold text-orange-600">{profile?.stats?.commentsMade || 0}</span>
                </div>
              </div>
            </div>

            {/* Rating */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up animate-stagger-3">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineStar className="w-6 h-6 text-yellow-500" />
                Rating
              </h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2 stat-counter">{profile?.stats?.averageRating || 0}</div>
                <div className="flex justify-center mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <HiOutlineStar 
                      key={star}
                      className={`w-6 h-6 ${
                        star <= Math.floor(profile?.stats?.averageRating || 0) 
                          ? 'text-yellow-500 fill-current' 
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-gray-600">{profile?.stats?.totalReviews || 0} reviews</p>
              </div>
            </div>

            {/* Social Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in-up animate-stagger-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HiOutlineUserGroup className="w-6 h-6 text-purple-500" />
                Social
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Followers</span>
                  <span className="font-bold text-purple-600">{profile?.social?.followers || 0}</span>
                </div>
                <div className="flex justify-between items-center stat-counter">
                  <span className="text-gray-600">Following</span>
                  <span className="font-bold text-purple-600">{profile?.social?.following || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-lg animate-fade-in-up animate-stagger-5">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview', icon: HiOutlineEye },
                    { id: 'projects', label: 'Projects', icon: HiOutlineBriefcase },
                    { id: 'activity', label: 'Activity', icon: HiOutlineFire },
                    { id: 'skills', label: 'Skills', icon: HiOutlineLightBulb }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors tab-animate ${
                        activeTab === tab.id
                          ? 'border-indigo-500 text-indigo-600 active'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-6 animate-fade-in">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <HiOutlineSparkles className="w-6 h-6 text-indigo-500" />
                        About
                      </h3>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4 leading-relaxed">
                        {profile?.bio || 'No bio provided.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <HiOutlineCalendar className="w-6 h-6 text-green-500" />
                        Member Since
                      </h3>
                      <p className="text-gray-700">
                        {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Unknown'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Projects Tab */}
                {activeTab === 'projects' && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <HiOutlineBriefcase className="w-6 h-6 text-blue-500" />
                      Recent Projects
                    </h3>
                    {profile?.recentProjects && profile.recentProjects.length > 0 ? (
                      <div className="space-y-4">
                        {profile.recentProjects.map((project, index) => (
                          <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-semibold text-gray-900">{project.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                project.involvement_type === 'created' ? 'bg-blue-100 text-blue-800' :
                                project.involvement_type === 'participated' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {project.involvement_type}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-2">{project.description}</p>
                            <div className="flex justify-between items-center text-sm text-gray-500">
                              <span>₹{project.budget?.toLocaleString('en-IN') || 'N/A'}</span>
                              <span>{new Date(project.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No projects found</p>
                    )}
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <HiOutlineFire className="w-6 h-6 text-orange-500" />
                      Recent Activity
                    </h3>
                    {profile?.recentActivity && profile.recentActivity.length > 0 ? (
                      <div className="space-y-4">
                        {profile.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors card-hover animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className={`p-2 rounded-full ${
                              activity.type === 'comment' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                            }`}>
                              {activity.type === 'comment' ? (
                                <HiOutlineChatBubbleLeft className="w-4 h-4" />
                              ) : (
                                <HiOutlineDocumentText className="w-4 h-4" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-gray-900 text-sm">{activity.description}</p>
                              <p className="text-gray-500 text-xs mt-1">
                                {new Date(activity.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No recent activity</p>
                    )}
                  </div>
                )}

                {/* Skills Tab */}
                {activeTab === 'skills' && (
                  <div className="animate-fade-in">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <HiOutlineLightBulb className="w-6 h-6 text-yellow-500" />
                      Skills & Expertise
                    </h3>
                    {profile?.skills && profile.skills.length > 0 ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {profile.skills.map((skill, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg skill-tag animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                            <span className="font-medium text-gray-900">{skill.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                              {skill.level}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No skills added</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 