const db = require('./db');

const seedData = [
    ['Quantum Leap', 'Project Pulsar', 'React, Node.js', 5],
    ['Cyber Shield', 'Aegis Core', 'Python, Cybersecurity', 3],
    ['Green Gen', 'EcoTrack', 'Data Science, GIS', 4],
    ['Bio Nodes', 'NeuroLink', 'Biotech, C++', 2],
    ['Sky High', 'Drone Net', 'Navigation, IoT', 6],
    ['Meta Mind', 'Virtual Verse', 'Unity, VR/AR', 8],
    ['Pixel Perfect', 'Design Hub', 'UI/UX, Figma', 2],
    ['Sound Wave', 'Audio Pulse', 'Audio Processing, ML', 4],
    ['Grid Power', 'Smart Volt', 'Electrical Eng, IoT', 5],
    ['Cloud Nine', 'Stratus DB', 'Go, Distributed Systems', 7]
];

const seed = async () => {
    try {
        const creatorId = 2; // Using the existing user ID

        for (const [team, project, skill, vacancy] of seedData) {
            // Check if project exists to avoid unique constraint error
            const [existing] = await db.execute('SELECT * FROM startups WHERE project_name = ?', [project]);
            if (existing.length > 0) {
                console.log(`Skipping ${project}, already exists.`);
                continue;
            }

            const [result] = await db.execute(
                'INSERT INTO startups (team_name, project_name, required_skill, vacancy_count, created_by, allow_public_join) VALUES (?, ?, ?, ?, ?, ?)',
                [team, project, skill, vacancy, creatorId, 1]
            );

            // Add creator as leader
            await db.execute(
                "INSERT INTO team_members (startup_id, user_id, role, status) VALUES (?, ?, 'leader', 'approved')",
                [result.insertId, creatorId]
            );

            console.log(`Seeded: ${project}`);
        }
        console.log('Done seeding!');
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

seed();
