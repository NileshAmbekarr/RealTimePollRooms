"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { headers } from "next/headers";
import crypto from "crypto";

export async function submitVote(pollId: string, optionId: string) {
    if (!pollId || !optionId) {
        return { error: "Invalid vote submission." };
    }

    const supabase = createServerSupabaseClient();

    // Get client IP from headers
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    const realIp = headerList.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    // Hash the IP for privacy
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    // Verify poll and option exist
    const { data: option } = await supabase
        .from("options")
        .select("id, poll_id")
        .eq("id", optionId)
        .eq("poll_id", pollId)
        .single();

    if (!option) {
        return { error: "Invalid poll or option." };
    }

    // Insert vote (unique constraint on poll_id + ip_hash prevents duplicates)
    const { error: voteError } = await supabase.from("votes").insert({
        poll_id: pollId,
        option_id: optionId,
        ip_hash: ipHash,
    });

    if (voteError) {
        if (voteError.code === "23505") {
            // Unique constraint violation
            return { error: "You have already voted on this poll." };
        }
        return { error: "Failed to submit vote. Please try again." };
    }

    return { success: true };
}
