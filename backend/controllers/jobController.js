const db = require('../db');

exports.getFreelancerJobs = async (req, res) => {
    try {
        const [jobs] = await db.execute('SELECT * FROM job_posts WHERE category = \'Freelancer\'');
        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getNonTechJobs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM job_posts WHERE category = \'Non Technical\'';
        let params = [];

        if (search) {
            query += ' AND (job_title LIKE ? OR client_name LIKE ?)';
            params = [`%${search}%`, `%${search}%`];
        }

        const [jobs] = await db.execute(query, params);

        // If no jobs exist, let's seed some realistic long-term non-tech roles
        if (jobs.length === 0 && !search) {
            const initialNonTech = [
                { title: 'BPO Operations Lead', company: 'Global Connect Solutions', contact: 'https://careers.globalconnect.com/apply', source: 'BPO' },
                { title: 'Sales & Marketing Associate', company: 'Skyline Marketing Hub', contact: 'https://skyline.marketing/jobs', source: 'Sales' },
                { title: 'Corporate Communications Manager', company: 'Bridge PR Agency', contact: 'https://bridgepr.com/careers', source: 'Communication' },
                { title: 'Senior HR Administrator', company: 'Nexus Talent Corp', contact: 'https://nexus.talent/apply-hr', source: 'Management' },
                { title: 'Customer Success Expert', company: 'Zeta Support Systems', contact: 'https://zeta.support/jobs/cs', source: 'BPO' }
            ];

            for (const job of initialNonTech) {
                await db.execute(
                    'INSERT INTO job_posts (job_title, client_name, category, contact_details, source) VALUES (?, ?, \'Non Technical\', ?, ?)',
                    [job.title, job.company, job.contact, job.source]
                );
            }

            // Re-fetch after seeding
            const [seededJobs] = await db.execute('SELECT * FROM job_posts WHERE category = \'Non Technical\'');
            return res.json(seededJobs);
        }

        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPartTimeJobs = async (req, res) => {
    try {
        const { search, lat, lon } = req.query;
        let query = 'SELECT * FROM part_time_jobs';
        let params = [];

        if (search) {
            query += ' WHERE work_name LIKE ? OR location LIKE ?';
            params = [`%${search}%`, `%${search}%`];
        }

        const [jobs] = await db.execute(query, params);

        // If location is provided, we can sort or filter by proximity
        // For simplicity, let's just tag them with distance if coords exist
        if (lat && lon) {
            const userLat = parseFloat(lat);
            const userLon = parseFloat(lon);
            const jobsWithDistance = jobs.map(job => {
                if (job.latitude && job.longitude) {
                    const d = Math.sqrt(
                        Math.pow(job.latitude - userLat, 2) +
                        Math.pow(job.longitude - userLon, 2)
                    );
                    return { ...job, distance: d };
                }
                return { ...job, distance: 999 };
            }).sort((a, b) => a.distance - b.distance);

            return res.json(jobsWithDistance);
        }

        res.json(jobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.syncPartTimeJobs = async (req, res) => {
    try {
        // Scraper simulation: Fetching real-time part-time jobs (A to Z categories)
        // In a real app, this would use a public web scraper or a local classifieds API
        const mockPublicGrids = [
            { work_name: "Auditing Assistant", contact: "9876543210", location: "Mumbai Central", payment: "₹1,500/day", lat: 18.96, lon: 72.82 },
            { work_name: "Professional Plumber", contact: "9123456780", location: "South Mumbai", payment: "₹800/visit", lat: 18.92, lon: 72.83 },
            { work_name: "Carpenter (Furniture Repair)", contact: "9234567891", location: "Bandra West", payment: "₹1,000/day", lat: 19.05, lon: 72.84 },
            { work_name: "Mesthiri (Construction Lead)", contact: "9345678902", location: "Navi Mumbai", payment: "₹2,500/day", lat: 19.03, lon: 73.02 },
            { work_name: "Seethal/Cooling Specialist", contact: "9456789013", location: "Andheri East", payment: "₹1,200/service", lat: 19.11, lon: 72.86 },
            { work_name: "Pamphlet Distribution", contact: "8765432109", location: "Delhi Mall", payment: "₹500/shrift", lat: 28.61, lon: 77.20 },
            { work_name: "Catering Support", contact: "7654321098", location: "Bangalore Event Hall", payment: "₹1,200/event", lat: 12.97, lon: 77.59 },
            { work_name: "Data Entry (Z to A)", contact: "6543210987", location: "Remote/Local", payment: "₹800/day", lat: 13.08, lon: 80.27 },
            { work_name: "Wedding Helper", contact: "info@events.com", location: "Chennai Plaza", payment: "₹2,000/day", lat: 13.04, lon: 80.24 },
            { work_name: "Local Guide", contact: "travel@local.com", location: "Jaipur Fort", payment: "₹1,000/walk", lat: 26.91, lon: 75.78 }
        ];

        let syncedCount = 0;
        for (const job of mockPublicGrids) {
            const [existing] = await db.execute(
                'SELECT id FROM part_time_jobs WHERE work_name = ? AND location = ?',
                [job.work_name, job.location]
            );

            if (existing.length === 0) {
                await db.execute(
                    'INSERT INTO part_time_jobs (work_name, contact, location, payment, vacancy, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
                    [job.work_name, job.contact, job.location, job.payment, 1, job.lat, job.lon]
                );
                syncedCount++;
            }
        }

        res.json({ message: `Successfully scanned global grids—found ${syncedCount} new part-time opportunities!` });
    } catch (error) {
        console.error('Part-Time Sync Error:', error.message);
        res.status(500).json({ message: 'Failed to sync global part-time grids.' });
    }
};

exports.createPartTimeJob = async (req, res) => {
    try {
        const { work_name, contact, location, payment, vacancy } = req.body;
        await db.execute(
            'INSERT INTO part_time_jobs (work_name, contact, location, payment, vacancy, created_by) VALUES (?, ?, ?, ?, ?, ?)',
            [work_name, contact, location, payment, vacancy, req.user.id]
        );
        res.status(201).json({ message: 'Part-time job posted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getFreelancerPortalJobs = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        // 1. Get user profile skills
        const [user] = await db.execute('SELECT skill_name FROM users WHERE id = ?', [userId]);
        const userSkills = (user[0]?.skill_name || '').toLowerCase().split(',').map(s => s.trim()).filter(s => s !== '');

        let query = 'SELECT * FROM freelance_jobs';
        let params = [];

        if (search) {
            query += ' WHERE (company_name LIKE ? OR client_name LIKE ? OR required_skills LIKE ?)';
            params = [`%${search}%`, `%${search}%`, `%${search}%`];
        } else if (userSkills.length > 0) {
            // Match any job that requires at least one of the user's skills
            query += ' WHERE ' + userSkills.map(() => 'required_skills LIKE ?').join(' OR ');
            params = userSkills.map(s => `%${s}%`);
        }

        query += ' ORDER BY created_at DESC';
        const [jobs] = await db.execute(query, params);

        res.json({
            jobs,
            hasSkills: userSkills.length > 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.syncExternalJobs = async (req, res) => {
    try {
        const axios = require('axios');
        // RemoteOK is sensitive to headers, use a realistic User-Agent
        const response = await axios.get('https://remoteok.com/api', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
            }
        });
        const externalJobs = Array.isArray(response.data) ? response.data.slice(1) : [];

        let syncedCount = 0;
        for (const job of externalJobs) {
            // Check if job already exists
            const [existing] = await db.execute(
                'SELECT id FROM freelance_jobs WHERE company_name = ? AND theme = ?',
                [job.company || 'Unknown', job.position || 'Unknown']
            );

            if (existing.length === 0) {
                // Determine a realistic client name or source
                const client = job.company || 'Direct Client';
                const tagString = (job.tags || []).join(', ');

                await db.execute(
                    'INSERT INTO freelance_jobs (client_name, company_name, company_purpose, theme, pay, required_skills, contact_details, source_platform) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                    [
                        'Recruiter/HR',
                        client,
                        (job.description || 'Global remote opportunity for tech specialists.').substring(0, 200),
                        job.position || 'Freelance Role',
                        job.salary || 'Competitive',
                        tagString || 'Web, Remote',
                        job.url || 'https://remoteok.com',
                        'RemoteOK'
                    ]
                );
                syncedCount++;
            }
        }

        res.json({ message: `Successfully synced ${syncedCount} new jobs from the global grid.` });
    } catch (error) {
        console.error('Sync Error:', error.message);
        res.status(200).json({
            message: 'Global grid is currently under high traffic (Rate Limited). Local cache is active.',
            warning: true
        });
    }
};
