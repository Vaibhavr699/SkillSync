import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Container,
} from '@mui/material';
import { verifyEmail } from '../../api/auth';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const { token: paramToken } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const email = location.state?.email || '';

  useEffect(() => {
    const token = paramToken || searchParams.get('token');
    if (token) {
      const verify = async () => {
        try {
          await verifyEmail(token);
          setSuccess(true);
        } catch (err) {
          setError(err.response?.data?.message || 'Email verification failed');
        } finally {
          setLoading(false);
        }
      };
      verify();
    } else {
      setLoading(false);
    }
  }, [paramToken, searchParams]);

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : success ? (
          <>
            <Typography variant="h4" gutterBottom>Email Verified</Typography>
            <Typography paragraph>
              Your email has been successfully verified. You can now sign in to your account.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/login')}
              sx={{ mt: 2 }}
            >
              Go to Login
            </Button>
          </>
        ) : error ? (
          <>
            <Typography variant="h4" gutterBottom>Verification Failed</Typography>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Typography paragraph>
              Please try again or contact support if the problem persists.
            </Typography>
          </>
        ) : email ? (
          <>
            <Typography variant="h4" gutterBottom>Verify Your Email</Typography>
            <Typography paragraph>
              We've sent a verification link to <strong>{email}</strong>. Please check your email and click the link to verify your account.
            </Typography>
            <Typography paragraph>
              Didn't receive the email? Check your spam folder or request a new verification link.
            </Typography>
          </>
        ) : (
          <>
            <Typography variant="h4" gutterBottom>Invalid Verification Link</Typography>
            <Typography paragraph>
              The verification link is invalid or has expired. Please try registering again.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate('/register')}
              sx={{ mt: 2 }}
            >
              Go to Register
            </Button>
          </>
        )}
      </Box>
    </Container>
  );
};

export default VerifyEmail;
