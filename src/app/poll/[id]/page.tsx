import { createServerSupabaseClient } from "@/lib/supabase-server";
import PollView from "@/components/PollView";
import Link from "next/link";

interface PollPageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PollPageProps) {
    const { id } = await params;
    const supabase = createServerSupabaseClient();
    const { data: poll } = await supabase
        .from("polls")
        .select("question")
        .eq("id", id)
        .single();

    return {
        title: poll ? `${poll.question} | Poll Rooms` : "Poll Not Found",
        description: poll
            ? `Vote on: ${poll.question}`
            : "This poll does not exist.",
    };
}

export default async function PollPage({ params }: PollPageProps) {
    const { id } = await params;
    const supabase = createServerSupabaseClient();

    // Fetch poll
    const { data: poll, error: pollError } = await supabase
        .from("polls")
        .select("id, question, created_at")
        .eq("id", id)
        .single();

    if (pollError || !poll) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-background-light dark:bg-background-dark">
                <div className="text-center">
                    {/* Ghost icon */}
                    <div className="mx-auto w-32 h-32 mb-6 relative">
                        <div className="w-full h-full rounded-full flex items-center justify-center bg-text-muted-dark/15">
                            <svg
                                width="60"
                                height="60"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-text-muted-dark"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 10h.01" />
                                <path d="M15 10h.01" />
                                <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
                            </svg>
                        </div>
                        {/* Search magnifier */}
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full flex items-center justify-center bg-card-dark border-2 border-border-dark">
                            <svg
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                className="stroke-accent"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                <line x1="8" y1="11" x2="14" y2="11" />
                            </svg>
                        </div>
                    </div>

                    <p className="text-6xl font-bold mb-3 text-text-muted-dark">
                        404
                    </p>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        Poll Not Found
                    </h1>
                    <p className="mb-8 max-w-sm mx-auto text-[15px] text-text-secondary-light dark:text-text-secondary-dark">
                        Oops! This poll doesn&apos;t exist or has been removed. It might
                        have expired or the link is incorrect.
                    </p>

                    <div className="flex items-center justify-center gap-3">
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-xl 
                         font-medium transition-all hover:brightness-110
                         bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/30"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="12" y1="8" x2="12" y2="16" />
                                <line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                            Create a New Poll
                        </Link>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium 
                         transition-all border text-text-secondary-light dark:text-text-secondary-dark 
                         border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark"
                        >
                            Go back Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Fetch options
    const { data: options } = await supabase
        .from("options")
        .select("id, text")
        .eq("poll_id", id)
        .order("id", { ascending: true });

    // Fetch initial votes
    const { data: votes } = await supabase
        .from("votes")
        .select("option_id")
        .eq("poll_id", id);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background-light dark:bg-background-dark">
            {/* Back link */}
            <div className="w-full max-w-xl mb-5">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm transition-colors text-text-muted-light dark:text-text-muted-dark hover:text-gray-900 dark:hover:text-white"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                    Create New Poll
                </Link>
            </div>

            <PollView
                pollId={poll.id}
                question={poll.question}
                options={options || []}
                initialVotes={votes || []}
            />
        </div>
    );
}
