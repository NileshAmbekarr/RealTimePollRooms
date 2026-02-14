"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export async function createPoll(formData: FormData) {
    const question = formData.get("question") as string;
    const optionsRaw = formData.getAll("options") as string[];

    // Validate question
    if (!question || question.trim().length === 0) {
        return { error: "Question is required." };
    }

    // Filter out empty options and trim
    const options = optionsRaw
        .map((o) => o.trim())
        .filter((o) => o.length > 0);

    // Validate minimum 2 options
    if (options.length < 2) {
        return { error: "At least 2 options are required." };
    }

    // Validate no duplicate options
    const uniqueOptions = new Set(options.map((o) => o.toLowerCase()));
    if (uniqueOptions.size !== options.length) {
        return { error: "Options must be unique." };
    }

    const supabase = createServerSupabaseClient();

    // Insert poll
    const { data: poll, error: pollError } = await supabase
        .from("polls")
        .insert({ question: question.trim() })
        .select("id")
        .single();

    if (pollError || !poll) {
        return { error: "Failed to create poll. Please try again." };
    }

    // Insert options
    const optionRows = options.map((text) => ({
        poll_id: poll.id,
        text,
    }));

    const { error: optionsError } = await supabase
        .from("options")
        .insert(optionRows);

    if (optionsError) {
        return { error: "Failed to create poll options. Please try again." };
    }

    redirect(`/poll/${poll.id}`);
}
