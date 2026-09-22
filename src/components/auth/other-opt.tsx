import React from 'react'


function OtherOpt() {
    
    return (
        <div className="space-y-3">
            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path
                        fill="#4285F4"
                        d="M23.52 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.54 5.54 0 0 1-2.4 3.63v3h3.88c2.27-2.09 3.57-5.17 3.57-8.82z"
                    />
                    <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.96-1.07 7.95-2.91l-3.88-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.27v3.1A12 12 0 0 0 12 24z"
                    />
                    <path
                        fill="#FBBC05"
                        d="M5.27 14.28a7.2 7.2 0 0 1 0-4.56v-3.1H1.27a12 12 0 0 0 0 10.76z"
                    />
                    <path
                        fill="#EA4335"
                        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.27 6.62l4 3.1c.95-2.85 3.6-4.97 6.73-4.97z"
                    />
                </svg>
                Continue with Google
            </button>

            <button className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 py-2.5 text-sm font-semibold text-neutral-800 hover:bg-neutral-50">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-neutral-900">
                    <path d="M16.365 1.43c0 1.14-.462 2.09-1.234 2.868-.855.86-2.25 1.5-3.15 1.5-.117 0-.234-.02-.303-.03-.02-.117-.04-.293-.04-.47 0-1.11.51-2.14 1.29-2.85.78-.75 2.13-1.35 3.24-1.42.02.13.02.27.02.41zm4.5 16.06c-.43.99-.96 1.95-1.65 2.85-.93 1.24-1.62 2.1-2.79 2.1-1.02 0-1.35-.66-2.79-.66-1.47 0-1.92.66-2.85.68-1.14.04-2.01-1.34-2.94-2.58-1.62-2.19-2.91-6.21-1.2-9 .84-1.38 2.34-2.25 3.96-2.28 1.11-.02 2.16.75 2.85.75.66 0 1.95-.93 3.3-.79.57.02 2.16.23 3.18 1.74-.08.05-1.9 1.11-1.87 3.3.02 2.61 2.28 3.48 2.31 3.49-.02.06-.36 1.24-1.2 2.45h.66z" />
                </svg>
                Continue with Apple
            </button>
        </div>
    )
}

export default OtherOpt