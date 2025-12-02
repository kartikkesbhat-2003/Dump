import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

export const AuthError = () => {
    const navigate = useNavigate();
    const [errorReason, setErrorReason] = useState<string>('Unknown error occurred');

    useEffect(() => {
        // Get error reason from query params
        const params = new URLSearchParams(window.location.search);
        const reason = params.get('reason');

        if (reason) {
            // Decode and format the error message
            const decodedReason = decodeURIComponent(reason);
            setErrorReason(formatErrorMessage(decodedReason));
        }
    }, []);

    const formatErrorMessage = (reason: string): string => {
        // Convert error codes to user-friendly messages
        const errorMessages: Record<string, string> = {
            'oauth_error': 'There was an error with Google authentication',
            'no_user': 'Unable to retrieve user information from Google',
            'login_error': 'Failed to log you in',
            'jwt_error': 'Failed to generate authentication token',
            'unexpected_error': 'An unexpected error occurred',
        };

        return errorMessages[reason] || reason;
    };

    const handleRetry = () => {
        navigate('/login');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950">
            <div className="mx-auto w-full max-w-md rounded-[36px] border border-white/10 bg-white/[0.04] p-8 shadow-[0_25px_80px_rgba(0,0,0,0.65)] backdrop-blur-3xl">
                <div className="space-y-6 text-center">
                    {/* Error Icon */}
                    <div className="flex justify-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                            <AlertCircle className="h-8 w-8 text-red-400" />
                        </div>
                    </div>

                    {/* Error Message */}
                    <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.5em] text-white/35">
                            Authentication Failed
                        </p>
                        <h1 className="text-2xl font-extralight text-white">
                            Oops! Something went wrong
                        </h1>
                        <p className="text-sm text-white/60">
                            {errorReason}
                        </p>
                    </div>

                    {/* Error Details */}
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
                        <p className="text-xs text-red-300/80">
                            We couldn't complete your Google sign-in. This might be due to:
                        </p>
                        <ul className="mt-2 space-y-1 text-left text-xs text-red-300/60">
                            <li>• Cancelled sign-in process</li>
                            <li>• Network connectivity issues</li>
                            <li>• Temporary server error</li>
                        </ul>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Button
                            onClick={handleRetry}
                            className="h-11 w-full rounded-full bg-white text-black transition hover:bg-white/90"
                        >
                            Try Again
                        </Button>
                        <Button
                            onClick={handleGoHome}
                            variant="ghost"
                            className="h-11 w-full rounded-full border border-white/20 text-white hover:bg-white/5"
                        >
                            Go to Home
                        </Button>
                    </div>

                    {/* Support Link */}
                    <div className="pt-4 text-center">
                        <p className="text-xs text-white/40">
                            Still having issues?{' '}
                            <button
                                onClick={() => navigate('/help')}
                                className="text-white/60 hover:text-white hover:underline"
                            >
                                Contact Support
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
