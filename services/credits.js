const { supabase } = require('./supabase');

/**
 * Check if user has available credits
 * @param {string} userId - User's UUID
 * @returns {Promise<{hasCredits: boolean, subscription: object|null}>}
 */
async function checkUserCredits(userId) {
    try {
        // Get user's active subscription with remaining credits
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', userId)
            .eq('is_active', true)
            .gt('credits_remaining', 0)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        
        if (error) {
            if (error.code === 'PGRST116') {
                // No rows returned - user has no active subscription
                return { hasCredits: false, subscription: null };
            }
            throw error;
        }
        
        return { hasCredits: true, subscription: data };
    } catch (error) {
        console.error('Error checking user credits:', error);
        return { hasCredits: false, subscription: null };
    }
}

/**
 * Deduct one credit from user's subscription
 * @param {string} subscriptionId - Subscription UUID
 * @returns {Promise<object>} Updated subscription data
 */
async function deductCredit(subscriptionId) {
    try {
        // Get current subscription
        const { data: currentSub, error: fetchError } = await supabase
            .from('user_subscriptions')
            .select('credits_remaining')
            .eq('id', subscriptionId)
            .single();
        
        if (fetchError) throw fetchError;
        
        const newCredits = currentSub.credits_remaining - 1;
        
        // Update credits
        const { data, error } = await supabase
            .from('user_subscriptions')
            .update({ 
                credits_remaining: newCredits,
                updated_at: new Date().toISOString(),
                // Mark as inactive if credits reach 0
                is_active: newCredits > 0
            })
            .eq('id', subscriptionId)
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`✅ Credit deducted. Remaining: ${newCredits}`);
        
        return data;
    } catch (error) {
        console.error('Error deducting credit:', error);
        throw new Error('Failed to deduct credit');
    }
}

/**
 * Get user's subscription summary
 * @param {string} userId - User's UUID
 * @returns {Promise<object>} Subscription summary
 */
async function getUserSubscriptionSummary(userId) {
    try {
        const { data, error } = await supabase
            .from('user_subscriptions')
            .select('*, subscription_plans(*)')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Calculate total credits across all active subscriptions
        const totalCredits = data.reduce((sum, sub) => sum + sub.credits_remaining, 0);
        
        return {
            subscriptions: data,
            totalCredits,
            hasActiveSubscription: data.length > 0
        };
    } catch (error) {
        console.error('Error getting subscription summary:', error);
        return {
            subscriptions: [],
            totalCredits: 0,
            hasActiveSubscription: false
        };
    }
}

/**
 * Create a new subscription for user (after payment)
 * @param {string} userId - User's UUID
 * @param {string} planId - Plan UUID
 * @param {string} paymentId - Payment reference ID
 * @returns {Promise<object>} Created subscription
 */
async function createSubscription(userId, planId, paymentId = null) {
    try {
        // Get plan details
        const { data: plan, error: planError } = await supabase
            .from('subscription_plans')
            .select('*')
            .eq('id', planId)
            .single();
        
        if (planError) throw planError;
        
        // Create subscription
        const { data, error } = await supabase
            .from('user_subscriptions')
            .insert({
                user_id: userId,
                plan_id: planId,
                credits_remaining: plan.video_credits,
                credits_total: plan.video_credits,
                payment_id: paymentId,
                is_active: true
            })
            .select()
            .single();
        
        if (error) throw error;
        
        console.log(`✅ Subscription created: ${plan.name} (${plan.video_credits} credits)`);
        
        return data;
    } catch (error) {
        console.error('Error creating subscription:', error);
        throw new Error('Failed to create subscription');
    }
}

module.exports = {
    checkUserCredits,
    deductCredit,
    getUserSubscriptionSummary,
    createSubscription
};
