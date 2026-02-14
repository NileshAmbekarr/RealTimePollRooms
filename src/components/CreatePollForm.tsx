"use client";

import { useState, useTransition } from "react";
import { createPoll } from "@/actions/createPoll";

export default function CreatePollForm() {
    const [question, setQuestion] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Client-side validation
        if (!question.trim()) {
            setError("Please enter a question.");
            return;
        }

        const opts = options.filter((o) => o.trim().length > 0);
        if (opts.length < 2) {
            setError("Please add at least 2 options.");
            return;
        }

        const uniqueOpts = new Set(opts.map((o) => o.toLowerCase().trim()));
        if (uniqueOpts.size !== opts.length) {
            setError("Options must be unique.");
            return;
        }

        // Build form data with filtered options
        const fd = new FormData();
        fd.set("question", question);
        opts.forEach((opt) => fd.append("options", opt));

        startTransition(async () => {
            const result = await createPoll(fd);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Question */}
            <div>
                <label
                    htmlFor="question"
                    className="block text-sm font-medium text-gray-300 mb-2"
                >
                    Your Question
                </label>
                <input
                    type="text"
                    id="question"
                    name="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="What would you like to ask?"
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                     text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                     focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                    maxLength={200}
                />
            </div>

            {/* Options */}
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Options
                </label>
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-500 text-sm font-mono w-6 text-right shrink-0">
                                {index + 1}.
                            </span>
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl 
                           text-white placeholder-gray-500 focus:outline-none focus:ring-2 
                           focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                                maxLength={100}
                            />
                            {options.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removeOption(index)}
                                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 
                             rounded-lg transition-all shrink-0"
                                    aria-label={`Remove option ${index + 1}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {options.length < 10 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-3 flex items-center gap-2 text-sm text-purple-400 
                       hover:text-purple-300 transition-colors"
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
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Option
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-6 bg-gradient-to-r from-purple-600 to-indigo-600 
                   hover:from-purple-500 hover:to-indigo-500 disabled:from-gray-600 
                   disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold 
                   rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/20 
                   hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg
                            className="animate-spin h-5 w-5"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                        </svg>
                        Creating Poll...
                    </span>
                ) : (
                    "Create Poll"
                )}
            </button>
        </form>
    );
}
