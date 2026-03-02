const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'reboot.db');
const db = new Database(dbPath);

console.log('Seeding tools and dummy data...');

const dummyTools = [
    {
        name: 'Figma',
        category: 'Design',
        skill_match: 'UI/UX Design',
        suggestion: 'The industry standard for collaborative interface design.',
        url: 'https://figma.com',
        download_url: 'https://figma.com/downloads',
        source_name: 'Figma Official'
    },
    {
        name: 'VS Code',
        category: 'Development',
        skill_match: 'Fullstack Development',
        suggestion: 'Powerful source code editor with extensive plugin ecosystem.',
        url: 'https://code.visualstudio.com',
        download_url: 'https://code.visualstudio.com/download',
        source_name: 'Microsoft'
    },
    {
        name: 'Trello',
        category: 'Management',
        skill_match: 'Agile Workflow',
        suggestion: 'Visual tool for organizing your work and tasks.',
        url: 'https://trello.com',
        download_url: 'https://trello.com/mobile-desktop-apps',
        source_name: 'Atlassian'
    },
    {
        name: 'React DevTools',
        category: 'Development',
        skill_match: 'Frontend Tech',
        suggestion: 'Debugger for React component hierarchies.',
        url: 'https://react.dev',
        download_url: 'https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbhfkeoomemkjnhi',
        source_name: 'Meta'
    }
];

const insertTool = db.prepare(`
    INSERT INTO tools (name, category, skill_match, suggestion, url, download_url, source_name) 
    VALUES (@name, @category, @skill_match, @suggestion, @url, @download_url, @source_name)
`);

db.transaction(() => {
    // Clear existing tools to avoid duplicates for this demo
    db.prepare('DELETE FROM tools').run();
    for (const tool of dummyTools) {
        insertTool.run(tool);
    }
})();

console.log('Seeding completed.');
db.close();
