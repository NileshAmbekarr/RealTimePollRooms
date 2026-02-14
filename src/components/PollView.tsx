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

    const handleVote = async (optionId: string) => {
        if (hasVoted || isVoting) return;

        setIsVoting(true);
        setError(null);

        try {
            const result = await submitVote(pollId, optionId);

            if (result.error) {
                setError(result.error);
                // If already voted server-side, mark as voted locally too
                if (result.error.includes("already voted")) {
                    setHasVoted(true);
                    const votedPolls = JSON.parse(
                        localStorage.getItem("votedPolls") || "{}"
                    );
                    votedPolls[pollId] = optionId;
                    localStorage.setItem("votedPolls", JSON.stringify(votedPolls));
                }
            } else {
                setHasVoted(true);
                setSelectedOption(optionId);
                // Refetch votes from DB so voter sees accurate count
                const { data: freshVotes } = await supabase
                    .from("votes")
                    .select("option_id")
                    .eq("poll_id", pollId);
                if (freshVotes) {
                    setVotes(freshVotes);
                }
                // Save to localStorage
                const votedPolls = JSON.parse(
                    localStorage.getItem("votedPolls") || "{}"
                );
                votedPolls[pollId] = optionId;
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
        <div className="w-full max-w-2xl mx-auto">
            {/* Poll Card */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
                {/* Question */}
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    {question}
                </h1>
                <p className="text-gray-400 text-sm mb-6">
                    {totalVotes} {totalVotes === 1 ? "vote" : "votes"} •{" "}
                    {hasVoted ? "You voted" : "Select an option to vote"}
                </p>

                {/* Options / Results */}
                <div className="space-y-3">
                    {!hasVoted
                        ? // Voting mode
                        options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleVote(option.id)}
                                disabled={isVoting}
                                className="w-full text-left px-5 py-4 bg-white/5 border border-white/10 
                             rounded-xl text-white font-medium hover:bg-white/10 
                             hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/5 
                             disabled:opacity-50 disabled:cursor-not-allowed 
                             transition-all duration-200 active:scale-[0.98]"
                            >
                                {option.text}
                            </button>
                        ))
                        : // Results mode
                        options.map((option, index) => (
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

                {/* Error */}
                {error && (
                    <div className="mt-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                {/* Voted confirmation */}
                {hasVoted && (
                    <div className="mt-4 flex items-center gap-2 text-emerald-400 text-sm">
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
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                        Your vote has been recorded. Results update live.
                    </div>
                )}
            </div>

            {/* Share Section */}
            <div className="mt-6 flex items-center justify-center gap-3">
                <button
                    onClick={copyLink}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 
                     rounded-xl text-gray-300 hover:text-white hover:bg-white/10 
                     transition-all text-sm"
                >
                    {copied ? (
                        <>
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
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Copied!
                        </>
                    ) : (
                        <>
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
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                            </svg>
                            Share Poll Link
                        </>
                    )}
                </button>
            </div>

            {/* Live indicator */}
            <div className="mt-4 flex items-center justify-center gap-2 text-gray-500 text-xs">
                <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live updates enabled
            </div>
        </div>
    );
}
