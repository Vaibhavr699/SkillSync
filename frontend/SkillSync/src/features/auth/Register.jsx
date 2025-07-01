import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useState } from 'react';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(state => state.auth);
  const [submitting, setSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'freelancer',
    },
    validationSchema: Yup.object({
      name: Yup.string().required('Name is required'),
      email: Yup.string().email('Invalid email address').required('Email is required'),
      password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
      confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password is required'),
      role: Yup.string().oneOf(['admin', 'company', 'freelancer'], 'Please select a valid role').required('Role is required'),
    }),
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        await dispatch(register({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role,
        })).unwrap();
        toast.success('Registration successful! Please check your email for verification.', {
          position: 'top-right',
          autoClose: 3456,
        });
        navigate('/login');
      } catch (err) {
        toast.error(err.message || 'Registration failed. Please try again.', {
          position: 'top-right',
          autoClose: 3456,
        });
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-14 mb-4" />
        <h2 className="text-3xl font-extrabold text-[#0a2a5c] mb-2">Create your SkillSync account</h2>
        <p className="text-blue-900/70 mb-6 text-center">
          Sign up to get started and unlock your productivity.
        </p>

        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
          <input
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-50 placeholder:text-blue-300"
            name="name"
            type="text"
            placeholder="Full Name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="name"
          />
          {formik.touched.name && formik.errors.name && (
            <span className="text-red-500 text-sm">{formik.errors.name}</span>
          )}

          <input
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-50 placeholder:text-blue-300"
            name="email"
            type="email"
            placeholder="Email address"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="email"
          />
          {formik.touched.email && formik.errors.email && (
            <span className="text-red-500 text-sm">{formik.errors.email}</span>
          )}

          <input
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-50 placeholder:text-blue-300"
            name="password"
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {formik.touched.password && formik.errors.password && (
            <span className="text-red-500 text-sm">{formik.errors.password}</span>
          )}

          <input
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-50 placeholder:text-blue-300"
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="new-password"
          />
          {formik.touched.confirmPassword && formik.errors.confirmPassword && (
            <span className="text-red-500 text-sm">{formik.errors.confirmPassword}</span>
          )}

          <select
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-50 text-blue-900"
            name="role"
            value={formik.values.role}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          >
            <option value="freelancer">Freelancer</option>
            <option value="company">Company</option>
            <option value="admin">Admin</option>
          </select>
          {formik.touched.role && formik.errors.role && (
            <span className="text-red-500 text-sm">{formik.errors.role}</span>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading || submitting}
          >
            {loading || submitting ? 'Signing up...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-blue-900/70 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-semibold transition-all">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
