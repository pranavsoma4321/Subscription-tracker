import {emailTemplates} from "./email.template.js";
import dayjs from "dayjs";
import transporter , {accountEmail} from "../config/Nodemailer.js";

export const sendRemindEmail = async ({ to, type, subscription }) => {
    if(!to || !type) throw new Error('Missing required property "type"');

    const template = emailTemplates.find((t) => t.label === type);

    if(!template) throw new Error('Missing required property "template"');

    const mailInfo = {
        userName: subscription.user.name,
        subscriptionId: subscription.name,
        renewalDate: dayjs(subscription.renewalDate).format('YYYY-MM-DD HH:mm:ss'),
        planName: subscription.name,
        price: `${subscription.currency} ${subscription.price} (${subscription.frequency}`,
        paymentMethod: subscription.paymentMethod,
    }

    const message = template.generateBody(mailInfo);
    const subject = template.generateSubject(mailInfo.subject);

    const mailOptions = {
        from: accountEmail,
        to: to,
        subject: subject,
        html: message,
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) return console.log(error, 'Error sending Email');

        console.log('Email sent: ', info.response); // Fixed typo: 'responce' to 'response'
    });
}