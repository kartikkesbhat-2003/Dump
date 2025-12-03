import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setToken } from '@/slices/authSlice';
import { apiConnector } from '@/services/apiConnector';
import { authEndpoints } from '@/services/api';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

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

                // Fetch current user to check if username exists
                try {
                    const res = await apiConnector('GET', authEndpoints.GET_CURRENT_USER);
                    const user = res.data && res.data.user;
                    if (user && user.username) {
                        setStatus('success');
                        setTimeout(() => navigate('/'), 1500);
                        return;
                    }
                    // No username — prompt user to choose one
                    setStatus('processing');
                    // Show a prompt-like inline flow by switching local UI state below
                    setShowUsernameForm(true);
                } catch (err) {
                    // If fetching user failed, proceed to success path conservatively
                    console.error('Failed to fetch user after OAuth:', err);
                    setStatus('success');
                    setTimeout(() => navigate('/'), 1500);
                }
            } catch (error) {
                console.error('Error processing authentication:', error);
                setStatus('error');
                setTimeout(() => navigate('/login'), 2000);
            }
        };

        handleAuthSuccess();
    }, [navigate, dispatch]);

    // Username form state for OAuth users without username
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    const [chosenUsername, setChosenUsername] = useState('');
    const [settingUsername, setSettingUsername] = useState(false);
    const debouncedUsername = useDebouncedValue(chosenUsername, 500);
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState<boolean | null>(null);

    const submitUsername = async () => {
        if (!chosenUsername || chosenUsername.trim().length < 3) {
            toast.error('Username must be at least 3 characters');
            return;
        }
        if (isAvailable === false || isAvailable === null) {
            toast.error('Please choose an available username');
            return;
        }
        try {
            setSettingUsername(true);
            const payload = { username: chosenUsername.trim() };
            const base = import.meta.env.VITE_API_BASE_URL || '';
            const res = await apiConnector('POST', `${base}/auth/set-username`, payload);
            if (res.data && res.data.success) {
                toast.success('Username saved');
                // store user locally
                localStorage.setItem('user', JSON.stringify(res.data.user));
                setTimeout(() => navigate('/'), 800);
            } else {
                toast.error(res.data?.message || 'Failed to set username');
            }
        } catch (err: any) {
            console.error('Error setting username:', err);
            toast.error(err.response?.data?.message || 'Failed to set username');
        } finally {
            setSettingUsername(false);
        }
    };

    // Check availability while typing (debounced)
    useEffect(() => {
        let mounted = true;
        const check = async () => {
            const val = debouncedUsername?.trim();
            if (!val || val.length < 3 || !/^[a-zA-Z0-9._-]{3,32}$/.test(val)) {
                setIsAvailable(null);
                return;
            }
            setIsChecking(true);
            try {
                const res = await apiConnector('GET', authEndpoints.CHECK_USERNAME, null, null, { username: val });
                if (!mounted) return;
                setIsAvailable(!!res.data?.available);
            } catch (err) {
                console.error('Username availability check failed', err);
                setIsAvailable(null);
            } finally {
                setIsChecking(false);
            }
        };
        check();
        return () => { mounted = false; };
    }, [debouncedUsername]);

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
                    {showUsernameForm && (
                        <>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium text-white">Choose a dump handle</h3>
                                <p className="text-sm text-white/60 mt-1">Pick a unique username to represent you on Dump.</p>
                            </div>
                            <div className="mt-4">
                                <input
                                    type="text"
                                    value={chosenUsername}
                                    onChange={(e) => setChosenUsername(e.target.value)}
                                    placeholder="username"
                                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
                                />
                                <div className="mt-2 flex items-center justify-between">
                                    <div>
                                        {isChecking && <span className="text-xs text-white/50">Checking...</span>}
                                        {isAvailable === true && <span className="text-xs text-green-300">Available</span>}
                                        {isAvailable === false && <span className="text-xs text-red-300">Taken</span>}
                                    </div>
                                    <div>
                                        <button
                                            className="rounded-full bg-white px-6 py-2 text-black"
                                            onClick={submitUsername}
                                            disabled={settingUsername || isAvailable === false || isAvailable === null}
                                        >
                                            {settingUsername ? 'Saving...' : 'Save username'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
