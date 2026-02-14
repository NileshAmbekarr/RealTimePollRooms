"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { submitVote } from "@/actions/submitVote";
import ResultBar from "./ResultBar";

interface Option {
    id: string;
    text: string;
}

interface Vote {
    option_id: string;
}

interface PollViewProps {
    pollId: string;
    question: string;
    options: Option[];
    initialVotes: Vote[];
}

export default function PollView({
    pollId,
    question,
    options,
    initialVotes,
}: PollViewProps) {
    const [votes, setVotes] = useState<Vote[]>(initialVotes);
    const [hasVoted, setHasVoted] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [pendingOption, setPendingOption] = useState<string | null>(null);
    const [isVoting, setIsVoting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    // Check localStorage for existing vote
    useEffect(() => {
        const votedPolls = JSON.parse(
            localStorage.getItem("votedPolls") || "{}"
        );
        if (votedPolls[pollId]) {
            setHasVoted(true);
            setSelectedOption(votedPolls[pollId]);
        }
    }, [pollId]);

    // Subscribe to realtime vote changes
    useEffect(() => {
        const channel = supabase
            .channel(`poll-${pollId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "votes",
                    filter: `poll_id=eq.${pollId}`,
                },
                (payload) => {
                    const newVote = payload.new as Vote;
                    setVotes((prev) => [...prev, newVote]);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [pollId]);

    // Calculate vote counts
    const voteCounts = useCallback(() => {
        const counts: Record<string, number> = {};
        options.forEach((opt) => (counts[opt.id] = 0));
        votes.forEach((vote) => {
            if (counts[vote.option_id] !== undefined) {
                counts[vote.option_id]++;
            }
        });
        return counts;
    }, [votes, options]);

    const counts = voteCounts();
    const totalVotes = votes.length;

    const handleVote = async () => {
        if (hasVoted || isVoting || !pendingOption) return;

        setIsVoting(true);
        setError(null);

        try {
            const result = await submitVote(pollId, pendingOption);

            if (result.error) {
                setError(result.error);
                if (result.error.includes("already voted")) {
                    setHasVoted(true);
                    setSelectedOption(pendingOption);
                    const votedPolls = JSON.parse(
                        localStorage.getItem("votedPolls") || "{}"
                    );
                    votedPolls[pollId] = pendingOption;
                    localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
                }
            } else {
                setHasVoted(true);
                setSelectedOption(pendingOption);
                // Refetch votes from DB
                const { data: freshVotes } = await supabase
                    .from("votes")
                    .select("option_id")
                    .eq("poll_id", pollId);
                if (freshVotes) {
                    setVotes(freshVotes);
                }
                const votedPolls = JSON.parse(
                    localStorage.getItem("votedPolls") || "{}"
                );
                votedPolls[pollId] = pendingOption;
                localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
            }
        } catch {
            setError("Something went wrong. Please try again.");
        } finally {
            setIsVoting(false);
        }
    };

    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full max-w-xl mx-auto space-y-5">
            {/* Poll Card */}
            <div className="rounded-2xl p-6 md:p-8 border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-tight pr-4">
                        {question}
                    </h1>
                    {hasVoted && (
                        <span className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border text-success border-success-border bg-success-bg">
                            <span className="relative flex h-1.5 w-1.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                            </span>
                            LIVE RESULTS
                        </span>
                    )}
                </div>

                {/* Vote count */}
                <p className="text-sm mb-5 text-text-secondary-light dark:text-text-secondary-dark">
                    {totalVotes} total {totalVotes === 1 ? "vote" : "votes"}
                </p>

                {/* Success banner */}
                {hasVoted && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl mb-5 border bg-success-bg border-success-border">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <circle cx="12" cy="12" r="10" className="fill-success" />
                            <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                        <span className="text-sm text-success">
                            Thanks for voting! Your selection has been recorded.
                        </span>
                    </div>
                )}

                {/* Options / Results */}
                {!hasVoted ? (
                    <div className="space-y-3">
                        {options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => setPendingOption(option.id)}
                                disabled={isVoting}
                                className={`w-full text-left flex items-center gap-3 px-4 py-4 rounded-xl 
                           transition-all duration-200 border
                           ${pendingOption === option.id
                                        ? "bg-accent-glow border-accent"
                                        : "bg-input-light dark:bg-input-dark border-border-light dark:border-border-dark"
                                    }`}
                            >
                                {/* Radio circle */}
                                <div
                                    className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all
                    ${pendingOption === option.id
                                            ? "border-accent"
                                            : "border-text-muted-light dark:border-text-muted-dark"
                                        }`}
                                >
                                    {pendingOption === option.id && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-accent" />
                                    )}
                                </div>
                                <span className="text-gray-900 dark:text-white font-medium text-[15px]">
                                    {option.text}
                                </span>
                            </button>
                        ))}

                        {/* Vote Now button */}
                        <button
                            onClick={handleVote}
                            disabled={!pendingOption || isVoting}
                            className="w-full py-3.5 px-6 text-white font-semibold rounded-xl mt-2
                         transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed
                         hover:brightness-110 active:scale-[0.98]
                         bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/30
                         disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none"
                        >
                            {isVoting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Vote Now
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </span>
                            )}
                        </button>

                        <p className="text-center text-xs mt-2 text-text-muted-light dark:text-text-muted-dark">
                            Your vote is anonymous.
                        </p>
                    </div>
                ) : (
                    <div>
                        {options.map((option, index) => (
                            <ResultBar
                                key={option.id}
                                text={option.text}
                                votes={counts[option.id] || 0}
                                totalVotes={totalVotes}
                                isSelected={selectedOption === option.id}
                                index={index}
                            />
                        ))}
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-4 px-4 py-3 rounded-xl text-red-400 text-sm border bg-red-500/5 border-red-500/15">
                        {error}
                    </div>
                )}
            </div>

            {/* Share Section */}
            <div className="rounded-2xl p-5 border bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark">
                <div className="flex items-center gap-2 mb-3">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="stroke-accent" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Share this poll</span>
                </div>

                <div className="flex gap-2">
                    <div className="flex-1 flex items-center px-3.5 py-2.5 rounded-lg text-sm truncate border bg-input-light dark:bg-input-dark border-border-light dark:border-border-dark text-text-secondary-light dark:text-text-secondary-dark">
                        <span className="truncate">
                            {typeof window !== "undefined" ? window.location.href : `${pollId}`}
                        </span>
                    </div>
                    <button
                        onClick={copyLink}
                        className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border shrink-0
              ${copied
                                ? "text-success border-success-border bg-success-bg"
                                : "text-accent border-accent/30 bg-accent-glow"
                            }`}
                    >
                        {copied ? (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Copied!
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
