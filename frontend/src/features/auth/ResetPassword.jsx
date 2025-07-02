import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Alert,
  Box,
  Container,
  CircularProgress
} from '@mui/material';
import { resetPassword } from '../../api/auth';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!token) {
        setError('Invalid reset token');
        toast.error('Invalid reset token. Please check your email link.', {
          position: "top-right",
          autoClose: 3456,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        return;
      }
      
      try {
        await resetPassword({ token, password: values.password });
        setSuccess(true);
        toast.success('Password reset successfully! You can now login with your new password.', {
          position: "top-right",
          autoClose: 3456,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Password reset failed';
        setError(errorMessage);
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3456,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
  });

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          mt: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {success ? (
          <>
            <Typography variant="h4" gutterBottom>Password Reset Success</Typography>
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              Your password has been successfully reset.
            </Alert>
            <Button
              fullWidth
              variant="contained"
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Sign In Now
            </Button>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>Reset Password</Typography>
            {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}

            {!token ? (
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                Invalid or missing reset token. Please make sure you're using the correct link from your email.
              </Alert>
            ) : (
              <>
                <Typography paragraph align="center">
                  Please enter your new password below.
                </Typography>
                <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    margin="normal"
                    name="password"
                    label="New Password"
                    type="password"
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={formik.touched.password && formik.errors.password}
                  />
                  <TextField
                    fullWidth
                    margin="normal"
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                  />
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={formik.isSubmitting}
                  >
                    {formik.isSubmitting ? <CircularProgress size={24} /> : 'Reset Password'}
                  </Button>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default ResetPassword;
