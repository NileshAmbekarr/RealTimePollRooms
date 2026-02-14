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
            <div className="min-h-screen flex flex-col items-center justify-center px-4">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔍</div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Poll Not Found
                    </h1>
                    <p className="text-gray-400 mb-6">
                        This poll doesn&apos;t exist or has been removed.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-500 
                       text-white rounded-xl transition-colors font-medium"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <line x1="19" y1="12" x2="5" y2="12" />
                            <polyline points="12 19 5 12 12 5" />
                        </svg>
                        Create a Poll
                    </Link>
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
        <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
            {/* Back link */}
            <div className="w-full max-w-2xl mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-300 transition-colors text-sm"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
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
