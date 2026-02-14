import CreatePollForm from "@/components/CreatePollForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full text-purple-400 text-xs font-medium mb-6">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
          </span>
          Real-Time Updates
        </div>
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent mb-4">
          Poll Rooms
        </h1>
        <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto">
          Create a poll in seconds. Share the link. Watch votes come in live.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-lg">
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
          <CreatePollForm />
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1.5">
            <div className="text-2xl">⚡</div>
            <p className="text-xs text-gray-500">Instant Setup</p>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl">🔗</div>
            <p className="text-xs text-gray-500">Shareable Link</p>
          </div>
          <div className="space-y-1.5">
            <div className="text-2xl">📊</div>
            <p className="text-xs text-gray-500">Live Results</p>
          </div>
        </div>
      </div>
    </div>
  );
}
