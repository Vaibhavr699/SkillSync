import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchProjectById, editProject, removeProject,
  fetchApplications, updateApplication, applyForProject
} from '../../store/slices/projectSlice';
import FileViewer from '../files/FileViewer';
import CommentsSection from '../comments/CommentsSection';
import TaskBoard from "../../features/tasks/TaskBoard";
import { format } from 'date-fns';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { PencilSquareIcon, TrashIcon, UserPlusIcon, CurrencyRupeeIcon, CalendarDaysIcon, BuildingOffice2Icon, FolderOpenIcon, ShareIcon, PrinterIcon, ClipboardDocumentIcon, InformationCircleIcon, CheckCircleIcon, ClockIcon, TagIcon, ClipboardDocumentListIcon, UsersIcon } from '@heroicons/react/24/outline';
import AIAssistant from '../../features/ai/AIAssistant';
import ProjectAnalytics from './ProjectAnalytics';
import { Assignment } from '@heroicons/react/24/outline';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProject, loading, error } = useSelector(state => state.projects);
  const { user } = useSelector(state => state.auth);
  const [tabValue, setTabValue] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, applicationId: null, status: null });
  const [processingAppId, setProcessingAppId] = useState(null);
  const [showAI, setShowAI] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(projectId));
    if (user?.role === 'company') {
      dispatch(fetchApplications(projectId));
    }
    setTabValue('overview');
  }, [dispatch, projectId, user?.role]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);

  const handleEditSubmit = async (values) => {
    await dispatch(editProject({ projectId, projectData: values }));
    setEditMode(false);
  };

  const handleDeleteProject = async () => {
    await dispatch(removeProject(projectId));
    setDeleteDialogOpen(false);
    navigate('/dashboard/projects');
  };

  const handleApplicationStatus = async (applicationId, status) => {
    setProcessingAppId(applicationId);
    try {
      await dispatch(updateApplication({ projectId, applicationId, status }));
      toast.success(`Application ${status === 'accepted' ? 'accepted' : 'rejected'}!`);
    } catch {
      toast.error('Failed to update application');
    } finally {
      setProcessingAppId(null);
      setConfirmDialog({ open: false, applicationId: null, status: null });
    }
  };

  const handleApplySubmit = async (values) => {
    await dispatch(applyForProject({ projectId, proposal: values.proposal }));
    setApplyDialogOpen(false);
  };

  if (loading) return <div className="w-full flex justify-center items-center py-10"><span className="loader" /></div>;
  if (error) return <div className="text-red-600 text-center py-6">{error}</div>;
  if (!currentProject) return <div className="text-center py-6">Project not found</div>;

  const isOwner = user?.role === 'company' && user?._id === currentProject.company?._id;
  const hasApplied = currentProject.applications?.some(app => app.freelancer?._id === user?._id);
  const myApplication = currentProject.applications?.find(app => app.freelancer?._id === user?._id);

  return (
    <>
      <div className="p-4 md:p-8 max-w-5xl mt-10 mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mt-10 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            {currentProject.title}
            {isOwner && (
              <>
                <button onClick={() => setEditMode(!editMode)} className="ml-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition">
                  <PencilSquareIcon className="w-5 h-5" />
                </button>
                <button onClick={() => setDeleteDialogOpen(true)} className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-700 transition">
                  <TrashIcon className="w-5 h-5" />
                </button>
              </>
            )}
          </h1>
          {/* Only show apply button for freelancers who have not applied */}
          {user?.role === 'freelancer' && !hasApplied && (
            <button 
              className="flex items-center gap-2 px-6 py-2 bg-black text-white font-bold rounded-full shadow hover:bg-gray-800 transition"
              onClick={() => setApplyDialogOpen(true)}
            >
              <UserPlusIcon className="w-5 h-5" /> Apply to Project
            </button>
          )}
        </div>

        <div className="flex border-b border-gray-200 mb-6">
          {['overview', 'tasks', 'files', 'discussion', 'ai-assistant', 'analytics'].map(tab => (
            <button
              key={tab}
              className={`px-6 py-2 text-lg font-semibold capitalize transition border-b-2 -mb-px ${tabValue === tab ? 'border-black text-black bg-gray-100' : 'border-transparent text-gray-500 hover:text-black'}`}
              onClick={() => setTabValue(tab)}
            >
              {tab === 'ai-assistant' ? 'AI Assistant' : tab === 'analytics' ? 'Analytics' : tab}
            </button>
          ))}
          {isOwner && (
            <button
              className={`px-6 py-2 text-lg font-semibold capitalize transition border-b-2 -mb-px ${tabValue === 'applications' ? 'border-black text-black bg-gray-100' : 'border-transparent text-gray-500 hover:text-black'}`}
              onClick={() => setTabValue('applications')}
            >
              Applications
            </button>
          )}
        </div>

        {/* RENDER TAB CONTENT */}
        {tabValue === 'overview' && (
          <div className="w-full max-w-5xl mx-auto bg-white rounded-3xl shadow-lg border-l-8 border-indigo-500 border-t border-r border-b border-gray-200 mb-8 overflow-hidden">
            {/* Project Overview Section */}
            <div className="p-8 flex flex-col gap-8">
              {/* Header: Icon, Title, Status */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="bg-indigo-100 rounded-full p-3 flex items-center justify-center">
                    <FolderOpenIcon className="w-8 h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-1 flex items-center gap-2">
                      {currentProject.title}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow
                        ${currentProject.status === 'open' ? 'bg-blue-100 text-blue-700' :
                          currentProject.status === 'in progress' ? 'bg-yellow-100 text-yellow-700' :
                          currentProject.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'}`}
                      >
                        {currentProject.status === 'open' && <ClockIcon className="w-4 h-4" />}
                        {currentProject.status === 'in progress' && <ClipboardDocumentListIcon className="w-4 h-4" />}
                        {currentProject.status === 'completed' && <CheckCircleIcon className="w-4 h-4" />}
                        {currentProject.status ? currentProject.status.charAt(0).toUpperCase() + currentProject.status.slice(1) : 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Apply button for freelancers in overview section */}
                {user?.role === 'freelancer' && !hasApplied && (
                  <button
                    className="flex items-center gap-2 px-6 py-2 bg-black text-white font-bold rounded-full shadow hover:bg-gray-800 transition"
                    onClick={() => setApplyDialogOpen(true)}
                  >
                    <UserPlusIcon className="w-5 h-5" /> Apply to Project
                  </button>
                )}
              </div>
              {/* Meta Info Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center" title="Project Budget">
                  <CurrencyRupeeIcon className="w-6 h-6 text-indigo-600 mb-1" />
                  <div className="font-bold text-indigo-800 text-lg">₹{currentProject.budget?.toLocaleString('en-IN') || '0'}</div>
                  <div className="text-xs text-gray-500">Budget</div>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 flex flex-col items-center" title="Project Deadline">
                  <CalendarDaysIcon className="w-6 h-6 text-purple-600 mb-1" />
                  <div className="font-bold text-purple-800 text-lg">{format(new Date(currentProject.deadline), 'MMM dd, yyyy')}</div>
                  <div className="text-xs text-gray-500">Deadline</div>
                </div>
                <div className="bg-emerald-50 rounded-xl p-4 flex flex-col items-center" title="Posted By">
                  <BuildingOffice2Icon className="w-6 h-6 text-emerald-600 mb-1" />
                  <div className="font-bold text-emerald-800 text-lg">{currentProject.company?.name || 'Unknown Company'}</div>
                  <div className="text-xs text-gray-500">Company</div>
                </div>
                <div className="bg-pink-50 rounded-xl p-4 flex flex-col items-center" title="Project Tags">
                  <TagIcon className="w-6 h-6 text-pink-600 mb-1" />
                  <div className="flex flex-wrap gap-1 mt-1 justify-center">
                    {currentProject.tags?.length > 0 ? (
                      currentProject.tags.map(tag => (
                        <span key={tag} className="bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1"><TagIcon className="w-3 h-3" />{tag}</span>
                      ))
                    ) : (
                      <span className="text-gray-400">No tags</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Tags</div>
                </div>
              </div>
              {/* Extra Stats Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="bg-yellow-50 rounded-xl p-4 flex flex-col items-center" title="Applications">
                  <UsersIcon className="w-6 h-6 text-yellow-600 mb-1" />
                  <div className="font-bold text-yellow-800 text-lg">{currentProject.applications?.length || 0}</div>
                  <div className="text-xs text-gray-500">Applications</div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center" title="Completed Tasks">
                  <CheckCircleIcon className="w-6 h-6 text-green-600 mb-1" />
                  <div className="font-bold text-green-800 text-lg">{currentProject.completedTasks || 0}</div>
                  <div className="text-xs text-gray-500">Completed Tasks</div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center" title="Completion">
                  <ClipboardDocumentListIcon className="w-6 h-6 text-indigo-600 mb-1" />
                  <div className="font-bold text-indigo-800 text-lg">{currentProject.completion || 0}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                </div>
              </div>
              {/* Description Section */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <InformationCircleIcon className="w-5 h-5 text-blue-400" />
                  <span className="text-lg font-semibold text-gray-800">Description</span>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-700 text-base leading-relaxed shadow-inner">
                  {currentProject.description}
                </div>
              </div>
              {/* Project Workflow */}
              <div>
                <div className="text-xs text-gray-500 mb-1">Project Workflow</div>
                <div className="flex items-center gap-4">
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex flex-col items-center gap-1">
                      <ClockIcon className={`w-5 h-5 ${currentProject.status === 'open' ? 'text-blue-500' : 'text-gray-300'}`} />
                      <div className={`h-2 w-24 rounded-full ${currentProject.status === 'open' ? 'bg-blue-400' : 'bg-blue-200'}`}></div>
                      <span className={`text-xs font-semibold ${currentProject.status === 'open' ? 'text-blue-700' : 'text-gray-400'}`}>Open</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ClipboardDocumentListIcon className={`w-5 h-5 ${currentProject.status === 'in progress' ? 'text-yellow-500' : 'text-gray-300'}`} />
                      <div className={`h-2 w-24 rounded-full ${currentProject.status === 'in progress' ? 'bg-yellow-400' : 'bg-yellow-200'}`}></div>
                      <span className={`text-xs font-semibold ${currentProject.status === 'in progress' ? 'text-yellow-700' : 'text-gray-400'}`}>In Progress</span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <CheckCircleIcon className={`w-5 h-5 ${currentProject.status === 'completed' ? 'text-green-500' : 'text-gray-300'}`} />
                      <div className={`h-2 w-24 rounded-full ${currentProject.status === 'completed' ? 'bg-green-400' : 'bg-green-200'}`}></div>
                      <span className={`text-xs font-semibold ${currentProject.status === 'completed' ? 'text-green-700' : 'text-gray-400'}`}>Completed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Analytics Section */}
            <div className="px-8 pb-8">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Project Analytics</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                <div className="bg-indigo-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="text-2xl font-bold text-indigo-700">{currentProject.completion || 0}%</div>
                  <div className="text-xs text-gray-500">Completion</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${currentProject.completion || 0}%` }}></div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="text-2xl font-bold text-green-700">{currentProject.completedTasks || 0}</div>
                  <div className="text-xs text-gray-500">Completed Tasks</div>
                </div>
                <div className="bg-yellow-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="text-2xl font-bold text-yellow-700">{currentProject.applications?.length || 0}</div>
                  <div className="text-xs text-gray-500">Applications</div>
                </div>
                <div className="bg-pink-50 rounded-xl p-4 flex flex-col items-center">
                  <div className="text-2xl font-bold text-pink-700">{currentProject.daysLeft || 0}</div>
                  <div className="text-xs text-gray-500">Days Left</div>
                </div>
              </div>
            </div>
            {/* Project Files Section */}
            <div className="p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Attached Files</h3>
              {Array.isArray(currentProject.files) && currentProject.files.length > 0 ? (
                <ul className="divide-y divide-gray-200 rounded-xl border border-gray-100 bg-gray-50">
                  {currentProject.files.map((file, idx) => (
                    <li key={file.id || file._id || idx} className="flex items-center gap-4 p-4 hover:bg-gray-100 transition">
                      <div className="w-16 h-16 flex items-center justify-center bg-white rounded-lg border border-gray-200 overflow-hidden">
                        {file.type && file.type.startsWith('image') ? (
                          <img src={file.url} alt={file.name} className="object-cover w-full h-full" />
                        ) : file.type && file.type === 'application/pdf' ? (
                          <FileViewer url={file.url} type="pdf" className="w-full h-full" />
                        ) : file.type && file.type.startsWith('audio') ? (
                          <audio controls className="w-full h-8">
                            <source src={file.url} type={file.type} />
                            Your browser does not support the audio element.
                          </audio>
                        ) : file.type && file.type.startsWith('video') ? (
                          <video controls className="w-full h-full">
                            <source src={file.url} type={file.type} />
                            Your browser does not support the video tag.
                          </video>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{file.name}</div>
                        <div className="text-xs text-gray-500 truncate">{file.type || 'Unknown type'}</div>
                      </div>
                      <a
                        href={file.url}
                        download={file.name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold text-sm shadow hover:from-indigo-600 hover:to-purple-700 transition"
                      >
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-500 italic">No files uploaded for this project.</div>
              )}
            </div>
            {/* Comments Section */}
            <div className="p-8 border-t border-gray-100">
              <h3 className="text-xl font-bold text-indigo-800 mb-4">Comments</h3>
              <CommentsSection resourceType="project" resourceId={projectId} />
            </div>
          </div>
        )}
        {tabValue === 'tasks' && <TaskBoard projectId={projectId} />}
        {tabValue === 'files' && <FileViewer files={currentProject.attachments} resourceType="projects" resourceId={projectId} />}
        {tabValue === 'discussion' && <CommentsSection resourceType="project" resourceId={projectId} />}
        {tabValue === 'ai-assistant' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <AIAssistant />
          </div>
        )}
        {tabValue === 'analytics' && (
          <div className="bg-white rounded-2xl shadow p-6">
            <ProjectAnalytics project={currentProject} />
          </div>
        )}
        {tabValue === 'applications' && isOwner && <ApplicationsTab applications={currentProject.applications} handleApplicationStatus={handleApplicationStatus} setConfirmDialog={setConfirmDialog} processingAppId={processingAppId} />}
      </div>

      {/* Apply Dialog - only for freelancers */}
      {user?.role === 'freelancer' && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/30 ${applyDialogOpen ? '' : 'hidden'}`}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="text-xl font-bold mb-4">Apply to Project</div>
            <Formik
              initialValues={{ coverLetter: '', proposedBudget: '', estimatedDuration: '', relevantExperience: '' }}
              validationSchema={Yup.object({
                coverLetter: Yup.string().required('Cover letter/proposal is required'),
                proposedBudget: Yup.number().min(1, 'Budget must be at least ₹1').optional(),
                estimatedDuration: Yup.string().optional(),
                relevantExperience: Yup.string().optional(),
              })}
              onSubmit={async (values, { setSubmitting, resetForm }) => {
                try {
                  await dispatch(applyForProject({
                    projectId,
                    coverLetter: values.coverLetter,
                    proposedBudget: values.proposedBudget,
                    estimatedDuration: values.estimatedDuration,
                    relevantExperience: values.relevantExperience
                  }));
                  toast.success('Application submitted!');
                  resetForm();
                  setApplyDialogOpen(false);
                } catch (err) {
                  toast.error('Failed to submit application');
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form>
                  <Field
                    as={Field}
                    name="coverLetter"
                    label="Cover Letter/Proposal"
                    component="textarea"
                    rows={6}
                    className="w-full border border-indigo-200 rounded-lg p-2 mb-4"
                  />
                  <Field
                    as={Field}
                    name="proposedBudget"
                    label="Proposed Budget (₹)"
                    type="number"
                    className="w-full border border-indigo-200 rounded-lg p-2 mb-4"
                  />
                  <Field
                    as={Field}
                    name="estimatedDuration"
                    label="Estimated Duration"
                    className="w-full border border-indigo-200 rounded-lg p-2 mb-4"
                  />
                  <Field
                    as={Field}
                    name="relevantExperience"
                    label="Relevant Experience"
                    component="textarea"
                    rows={3}
                    className="w-full border border-indigo-200 rounded-lg p-2 mb-4"
                  />
                  <div className="flex justify-end gap-2 mt-4">
                    <button type="button" className="px-4 py-2 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold" onClick={() => setApplyDialogOpen(false)}>Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold" disabled={isSubmitting || hasApplied}>Submit Application</button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectDetail;
