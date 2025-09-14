import dayjs from "dayjs";
import Subscription from "../Models/subscription.models.js";
import { createRequire } from 'module';
import { sendRemindEmail } from "../utils/send-email.js";
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');

const REMINDERS = [7, 5, 2, 1];

export const sendReminders = serve(async (context) => {
    const { subscriptionId } = context.requestPayload;
    const subscription = await fetchSubscription(context, subscriptionId);

    if (!subscription || subscription.status !== 'active') {
        console.log(`Subscription ${subscriptionId} not found or not active`);
        return;
    }

    const renewalDate = dayjs(subscription.renewalDate);

    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscriptionId}. Stopping workflow`);
        return;
    }

    // Send reminders before renewal
    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'days');

        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `${daysBefore} days before reminder`, reminderDate);
            await triggerReminder(context, `${daysBefore} days before renewal`, subscription);
        }
    }

    // Send final reminder on renewal day
    await sleepUntilReminder(context, 'Renewal day reminder', renewalDate);
    await triggerReminder(context, 'Renewal day reminder', subscription);

});

const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    });
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} at ${date.format('YYYY-MM-DD HH:mm:ss')}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} for subscription ${subscription._id}`);

        await sendRemindEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        });
    });
}