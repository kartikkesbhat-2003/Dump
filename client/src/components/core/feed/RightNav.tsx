export const RightNav = () => {
  return (
    <aside className="fixed right-0 top-14 h-[calc(100vh-3.5rem)] w-72 z-40 hidden xl:flex flex-col">
      <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
        <div className="rounded-2xl bg-white/3 p-3">
          <h3 className="text-sm font-semibold mb-2 text-white">Community Tips</h3>
          <ul className="text-sm space-y-2 text-white/85">
            <li className="leading-tight">Be respectful — treat others courteously.</li>
            <li className="leading-tight">Keep posts focused and constructive.</li>
            <li className="leading-tight">Use clear titles and add context to your posts.</li>
          </ul>
          <div className="mt-3">
            <button className="w-full rounded-md bg-primary text-primary-foreground py-1 text-sm">Read Guidelines</button>
          </div>
        </div>

        <div className="rounded-2xl bg-white/3 p-3">
          <h3 className="text-sm font-semibold mb-2 text-white">Suggested</h3>
          <p className="text-xs text-white/70">People to follow and small community highlights will appear here.</p>
        </div>
      </div>
    </aside>
  );
};
