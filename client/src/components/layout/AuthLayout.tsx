import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-gradient-to-b from-background via-background/95 to-black px-4 py-16 text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        aria-hidden
      >
        <div
          className="absolute left-1/2 top-[-20%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full blur-[220px]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.12), transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-5%] h-[24rem] w-[24rem] rounded-full blur-[180px]"
          style={{ background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 60%)" }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_55%)]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-[80svh] max-w-2xl flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-5">
          <p className="text-xs uppercase tracking-[0.6em] text-white/40">Access Portal</p>
          <h1 className="text-3xl font-extralight leading-tight text-white">
            Step inside the stream.
          </h1>
        </div>

        <div className="w-full max-w-lg">
          {children}
        </div>
      </div>
    </section>
  );
};
