
import { supabase } from "@/lib/supabase/client";

export const PRICING = {
    website: 20,
    app: 40,
    video: 15,
    poster: 5
};

/**
 * Get current user credits & plan
 */
export async function getUserEconomy(userId) {
    if(!userId) return { credits: 0, plan: 'free' };
    
    // Check for monthly refill first (lazily)
    await checkAndRefillCredits(userId);

    const { data, error } = await supabase
        .from('profiles')
        .select('credits, plan_tier')
        .eq('id', userId)
        .single();
    
    if (error) {
        console.error("Error fetching credits:", error);
        return { credits: 0, plan: 'free' };
    }
    return { credits: data.credits ?? 0, plan: data.plan_tier ?? 'free' };
}

/**
 * Deduct credits for an action
 * Uses the 'deduct_credits' RPC function for atomicity
 */
export async function deductCredits(userId, amount, description) {
    const { data, error } = await supabase.rpc('deduct_credits', {
        p_user_id: userId,
        p_amount: amount,
        p_desc: description
    });

    if (error) {
        console.error("Transaction failed:", error);
        return false;
    }
    return data; // Returns true if successful, false if insufficient funds
}

/**
 * Refill credits if billing cycle has passed (30 days)
 * Calls the secure RPC function.
 */
export async function checkAndRefillCredits(userId) {
    const { data, error } = await supabase.rpc('refill_credits_if_needed', {
        p_user_id: userId
    });
    
    if (error) console.error("Refill check failed:", error);
    return data; // true if refilled, false if not
}

/**
 * Demo: Add 1000 credits
 */
export async function addDemoCredits(userId) {
    const { data, error } = await supabase.rpc('give_demo_credits', {
        p_user_id: userId
    });
    
    if (error) {
        console.error("Demo credits failed:", error);
        return false;
    }
    return true;
}
