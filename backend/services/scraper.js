const puppeteer = require('puppeteer');
const db = require('../db');
const cron = require('node-cron');

const scrapeJobs = async () => {
    console.log('Starting job scraper...');
    let browser;
    try {
        browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();

        // Mock scraping logic (example for demo)
        // In a real scenario, you'd navigate to LinkedIn/Naukri and parse the DOM
        const mockJobs = [
            { title: 'Frontend Developer', client: 'Alpha Systems', category: 'Freelancer', source: 'LinkedIn' },
            { title: 'UX Designer', client: 'Starlight', category: 'Freelancer', source: 'Naukri' },
            { title: 'Digital Marketer', client: 'Pulse Media', category: 'Non Technical', source: 'Indeed' }
        ];

        for (const job of mockJobs) {
            await db.execute(
                'INSERT INTO job_posts (job_title, client_name, category, source) VALUES (?, ?, ?, ?)',
                [job.title, job.client, job.category, job.source]
            );
        }
        console.log('Job scraping completed successfully.');
    } catch (error) {
        console.error('Error during scraping:', error);
    } finally {
        if (browser) await browser.close();
    }
};

// Schedule scraper to run every 24 hours
cron.schedule('0 0 * * *', () => {
    scrapeJobs();
});

module.exports = { scrapeJobs };
