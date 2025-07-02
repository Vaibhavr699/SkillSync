import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  TextField,
  Button,
  Typography,
  Link,
  Alert,
  Box,
  Container,
  CircularProgress
} from '@mui/material';
import { forgotPassword } from '../../api/auth';
import { toast } from 'react-toastify';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPassword = () => {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const formik = useFormik({
    initialValues: {
      email: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await forgotPassword(values.email);
        setSuccess(true);
        toast.success('Password reset link has been sent to your email address!', {
          position: "top-right",
          autoClose: 3456,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to send reset link';
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
        <Typography variant="h4" gutterBottom>
          Forgot Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
            {error}
          </Alert>
        )}

        {success ? (
          <>
            <Alert severity="success" sx={{ mb: 2, width: '100%' }}>
              Password reset link has been sent to your email address.
            </Alert>
            <Typography align="center">
              Check your email and follow the instructions to reset your password.
            </Typography>
          </>
        ) : (
          <>
            <Typography paragraph align="center">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%' }}>
              <TextField
                fullWidth
                margin="normal"
                name="email"
                label="Email Address"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
              >
                {formik.isSubmitting ? <CircularProgress size={24} /> : 'Send Reset Link'}
              </Button>
            </Box>
          </>
        )}

        <Box sx={{ textAlign: 'center' }}>
          <Link href="/login" variant="body2">
            Back to Sign In
          </Link>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
