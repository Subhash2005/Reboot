const db = require('../db');

exports.createStartup = async (req, res) => {
    try {
        const creatorId = req.user.id;
        const { team_name, project_name, required_skill, vacancy_count, allow_public_join } = req.body;

        // 1. Check if user already created a startup
        const [existingOwnStartup] = await db.execute('SELECT * FROM startups WHERE created_by = ?', [creatorId]);
        if (existingOwnStartup.length > 0) {
            return res.status(400).json({ message: 'You have already created a startup. You can only create one.' });
        }

        // 2. Check if project name is unique
        const [existingProject] = await db.execute('SELECT * FROM startups WHERE project_name = ?', [project_name]);
        if (existingProject.length > 0) {
            return res.status(400).json({ message: 'Project name already exists' });
        }

        // 3. Check if user is already in any team (as founder or member, pending or approved)
        const [existingMembership] = await db.execute(
            "SELECT * FROM team_members WHERE user_id = ? AND (status = 'approved' OR status = 'pending')",
            [creatorId]
        );
        if (existingMembership.length > 0) {
            return res.status(400).json({ message: 'You are already an active or pending member of a startup team' });
        }

        const [result] = await db.execute(
            'INSERT INTO startups (team_name, project_name, required_skill, vacancy_count, created_by, allow_public_join) VALUES (?, ?, ?, ?, ?, ?)',
            [team_name, project_name, required_skill, Math.max(0, vacancy_count - 1), creatorId, allow_public_join]
        );

        // Leader automatically joins as Founder
        await db.execute(
            "INSERT INTO team_members (startup_id, user_id, role, status) VALUES (?, ?, 'Founder', 'approved')",
            [result.insertId, creatorId]
        );

        res.status(201).json({ message: 'Startup created successfully', startupId: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStartups = async (req, res) => {
    try {
        const [startups] = await db.execute('SELECT s.*, u.username as creator_name FROM startups s LEFT JOIN users u ON s.created_by = u.id');
        res.json(startups);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAvailableStartups = async (req, res) => {
    try {
        const userId = req.user.id;
        const { search } = req.query;

        // 1. Get user skills and experience to match
        const [user] = await db.execute('SELECT skill_name, previous_experience FROM users WHERE id = ?', [userId]);
        const { skill_name, previous_experience } = user[0] || {};

        let sql = `
            SELECT s.*, u.username as creator_name 
            FROM startups s 
            JOIN users u ON s.created_by = u.id 
            WHERE s.vacancy_count > 0 
        `;
        let params = [];

        if (search) {
            sql += " AND (s.team_name LIKE ? OR s.project_name LIKE ? OR s.required_skill LIKE ? OR s.skills_needed LIKE ? OR s.theme LIKE ?)";
            const sVal = `%${search}%`;
            params.push(sVal, sVal, sVal, sVal, sVal);
        } else if (skill_name || previous_experience) {
            // Smart match based on profile
            sql += " AND (s.required_skill LIKE ? OR s.skills_needed LIKE ? OR s.project_name LIKE ?)";
            const matchVal = `%${skill_name || previous_experience}%`;
            params.push(matchVal, matchVal, matchVal);
        }

        const [results] = await db.execute(sql, params);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.joinStartup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { startupId, immediate = false } = req.body;

        // 1. Check if user is already in a team (as leader or approved member)
        const [existingMember] = await db.execute(
            "SELECT * FROM team_members WHERE user_id = ? AND (status = 'approved' OR status = 'pending')",
            [userId]
        );
        if (existingMember.length > 0) {
            return res.status(400).json({ message: 'You already have an active membership or pending request' });
        }

        const [startups] = await db.execute('SELECT * FROM startups WHERE id = ?', [startupId]);
        if (startups.length === 0) return res.status(404).json({ message: 'Startup not found' });

        const creatorId = startups[0].created_by;
        const projectName = startups[0].project_name;

        const [users] = await db.execute('SELECT role, previous_experience, username FROM users WHERE id = ?', [userId]);
        const userGlobalRole = users[0]?.role;
        const experience = users[0]?.previous_experience;
        const username = users[0]?.username;

        // Requirement: Professionals must have experience to be allocated (joined)
        if (userGlobalRole === 'professional' && (!experience || experience.trim() === '')) {
            return res.status(403).json({ message: 'Deployment Forbidden: You must document your professional experience in your dossier before accepting commissions.' });
        }

        const teamRole = userGlobalRole === 'professional' ? 'Captain & Co-Founder' : 'Member';
        const status = (userGlobalRole === 'professional' && immediate) ? 'approved' : 'pending';

        await db.execute(
            "INSERT INTO team_members (startup_id, user_id, role, status) VALUES (?, ?, ?, ?)",
            [startupId, userId, teamRole, status]
        );

        if (status === 'approved') {
            // Immediate Join logic (Captain appointment)
            // 1. Notify all existing members
            const [members] = await db.execute("SELECT user_id FROM team_members WHERE startup_id = ? AND status = 'approved'", [startupId]);
            const msg = `MISSION ALERT: Specialist ${username} has been appointed as ${teamRole} for your startup "${projectName}"! Check your Mission Board.`;

            for (const member of members) {
                if (member.user_id !== userId) {
                    await db.execute(
                        'INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, 0)',
                        [member.user_id, msg]
                    );
                }
            }
            // 2. Decrement vacancy
            await db.execute('UPDATE startups SET vacancy_count = MAX(0, vacancy_count - 1) WHERE id = ?', [startupId]);
        } else {
            // Standard Pending Req
            const msg = `${username} has requested to join your startup "${projectName}"`;
            await db.execute(
                'INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, 0)',
                [creatorId, msg]
            );
        }

        res.json({ message: status === 'approved' ? 'Mission Joined: You are now the Captain of this crew.' : 'Join request sent.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.deleteStartup = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;

        // Check if user is the creator
        const [startup] = await db.execute('SELECT * FROM startups WHERE id = ?', [id]);
        if (startup.length === 0) {
            return res.status(404).json({ message: 'Startup not found' });
        }

        if (startup[0].created_by !== userId) {
            return res.status(403).json({ message: 'Only the creator can delete this startup' });
        }

        await db.execute('DELETE FROM startups WHERE id = ?', [id]);
        // team_members and tasks will be deleted automatically due to ON DELETE CASCADE

        res.json({ message: 'Startup deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getStartupById = async (req, res) => {
    try {
        const { id } = req.params;
        const [startups] = await db.execute('SELECT * FROM startups WHERE id = ?', [id]);
        if (startups.length === 0) return res.status(404).json({ message: 'Startup not found' });

        const [members] = await db.execute('SELECT tm.*, u.username, u.email FROM team_members tm JOIN users u ON tm.user_id = u.id WHERE tm.startup_id = ? AND tm.status = \'approved\'', [id]);

        res.json({ ...startups[0], members });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        // Get requests for startups owned by this user
        const [requests] = await db.execute(
            `SELECT tm.*, u.username, u.email, s.project_name 
             FROM team_members tm 
             JOIN users u ON tm.user_id = u.id 
             JOIN startups s ON tm.startup_id = s.id 
             WHERE s.created_by = ? AND tm.status = 'pending'`,
            [userId]
        );
        res.json(requests);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.processJoinRequest = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { requestId, status } = req.body; // status: 'approved' or 'rejected'

        // 1. Verify administrative authority
        const [requestData] = await db.execute(
            "SELECT tm.*, s.project_name FROM team_members tm JOIN startups s ON tm.startup_id = s.id WHERE tm.id = ?",
            [requestId]
        );

        if (requestData.length === 0) return res.status(404).json({ message: 'Request not found' });

        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [requestData[0].startup_id, leaderId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Command Staff Authorization Required' });

        await db.execute(
            "UPDATE team_members SET status = ? WHERE id = ?",
            [status, requestId]
        );

        if (status === 'approved') {
            await db.execute(
                "UPDATE startups SET vacancy_count = MAX(0, vacancy_count - 1) WHERE id = ?",
                [requestData[0].startup_id]
            );
        }

        // Notify member of result
        const msg = status === 'approved'
            ? `Your request to join "${requestData[0].project_name}" was approved!`
            : `Your request to join "${requestData[0].project_name}" was declined.`;

        await db.execute(
            'INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, 0)',
            [requestData[0].user_id, msg]
        );

        res.json({ message: `Request ${status} successfully` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getMyStartupStatus = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user global role
        const [userData] = await db.execute('SELECT role, previous_experience FROM users WHERE id = ?', [userId]);
        const user = userData[0];

        const [memberships] = await db.execute(
            `SELECT tm.*, s.project_name, s.team_name 
             FROM team_members tm 
             JOIN startups s ON tm.startup_id = s.id 
             WHERE tm.user_id = ? AND (tm.status = 'approved' OR tm.status = 'pending')`,
            [userId]
        );

        if (memberships.length > 0) {
            res.json({
                user_id: userId,
                inTeam: true,
                role: memberships[0].role,
                globalRole: user.role,
                experience: user.previous_experience,
                status: memberships[0].status,
                project_name: memberships[0].project_name,
                team_name: memberships[0].team_name,
                startup_id: memberships[0].startup_id
            });
        } else {
            res.json({ user_id: userId, inTeam: false, globalRole: user.role, experience: user.previous_experience });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.removeTeamMember = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { startupId, targetUserId } = req.body;

        // 1. Verify administrative authority
        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [startupId, leaderId]
        );

        if (auth.length === 0) return res.status(403).json({ message: 'Personnel Discharge Unauthorized: Command Staff only.' });

        const [startup] = await db.execute('SELECT project_name FROM startups WHERE id = ?', [startupId]);

        if (targetUserId === leaderId) {
            return res.status(400).json({ message: 'You cannot remove yourself as Founder' });
        }

        // 2. Remove member
        await db.execute(
            "DELETE FROM team_members WHERE startup_id = ? AND user_id = ?",
            [startupId, targetUserId]
        );

        // 3. Re-open vacancy
        await db.execute(
            "UPDATE startups SET vacancy_count = vacancy_count + 1 WHERE id = ?",
            [startupId]
        );

        // 4. Notify removed member
        await db.execute(
            'INSERT INTO notifications (user_id, message, read_status) VALUES (?, ?, 0)',
            [targetUserId, `You have been removed from the team for "${startup[0].project_name}" by the Founder.`]
        );

        res.json({ message: 'Member removed successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTeamMembers = async (req, res) => {
    try {
        const { id } = req.params;
        const [members] = await db.execute(`
            SELECT tm.*, u.username, u.role as user_role 
            FROM team_members tm 
            JOIN users u ON tm.user_id = u.id 
            WHERE tm.startup_id = ? AND tm.status = 'approved'
        `, [id]);
        res.json(members);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching members' });
    }
};

// Tasks
exports.getTasks = async (req, res) => {
    try {
        const { id } = req.params; // startupId
        const [tasks] = await db.execute(`
            SELECT t.*, u.username as assigned_username 
            FROM tasks t 
            LEFT JOIN users u ON t.assigned_to = u.id 
            WHERE t.startup_id = ?
            ORDER BY t.created_at DESC
        `, [id]);

        // Fetch multiple members for each task
        for (let task of tasks) {
            const [assignees] = await db.execute(`
                SELECT u.id, u.username, u.role
                FROM task_members tm
                JOIN users u ON tm.user_id = u.id
                WHERE tm.task_id = ?
            `, [task.id]);
            task.assigned_members = assignees;
        }

        res.json(tasks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createTask = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { startupId, title, description, assignedTo, deadline, tools } = req.body; // assignedTo can be array

        // Verify administrative authority (Founder or Captain)
        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [startupId, leaderId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Deployment Unauthorized: Only Command Staff (Founder or Captain) can assign tasks.' });

        const firstAssignee = Array.isArray(assignedTo) ? assignedTo[0] : assignedTo;
        const toolsStr = Array.isArray(tools) ? JSON.stringify(tools) : tools;

        const [result] = await db.execute(
            'INSERT INTO tasks (startup_id, assigned_to, title, description, assigned_by, deadline, tools) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [startupId, firstAssignee, title, description, leaderId, deadline, toolsStr]
        );

        const taskId = result.insertId;

        // Multi-member insert
        if (Array.isArray(assignedTo)) {
            for (let uid of assignedTo) {
                await db.execute('INSERT INTO task_members (task_id, user_id) VALUES (?, ?)', [taskId, uid]);
            }
        } else if (assignedTo) {
            await db.execute('INSERT INTO task_members (task_id, user_id) VALUES (?, ?)', [taskId, assignedTo]);
        }

        res.status(201).json({ message: 'Task assigned successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTaskProgress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId, percentage, proofUrl } = req.body;

        // Verify if the user is explicitly assigned to this task
        const [assignment] = await db.execute('SELECT * FROM task_members WHERE task_id = ? AND user_id = ?', [taskId, userId]);

        if (assignment.length === 0) {
            return res.status(403).json({ message: 'Access Denied: You are not allocated to this mission objective.' });
        }

        await db.execute(
            'UPDATE tasks SET completion_percentage = ?, proof_url = ?, status = ? WHERE id = ?',
            [percentage, proofUrl, percentage >= 100 ? 'completed' : 'inprogress', taskId]
        );

        res.json({ message: 'Mission progress logged.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.verifyTask = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { taskId, verified, suggestion } = req.body;

        const [task] = await db.execute(`
            SELECT t.*, s.project_name 
            FROM tasks t 
            JOIN startups s ON t.startup_id = s.id 
            WHERE t.id = ?
        `, [taskId]);
        if (task.length === 0) return res.status(404).json({ message: 'Task not found' });

        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [task[0].startup_id, leaderId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Verification Unauthorized: Only Command Staff can approve mission objectives.' });

        await db.execute(
            'UPDATE tasks SET is_verified = ?, leader_suggestion = ? WHERE id = ?',
            [verified ? 1 : 0, suggestion || null, taskId]
        );

        // Notify assigned members
        const [assignees] = await db.execute('SELECT user_id FROM task_members WHERE task_id = ?', [taskId]);
        for (const assignee of assignees) {
            await db.execute(
                'INSERT INTO notifications (user_id, type, message, related_id) VALUES (?, ?, ?, ?)',
                [
                    assignee.user_id,
                    'task_verification',
                    `Captain ${verified ? 'verified' : 'gave feedback on'} your task: "${task[0].title}"`,
                    taskId
                ]
            );
        }

        res.json({ message: verified ? 'Task verified' : 'Feedback submitted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.addSuggestion = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { taskId, suggestion } = req.body;

        const [task] = await db.execute('SELECT startup_id FROM tasks WHERE id = ?', [taskId]);
        if (task.length === 0) return res.status(404).json({ message: 'Task not found' });

        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [task[0].startup_id, leaderId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Advisory Unauthorized: Only Command Staff can provide feedback.' });

        await db.execute('UPDATE tasks SET leader_suggestion = ? WHERE id = ?', [suggestion, taskId]);
        res.json({ message: 'Suggestion added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.updateTaskStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const { taskId, status } = req.body; // status: 'inprogress', 'completed'

        await db.execute('UPDATE tasks SET status = ? WHERE id = ? AND assigned_to = ?', [status, taskId, userId]);
        res.json({ message: 'Task status updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Milestones
exports.getMilestones = async (req, res) => {
    try {
        const { id } = req.params;
        const [milestones] = await db.execute('SELECT * FROM milestones WHERE startup_id = ? ORDER BY achieved_at DESC', [id]);
        res.json(milestones);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.createMilestone = async (req, res) => {
    try {
        const leaderId = req.user.id;
        const { startupId, title, description } = req.body;

        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [startupId, leaderId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Commemoration Unauthorized: Only Command Staff can record milestones.' });

        await db.execute(
            'INSERT INTO milestones (startup_id, title, description) VALUES (?, ?, ?)',
            [startupId, title, description]
        );

        res.status(201).json({ message: 'Milestone added' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Tools
exports.getPerformanceAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params; // startupId

        // Verify administrative authority
        const [auth] = await db.execute(
            "SELECT role FROM team_members WHERE startup_id = ? AND user_id = ? AND status = 'approved' AND (role = 'Founder' OR role = 'Captain & Co-Founder')",
            [id, userId]
        );
        if (auth.length === 0) return res.status(403).json({ message: 'Intel Restricted: Only Command Staff can access performance analytics.' });

        // 1. Get all tasks
        const [tasks] = await db.execute('SELECT * FROM tasks WHERE startup_id = ?', [id]);

        // 2. Get all members
        const [members] = await db.execute(`
            SELECT tm.*, u.username, u.role as user_role 
            FROM team_members tm 
            JOIN users u ON tm.user_id = u.id 
            WHERE tm.startup_id = ? AND tm.status = 'approved'
        `, [id]);

        if (tasks.length === 0) {
            return res.json({
                overallCompletion: 0,
                memberStats: members.map(m => ({ username: m.username, score: 0, strength: 'N/A', weakness: 'N/A' })),
                roleAttention: 'None'
            });
        }

        // 3. Calculate Overall Completion
        const totalCompletion = tasks.reduce((sum, t) => sum + (t.completion_percentage || 0), 0);
        const overallCompletion = Math.round(totalCompletion / tasks.length);

        // 4. Calculate Member Stats
        const memberStats = await Promise.all(members.map(async (member) => {
            // Get tasks assigned to this member via task_members table
            const [assignments] = await db.execute('SELECT task_id FROM task_members WHERE user_id = ?', [member.user_id]);
            const taskIds = assignments.map(a => a.task_id).filter(tid => tasks.some(t => t.id === tid));

            const memberTasks = tasks.filter(t => taskIds.includes(t.id));

            if (memberTasks.length === 0) {
                return {
                    username: member.username,
                    role: member.role,
                    score: 0,
                    tasksCount: 0,
                    strength: 'Prepared',
                    weakness: 'No Tasks Assigned'
                };
            }

            const avgComp = memberTasks.reduce((sum, t) => sum + (t.completion_percentage || 0), 0) / memberTasks.length;
            const verifiedCount = memberTasks.filter(t => t.is_verified).length;
            const score = Math.round((avgComp * 0.7) + (verifiedCount / memberTasks.length * 30));

            // Heuristics
            let strength = 'Consistent';
            if (avgComp > 80) strength = 'High Productivity';
            if (verifiedCount === memberTasks.length) strength = 'Precision & Quality';

            let weakness = 'None';
            if (avgComp < 40) weakness = 'Slow Progress';
            if (memberTasks.some(t => t.completion_percentage === 100 && !t.is_verified)) weakness = 'Pending Verification';

            return {
                username: member.username,
                role: member.role,
                user_role: member.user_role,
                score,
                tasksCount: memberTasks.length,
                strength,
                weakness
            };
        }));

        // 5. Role Attention Logic
        // We'll use the user's role because tasks don't have explicit categories yet, 
        // but we can infer from tools if necessary. For now, let's use global role.
        const roleProgress = {};
        memberStats.forEach(ms => {
            if (!roleProgress[ms.role]) roleProgress[ms.role] = { total: 0, count: 0 };
            roleProgress[ms.role].total += ms.score;
            roleProgress[ms.role].count += 1;
        });

        let attentionRole = 'All units stable';
        let minAvg = 100;
        Object.keys(roleProgress).forEach(role => {
            const avg = roleProgress[role].total / roleProgress[role].count;
            if (avg < minAvg) {
                minAvg = avg;
                attentionRole = role;
            }
        });

        res.json({
            overallCompletion,
            memberStats,
            roleAttention: minAvg < 60 ? attentionRole : 'Strategic Balance Maintained'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getTools = async (req, res) => {
    try {
        const [tools] = await db.execute('SELECT * FROM tools');
        res.json(tools);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};
