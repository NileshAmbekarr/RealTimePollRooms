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
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Poll Question */}
            <div>
                <label htmlFor="question" className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Poll Question <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                    <textarea
                        id="question"
                        name="question"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value.slice(0, 200))}
                        placeholder="What is your favorite programming language?"
                        rows={3}
                        className="w-full px-4 py-3.5 rounded-xl resize-none text-gray-900 dark:text-white 
                       placeholder-text-muted-light dark:placeholder-text-muted-dark 
                       bg-input-light dark:bg-input-dark border border-border-light dark:border-border-dark
                       focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-border-hover-light dark:focus:border-border-hover-dark 
                       transition-all text-[15px]"
                    />
                    <span className="absolute bottom-3 right-3 text-xs text-text-muted-light dark:text-text-muted-dark">
                        {question.length}/200
                    </span>
                </div>
            </div>

            {/* Poll Options */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white">
                        Poll Options
                    </label>
                    <span className="text-xs font-medium tracking-wider text-text-muted-light dark:text-text-muted-dark">
                        MINIMUM 2 OPTIONS
                    </span>
                </div>
                <div className="space-y-3">
                    {options.map((option, index) => (
                        <div key={index} className="group relative">
                            <div
                                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all 
                  bg-input-light dark:bg-input-dark border 
                  ${option ? "border-border-hover-light dark:border-border-hover-dark" : "border-border-light dark:border-border-dark"}`}
                            >
                                {/* Radio circle */}
                                <div className="w-5 h-5 rounded-full border-2 shrink-0 border-text-muted-light dark:border-text-muted-dark" />
                                <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={index < 2 ? `Option ${index + 1}` : "Type an option..."}
                                    className="flex-1 bg-transparent text-gray-900 dark:text-white 
                             placeholder-text-muted-light dark:placeholder-text-muted-dark 
                             focus:outline-none text-[15px]"
                                    maxLength={100}
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="opacity-0 group-hover:opacity-100 p-1 rounded-md transition-all shrink-0
                               text-text-muted-light dark:text-text-muted-dark hover:text-red-500"
                                        aria-label={`Remove option ${index + 1}`}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <line x1="18" y1="6" x2="6" y2="18" />
                                            <line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {options.length < 10 && (
                    <button
                        type="button"
                        onClick={addOption}
                        className="mt-3 flex items-center gap-2 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="16" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                        Add another option
                    </button>
                )}
            </div>

            {/* Error */}
            {error && (
                <div className="px-4 py-3 rounded-xl text-red-400 text-sm border bg-red-500/5 border-red-500/15">
                    {error}
                </div>
            )}

            {/* Submit */}
            <button
                type="submit"
                disabled={isPending}
                className="w-full py-3.5 px-6 text-white font-semibold rounded-xl 
                   transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                   hover:brightness-110 active:scale-[0.98]
                   bg-gradient-to-r from-accent to-accent-hover shadow-lg shadow-accent/30
                   disabled:from-gray-500 disabled:to-gray-500 disabled:shadow-none"
            >
                {isPending ? (
                    <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Creating Poll...
                    </span>
                ) : (
                    <span className="flex items-center justify-center gap-2">
                        Create Poll
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                        </svg>
                    </span>
                )}
            </button>
        </form>
    );
}
