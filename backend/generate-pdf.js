const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Reboot Platform Documentation</title>
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
        }
        h1 {
            color: #0ea5e9;
            border-bottom: 2px solid #0ea5e9;
            padding-bottom: 10px;
            font-size: 2.5em;
        }
        h2 {
            color: #1e293b;
            margin-top: 40px;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 5px;
        }
        h3 {
            color: #334155;
            margin-top: 20px;
        }
        p, li {
            font-size: 14px;
            color: #475569;
        }
        .code-block {
            background-color: #f1f5f9;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            font-size: 12px;
            overflow-x: auto;
        }
        .highlight {
            font-weight: bold;
            color: #0ea5e9;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #cbd5e1;
            padding: 8px;
            text-align: left;
            font-size: 13px;
        }
        th {
            background-color: #f8fafc;
            color: #1e293b;
        }
    </style>
</head>
<body>

    <h1>Reboot Platform: A to Z Documentation</h1>
    <p><strong>Generated on:</strong> ${new Date().toLocaleDateString()}</p>

    <h2>1. Platform Overview</h2>
    <p>Reboot is a highly dynamic, role-based platform designed to connect youths/students with startups, professionals, and various job networks (Freelance, Part-Time, Non-Technical). It features a real-time dashboard, a progressive social tracking system (Posts, Followers), web-socket powered chat, and an AI-assisted user routing email system.</p>

    <h2>2. Technology Stack</h2>
    <ul>
        <li><span class="highlight">Frontend:</span> Next.js (React), Tailwind CSS, Framer Motion (for animations), Lucide React (icons), Axios.</li>
        <li><span class="highlight">Backend:</span> Node.js, Express.js.</li>
        <li><span class="highlight">Database:</span> SQLite (using <code>better-sqlite3</code>).</li>
        <li><span class="highlight">Real-time:</span> Socket.io (for messaging).</li>
        <li><span class="highlight">Authentication:</span> JSON Web Tokens (JWT), Google OAuth 2.0 (Google Auth Library).</li>
        <li><span class="highlight">File Management:</span> Multer (local disk storage for profile pictures, chat media, and post media).</li>
        <li><span class="highlight">Email Services:</span> Nodemailer (configured for Ethereal test domains or live Gmail SMTP).</li>
    </ul>

    <h2>3. Authentication & Authorization</h2>
    <p>Security is handled via a dual-pathway system ensuring cross-platform stability:</p>
    <h3>3.1. Standard JWT Registration</h3>
    <p>Users register with an email, username, and password. The password is hashed using <strong>bcryptjs</strong>. Upon login, the <code>authController</code> mints a JWT valid for 24 hours. The token is passed to the client and stored in <code>localStorage</code>.</p>
    
    <h3>3.2. Google Single Sign-On (SSO)</h3>
    <p>The platform uses standard <code>google-auth-library</code>. When a user clicks 'Sign in with Google', the frontend sends the Google credential token to the backend. The backend verifies the token using the Google Client ID. If the email doesn't exist, it auto-registers the user. It then issues a standard JWT for internal platform authorization.</p>

    <h3>3.3. Role-Based Access Control (RBAC)</h3>
    <p>A middleware (<code>authMiddleware.js</code>) intercepts protected routes, decodes the JWT, and attaches the <code>user</code> object. Upon accessing the dashboard, <code>DashboardLayout</code> requests the user's <strong>globalRole</strong>. Based on this role, the UI completely alters to serve only the relevant pathways.</p>

    <h2>4. Core Working Pathways & Workflows</h2>

    <h3>4.1. The Dynamic Dashboard & Sidebar</h3>
    <p>Depending on the user's role, the sidebar alters and redirects users:</p>
    <ul>
        <li><strong>Freelancers:</strong> The Sidebar vanishes. The user goes full-screen into the Job Portal.</li>
        <li><strong>Part-Time & Non-Tech:</strong> The Sidebar limits to localized Hubs.</li>
        <li><strong>Youth / Professionals:</strong> Access to Startups, Command Hubs, Team Overviews, Analytics, and Messaging.</li>
    </ul>

    <h3>4.2. Startups & Command Hubs (Youth/Pro)</h3>
    <p>Youths can form Startups. Professionals can oversee them. A hierarchy exists (Founder, Captain & Co-Founder, Member). Teams share a unified command hub where members can see shared objectives and metrics.</p>

    <h3>4.3. Automated Job Portals & Data Syncing</h3>
    <p>The Freelance, Part-Time, and Non-Tech Hubs operate using a "Grid Sync" mechanism.</p>
    <ul>
        <li><strong>Frontend:</strong> The user clicks "Sync Global Grid".</li>
        <li><strong>Backend Controller:</strong> The <code>jobController.js</code> simulates fetching data from external API networks (Telegram networks, public grids, location mockers).</li>
        <li><strong>Database:</strong> It performs uniqueness checks (e.g., matching company & title) and inserts new rows seamlessly into the SQLite tables (<code>job_posts</code>, <code>part_time_jobs</code>).</li>
    </ul>

    <h3>4.4. Social Profiles (Posts & Connections)</h3>
    <p>The profile structure operates similarly to Instagram:</p>
    <ul>
        <li><strong>Following System:</strong> Users search for others and send requests. The status is "pending" until accepted via the notifications overlay.</li>
        <li><strong>Posts Grid:</strong> Users upload images via Multer (to <code>/uploads/posts</code>). Users can view their grid, an aggregated feed from people they follow, and bookmarks/saved posts.</li>
        <li><strong>Notifications:</strong> The topbar polls every 30 seconds for unread notifications, triggering visual notification dots.</li>
    </ul>

    <h3>4.5. AI Email Chatbot</h3>
    <p>The chatbot interface (bottom-left floating orb on the frontend) operates differently from traditional LLMs:</p>
    <ul>
        <li>It utilizes a <strong>Rule-based Intent Parser</strong> within <code>aiController.js</code>.</li>
        <li>Scans user queries for keywords (navigational "login", workflow logic "how does it work", languages "tamil", "french").</li>
        <li>If an email is provided, it leverages <strong>Nodemailer</strong>. Based on <code>.env</code> configurations, it sends personalized onboarding instructions directly to the user's real Gmail (via SMTP_USER and App Password) or an Ethereal test inbox.</li>
    </ul>

    <h2>5. Database Architecture</h2>
    <p>Handled synchronously via <code>better-sqlite3</code> initialized in <code>init-db.js</code>.</p>
    <ul>
        <li><code>users</code>: Core identity, passwords, global roles, avatars.</li>
        <li><code>startups / startup_members</code>: Hierarchical linking of youths to professional oversight.</li>
        <li><code>posts / saved_posts</code>: Social media aspect, tracking media paths and ownership.</li>
        <li><code>followers</code>: A map of <code>follower_id</code> and <code>following_id</code> governing the social graph.</li>
        <li><code>messages / conversations</code>: Socket-driven real-time payload logging.</li>
        <li><code>notifications</code>: System-generated alerts mapping triggers directly to individual users.</li>
    </ul>

    <h2>6. Frontend Structure (Next.js)</h2>
    <p>Built with Next.js App Router (<code>src/app/</code>).</p>
    <ul>
        <li><code>/login</code> & <code>/register</code>: Public entry points.</li>
        <li><code>/dashboard</code>: The root protected zone with the dynamic <code>layout.tsx</code>. Branches into specific sub-dashboards (<code>/freelancer</code>, <code>/youth</code>, <code>/professional</code>).</li>
        <li><code>/profile</code>: A heavy, multi-state component handling modals (followers/following) tabs (posts/feed) and uploads.</li>
        <li>The UI heavily incorporates <strong>Glassmorphism</strong> (semi-transparent backgrounds, blurs) and <strong>Framer Motion</strong> for fluid layout transitions and element scaling.</li>
    </ul>

    <h2>7. Summary</h2>
    <p>Reboot acts as an intersection between a professional job board, an organizational tracking tool for startups, and a social networking application, combining robust SQLite storage with highly flexible React-based conditional rendering paradigms.</p>

</body>
</html>
`;

(async () => {
    try {
        console.log('Initiating Puppeteer to build PDF documentation...');

        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        // Emulate print CSS for better spacing
        await page.emulateMediaType('print');

        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfPath = path.join(__dirname, 'Reboot_Documentation.pdf');

        await page.pdf({
            path: pdfPath,
            format: 'A4',
            printBackground: true,
            margin: { top: '20px', bottom: '20px', left: '20px', right: '20px' }
        });

        await browser.close();

        console.log('Successfully generated PDF at: ' + pdfPath);
    } catch (error) {
        console.error('Failure generating PDF:', error);
        process.exit(1);
    }
})();
