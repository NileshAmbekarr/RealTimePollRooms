interface ResultBarProps {
    text: string;
    votes: number;
    totalVotes: number;
    isSelected: boolean;
    index: number;
}

const BAR_COLORS = [
    "#2563eb",
    "#6366f1",
    "#8b5cf6",
    "#06b6d4",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#ec4899",
    "#14b8a6",
    "#f97316",
];

export default function ResultBar({
    text,
    votes,
    totalVotes,
    isSelected,
    index,
}: ResultBarProps) {
    const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
    const color = BAR_COLORS[index % BAR_COLORS.length];

    return (
        <div className="py-4 border-b border-border-light dark:border-border-dark">
            {/* Option name + percentage */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {isSelected && (
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ borderLeft: `3px solid ${color}` }}
                        />
                    )}
                    <span className="text-gray-900 dark:text-white font-medium text-[15px]">
                        {text}
                    </span>
                    {isSelected && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="shrink-0">
                            <circle cx="12" cy="12" r="10" fill={color} />
                            <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                        </svg>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-gray-900 dark:text-white font-bold text-[15px]">
                        {percentage.toFixed(0)}%
                    </span>
                    <span className="text-sm text-text-muted-light dark:text-text-muted-dark">
                        ({votes} {votes === 1 ? "vote" : "votes"})
                    </span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 rounded-full overflow-hidden bg-input-light dark:bg-input-dark">
                <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                        width: `${Math.max(percentage, 1)}%`,
                        backgroundColor: color,
                        opacity: isSelected ? 1 : 0.6,
                    }}
                />
            </div>
        </div>
    );
}
