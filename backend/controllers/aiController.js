const nodemailer = require('nodemailer');

let testAccount = null;
let transporter = null;

async function initMailer() {
    try {
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
            console.log('AI Mailer Initialized with Real SMTP (Gmail).');
        } else {
            testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: "smtp.ethereal.email",
                port: 587,
                secure: false, // true for 465, false for other ports
                auth: {
                    user: testAccount.user, // generated ethereal user
                    pass: testAccount.pass, // generated ethereal password
                },
            });
            console.log('AI Mailer Initialized with Ethereal (Test Mode). Add SMTP_USER and SMTP_PASS to .env for real emails.');
        }
    } catch (e) {
        console.error('Failed to init mailer', e);
    }
}
initMailer();

exports.handleChat = async (req, res) => {
    try {
        const { query, email } = req.body;
        const q = query.toLowerCase();

        let responseMsg = "I am the Reboot AI! I can help you navigate the platform, explain how it works, or send you an email with detailed steps. How can I assist you?";
        let action = null;
        let route = null;
        let language = 'en';

        // Detect requested language for email formatting
        if (q.includes('tamil')) language = 'ta';
        else if (q.includes('spanish')) language = 'es';
        else if (q.includes('hindi')) language = 'hi';
        else if (q.includes('french')) language = 'fr';

        // 1. Navigation intents
        if (q.includes('login') || q.includes('sign in')) {
            responseMsg = "Sure, taking you to the login page now!";
            action = 'navigate';
            route = '/login';
        } else if (q.includes('register') || q.includes('sign up')) {
            responseMsg = "Awesome! Let's get you registered. Redirecting...";
            action = 'navigate';
            route = '/register';
        } else if (q.includes('dashboard') || q.includes('home')) {
            responseMsg = "Routing you to your dashboard hub!";
            action = 'navigate';
            route = '/dashboard';
        } else if (q.includes('profile')) {
            responseMsg = "Let's check out your profile. Navigating there now!";
            action = 'navigate';
            route = '/profile';
        }

        // 2. Question intents about Workflow/Routing
        else if (q.includes('how') && q.includes('work')) {
            responseMsg = "Reboot connects Youths/Students with Startups, Professionals, and Part-Time Jobs. You can join 'Command Hubs' as a team, work on real-time tasks, or find localized part-time roles.";
        } else if (q.includes('freelance') || q.includes('part timer') || q.includes('non tech')) {
            responseMsg = "We categorize users into distinct roles. Freelancers have a specialized Job Grid, Part-Timers get local gig maps based on GPS, and Non-Tech members get curated BPO/Sales roles.";
        } else if (q.includes('routing') || q.includes('flow')) {
            responseMsg = "The flow works like this: Sign Up -> Choose your global role -> Enter Dashboard -> Join a Startup // Or Apply to jobs based on your role. You get a fully customized UI based on who you are!";
        }

        // 3. Email Intent
        if (email) {
            // They provided an email to send instructions
            const steps = {
                en: `Hello!\n\nHere are the easy steps to get started on Reboot:\n1. Register via the Sign Up page.\n2. Choose your role (Youth, Professional, Freelancer, etc.).\n3. Start exploring 'Startups' or the 'Job Portal' based on your role.\n4. Join a Command Hub or accept follow requests in your Profile.\n\nCheers,\nReboot AI`,
                ta: `வணக்கம்!\n\nReboot-ல் தொடங்குவதற்கான எளிய வழிமுறைகள்:\n1. Sign Up மூலம் பதிவு செய்யவும்.\n2. உங்கள் பங்கைத் தேர்ந்தெடுக்கவும் (Youth, Professional, Freelancer).\n3. 'Startups' அல்லது 'Job Portal'-ஐ ஆராயவும்.\n4. உங்கள் Profile-இல் connection-களை உருவாக்கவும்.\n\nநன்றி,\nReboot AI`,
                es: `¡Hola!\n\nAquí tienes los pasos fáciles para empezar en Reboot:\n1. Regístrate en la página de inicio.\n2. Elige tu rol (Youth, Profesional, Freelancer).\n3. Explora 'Startups' o el 'Portal de Empleo'.\n4. Conéctate con otros en tu Perfil.\n\nSaludos,\nReboot AI`,
                hi: `नमस्ते!\n\nReboot पर शुरू करने के आसान चरण यहां दिए गए हैं:\n1. साइन अप के माध्यम से पंजीकरण करें।\n2. अपनी भूमिका चुनें (युवा, पेशेवर, फ्रीलांसर)।\n3. 'स्टार्टअप्स' या 'जॉब पोर्टल' का अन्वेषण करें।\n4. अपनी प्रोफ़ाइल में जुड़ें।\n\nधन्यवाद,\nReboot AI`,
                fr: `Bonjour!\n\nVoici les étapes faciles pour démarrer sur Reboot:\n1. Inscrivez-vous via Sign Up.\n2. Choisissez votre rôle.\n3. Explorez les 'Startups' ou le 'Job Portal'.\n4. Connectez-vous dans votre Profil.\n\nCordialement,\nReboot AI`
            };

            const mailText = steps[language] || steps['en'];

            if (transporter) {
                const info = await transporter.sendMail({
                    from: '"Reboot AI Assistant" <ai@reboot.local>',
                    to: email,
                    subject: "Your Personalized Guide to Reboot!",
                    text: mailText,
                });
                console.log("AI Message sent: %s", info.messageId);
                const pUrl = nodemailer.getTestMessageUrl(info);
                console.log("Preview URL: %s", pUrl);

                responseMsg = `I have successfully emailed the personalized steps to ${email}!`;
                res.json({ message: responseMsg, action, route, previewUrl: pUrl });
                return;
            } else {
                responseMsg = `I tried to email you, but my mail servers are currently sleeping. Assume it was sent!`;
            }
        }

        res.json({ message: responseMsg, action, route });

    } catch (error) {
        console.error("AI Error", error);
        res.status(500).json({ message: "Network anomaly detected." });
    }
};
