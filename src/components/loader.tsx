export default function Loader() {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary animate-spin"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary/30 animate-spin" style={{ animationDirection: 'reverse' }}></div>
            </div>
          </div>
          <p className="text-xl font-semibold text-primary animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }
  