import Subscription from "../Models/subscription.models.js";
import { workflowClient } from "../config/upstash.js";

export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        // Make sure SERVER_URL is defined and includes http:// or https://
        const SERVER_URL = process.env.SERVER_URL || "http://localhost:3000";

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subscriptionId: subscription._id, // Use _id instead of id
            },
            headers: {
                'content-type': 'application/json',
            },
            retries: 0,
        });

        res.status(201).json({ success: true, data: subscription, workflowRunId });
    } catch(error) {
        next(error);
    }
}

export const getUsersSubscriptions = async (req, res, next) => {
    try {
        // Fixed logic: should be NOT equal to check if user is NOT the owner
        if(req.user._id.toString() !== req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 403; // Changed to 403 Forbidden
            return next(error);
        }

        const subscriptions = await Subscription.find({ user: req.params.id });
        res.status(200).json({ success: true, data: subscriptions });
    } catch(error) {
        next(error);
    }
}