import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from '@/slices/authSlice';
import { Loader2 } from 'lucide-react';

export const AuthSuccess = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

    useEffect(() => {
        const handleAuthSuccess = async () => {
            try {
                // Get token from URL hash (format: #token=<JWT>)
                const hash = window.location.hash.substring(1);
                const params = new URLSearchParams(hash);
                const token = params.get('token');

                if (!token) {
                    console.error('No token found in URL');
                    setStatus('error');
                    setTimeout(() => navigate('/login'), 2000);
                    return;
                }

                // Store token in localStorage
                localStorage.setItem('token', token);

                // Update Redux store
                dispatch(setToken(token));

                setStatus('success');

                // Redirect to home page after a brief delay
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } catch (error) {
                console.error('Error processing authentication:', error);
                setStatus('error');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleAuthSuccess();
    }, [navigate, dispatch]);

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="mx-auto w-full max-w-md rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
                <div className="space-y-6 text-center">
                    {status === 'processing' && (
                        <>
                            <div className="flex justify-center">
                                <Loader2 className="h-12 w-12 animate-spin text-white/60" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extralight text-white">
                                    Authenticating...
                                </h2>
                                <p className="text-sm text-white/60">
                                    Please wait while we sign you in
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
                                    <svg
                                        className="h-6 w-6 text-green-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extralight text-white">
                                    Success!
                                </h2>
                                <p className="text-sm text-white/60">
                                    Redirecting you to your feed...
                                </p>
                            </div>
                        </>
                    )}

                    {status === 'error' && (
                        <>
                            <div className="flex justify-center">
                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20">
                                    <svg
                                        className="h-6 w-6 text-red-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-2xl font-extralight text-white">
                                    Authentication Failed
                                </h2>
                                <p className="text-sm text-white/60">
                                    Redirecting you back to login...
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
