import CreatePollForm from "@/components/CreatePollForm";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Create a Poll
        </h1>
        <p className="text-[15px] text-text-secondary-light dark:text-text-secondary-dark">
          Complete the form below to launch your new poll. Keep questions clear
          and concise.
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full max-w-xl rounded-2xl p-6 md:p-8 border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
        <CreatePollForm />
      </div>
    </div>
  );
}
