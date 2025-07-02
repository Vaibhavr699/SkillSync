import { useFormik } from "formik";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { login, setCredentials } from "../../store/slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useState } from "react";
import { getUserProfile } from '../../api/users';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const result = await dispatch(login(values)).unwrap();
        // Fetch full profile and update Redux
        const userId = result.user.id || result.user._id;
        const fullProfile = await getUserProfile(userId);
        dispatch(setCredentials({ user: fullProfile, token: result.accessToken }));
        toast.success("Login successful! Welcome back!", {
          position: "top-right",
          autoClose: 3000,
        });
        if (result.user.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      } catch (err) {
        toast.error(
          err.message || "Login failed. Please check your credentials.",
          {
            position: "top-right",
            autoClose: 3456,
          }
        );
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto bg-[url('/authbg.jpg')] bg-cover bg-center before:content-[''] before:fixed before:inset-0 before:bg-[#0a2a5c]/90 before:-z-10">
      <div className="w-full max-w-md bg-white/95 rounded-3xl shadow-2xl p-8 flex flex-col items-center">
        <img src="/logo.svg" alt="SkillSync Logo" className="w-14 h-14 mb-4" />
        <h2 className="text-3xl font-extrabold text-[#0a2a5c] mb-2">Sign in to SkillSync</h2>
        <p className="text-blue-900/70 mb-6 text-center">Welcome back! Please enter your details.</p>
        <form onSubmit={formik.handleSubmit} className="w-full flex flex-col gap-4">
          <input
            className="px-4 py-3 rounded-lg border border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 outline-none transition-all text-base bg-blue-50 placeholder:text-blue-300"
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
            className="px-4 py-3 rounded-lg border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-base bg-blue-150 placeholder:text-blue-300"
            name="password"
            type="password"
            placeholder="Password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            autoComplete="current-password"
          />
          {formik.touched.password && formik.errors.password && (
            <span className="text-red-500 text-sm">{formik.errors.password}</span>
          )}
          <div className="flex justify-end w-full mb-2">
            <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm transition-all">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all text-lg disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 text-blue-900/70 text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-500 hover:underline font-semibold transition-all">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
