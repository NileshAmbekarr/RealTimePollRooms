interface ResultBarProps {
    text: string;
    votes: number;
    totalVotes: number;
    isSelected: boolean;
    index: number;
}

const COLORS = [
    "from-purple-500 to-indigo-500",
    "from-cyan-500 to-blue-500",
    "from-emerald-500 to-teal-500",
    "from-orange-500 to-amber-500",
    "from-pink-500 to-rose-500",
    "from-violet-500 to-purple-500",
    "from-lime-500 to-green-500",
    "from-red-500 to-orange-500",
    "from-sky-500 to-cyan-500",
    "from-fuchsia-500 to-pink-500",
];

export default function ResultBar({
    text,
    votes,
    totalVotes,
    isSelected,
    index,
}: ResultBarProps) {
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    const colorClass = COLORS[index % COLORS.length];

    return (
        <div
            className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${isSelected
                    ? "border-purple-500/50 bg-purple-500/5"
                    : "border-white/10 bg-white/[0.02]"
                }`}
        >
            {/* Background bar */}
            <div
                className={`absolute inset-0 bg-gradient-to-r ${colorClass} opacity-15 transition-all duration-700 ease-out`}
                style={{ width: `${percentage}%` }}
            />

            {/* Content */}
            <div className="relative px-4 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    {isSelected && (
                        <span className="shrink-0 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="12"
                                height="12"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </span>
                    )}
                    <span className="text-white font-medium truncate">{text}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-400">
                        {votes} {votes === 1 ? "vote" : "votes"}
                    </span>
                    <span
                        className={`text-sm font-semibold min-w-[3rem] text-right bg-gradient-to-r ${colorClass} bg-clip-text text-transparent`}
                    >
                        {percentage.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
