const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

const sendSMS = async (to, message) => {
    try {
        await client.messages.create({
            body: message,
            from: fromPhone,
            to: to,
        });
        console.log(`SMS sent to ${to}`);
    } catch (error) {
        console.error(`Failed to send SMS to ${to}: ${error.message}`);
    }
};

module.exports = { sendSMS };