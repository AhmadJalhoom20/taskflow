import { Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { AuthenticatedRequest, Project, ProjectMemberDetail } from '../types/index.js';
import { dbAll, dbGet, dbRun } from '../config/database.js';
import { AppError } from '../middlewares/errorHandler.js';
import { createProjectSchema, updateProjectSchema, addMemberSchema, updateMemberRoleSchema } from '../validators/schemas.js';

interface DBProject {
  id: string;
  name: string;
  description: string | null;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

interface DBMemberRow {
  user_id: string;
  role: 'owner' | 'maintainer' | 'member' | 'trainee' | 'viewer';
  joined_at: string;
  email: string;
  display_name: string;
}

async function getProjectMembersMap(projectId: string): Promise<{
  memberIds: string[];
  memberDetails: Record<string, ProjectMemberDetail>;
}> {
  const rows = await dbAll<DBMemberRow>(
    `SELECT pm.user_id, pm.role, pm.joined_at, u.email, u.display_name
     FROM project_members pm
     INNER JOIN users u ON pm.user_id = u.id
     WHERE pm.project_id = ?`,
    [projectId]
  );

  const memberIds: string[] = [];
  const memberDetails: Record<string, ProjectMemberDetail> = {};

  for (const row of rows) {
    memberIds.push(row.user_id);
    memberDetails[row.user_id] = {
      id: row.user_id,
      uid: row.user_id,
      email: row.email,
      displayName: row.display_name,
      role: row.role,
      joinedAt: row.joined_at,
    };
  }

  return { memberIds, memberDetails };
}

export const listProjects = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id || req.user!.uid;

    const rows = await dbAll<DBProject>(
      `SELECT DISTINCT p.id, p.name, p.description, p.owner_id, p.created_at, p.updated_at
       FROM projects p
       INNER JOIN project_members pm ON p.id = pm.project_id
       WHERE pm.user_id = ?
       ORDER BY p.updated_at DESC`,
      [userId]
    );

    const projects: Project[] = [];

    for (const p of rows) {
      const { memberIds, memberDetails } = await getProjectMembersMap(p.id);
      projects.push({
        id: p.id,
        name: p.name,
        description: p.description || '',
        ownerId: p.owner_id,
        memberIds,
        memberDetails,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      });
    }

    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validated = createProjectSchema.parse(req.body);
    const user = req.user!;
    const userId = user.id || user.uid;

    const projectId = uuidv4();
    const now = new Date().toISOString();

    await dbRun(
      `INSERT INTO projects (id, name, description, owner_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [projectId, validated.name, validated.description || '', userId, now, now]
    );

    await dbRun(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)`,
      [projectId, userId, now]
    );

    const memberDetails: Record<string, ProjectMemberDetail> = {
      [userId]: {
        id: userId,
        uid: userId,
        email: user.email,
        displayName: user.displayName,
        role: 'owner',
        joinedAt: now,
      },
    };

    const newProject: Project = {
      id: projectId,
      name: validated.name,
      description: validated.description || '',
      ownerId: userId,
      memberIds: [userId],
      memberDetails,
      createdAt: now,
      updatedAt: now,
    };

    res.status(201).json(newProject);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id || req.user!.uid;

    const project = await dbGet<DBProject>(
      `SELECT id, name, description, owner_id, created_at, updated_at FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found in SQL database.', 'NOT_FOUND');
    }

    // Verify membership
    const membership = await dbGet<{ user_id: string }>(
      `SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (!membership && project.owner_id !== userId) {
      throw new AppError(403, 'Access denied: You are not a member of this project.', 'FORBIDDEN');
    }

    const { memberIds, memberDetails } = await getProjectMembersMap(id);

    const response: Project = {
      id: project.id,
      name: project.name,
      description: project.description || '',
      ownerId: project.owner_id,
      memberIds,
      memberDetails,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id || req.user!.uid;
    const validated = updateProjectSchema.parse(req.body);

    const project = await dbGet<DBProject>(
      `SELECT id, name, description, owner_id, created_at, updated_at FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found in SQL database.', 'NOT_FOUND');
    }

    if (project.owner_id !== userId) {
      throw new AppError(403, 'Only the project owner can update project settings.', 'FORBIDDEN');
    }

    const now = new Date().toISOString();
    const newName = validated.name !== undefined ? validated.name : project.name;
    const newDesc = validated.description !== undefined ? validated.description : project.description;

    await dbRun(
      `UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?`,
      [newName, newDesc, now, id]
    );

    const { memberIds, memberDetails } = await getProjectMembersMap(id);

    res.status(200).json({
      id,
      name: newName,
      description: newDesc,
      ownerId: project.owner_id,
      memberIds,
      memberDetails,
      createdAt: project.created_at,
      updatedAt: now,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id || req.user!.uid;

    const project = await dbGet<DBProject>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found in SQL database.', 'NOT_FOUND');
    }

    if (project.owner_id !== userId) {
      throw new AppError(403, 'Only the project owner can delete this project.', 'FORBIDDEN');
    }

    // SQLite foreign keys ON DELETE CASCADE will automatically clean tasks and project_members
    await dbRun(`DELETE FROM projects WHERE id = ?`, [id]);

    res.status(200).json({
      message: 'Project and all associated tasks deleted successfully from SQL database.',
      projectId: id,
    });
  } catch (error) {
    next(error);
  }
};

export const addMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id || req.user!.uid;
    const { email, role = 'member' } = addMemberSchema.parse(req.body);

    const project = await dbGet<DBProject>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    // Check if caller is owner or maintainer
    const callerMember = await dbGet<{ role: string }>(
      `SELECT role FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, userId]
    );

    const canManageMembers =
      project.owner_id === userId ||
      callerMember?.role === 'owner' ||
      callerMember?.role === 'maintainer';

    if (!canManageMembers) {
      throw new AppError(403, 'Only project owners and maintainers can add members.', 'FORBIDDEN');
    }

    const cleanEmail = email.trim().toLowerCase();
    const targetUser = await dbGet<{ id: string; email: string; display_name: string; role: string }>(
      `SELECT id, email, display_name, role FROM users WHERE email = ?`,
      [cleanEmail]
    );

    if (!targetUser) {
      throw new AppError(404, `No registered user found with email "${email}". User must register an account first.`, 'USER_NOT_FOUND');
    }

    const alreadyMember = await dbGet<{ user_id: string }>(
      `SELECT user_id FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, targetUser.id]
    );

    if (alreadyMember) {
      throw new AppError(400, `User "${email}" is already a member of this project.`, 'ALREADY_MEMBER');
    }

    const assignedRole = role === 'owner' ? 'maintainer' : role; // Only original creator is workspace owner
    const now = new Date().toISOString();
    await dbRun(
      `INSERT INTO project_members (project_id, user_id, role, joined_at) VALUES (?, ?, ?, ?)`,
      [id, targetUser.id, assignedRole, now]
    );

    const { memberIds, memberDetails } = await getProjectMembersMap(id);

    res.status(200).json({
      message: 'Member added successfully.',
      projectId: id,
      memberIds,
      memberDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMemberRole = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user!.id || req.user!.uid;
    const { role } = updateMemberRoleSchema.parse(req.body);

    const project = await dbGet<DBProject>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    // Check if caller is owner or maintainer
    const callerMember = await dbGet<{ role: string }>(
      `SELECT role FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, userId]
    );

    const canManageMembers =
      project.owner_id === userId ||
      callerMember?.role === 'owner' ||
      callerMember?.role === 'maintainer';

    if (!canManageMembers) {
      throw new AppError(403, 'Only project owners and maintainers can modify roles.', 'FORBIDDEN');
    }

    // Cannot demote or change the original project owner's role
    if (memberId === project.owner_id) {
      throw new AppError(400, 'Project workspace owner role cannot be changed.', 'CANNOT_MODIFY_OWNER');
    }

    const targetMembership = await dbGet<{ role: string }>(
      `SELECT role FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, memberId]
    );

    if (!targetMembership) {
      throw new AppError(404, 'Member not found in this project.', 'NOT_A_MEMBER');
    }

    await dbRun(
      `UPDATE project_members SET role = ? WHERE project_id = ? AND user_id = ?`,
      [role, id, memberId]
    );

    const { memberIds, memberDetails } = await getProjectMembersMap(id);

    res.status(200).json({
      message: 'Member role updated successfully.',
      projectId: id,
      updatedMemberId: memberId,
      newRole: role,
      memberIds,
      memberDetails,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, memberId } = req.params;
    const userId = req.user!.id || req.user!.uid;

    const project = await dbGet<DBProject>(
      `SELECT id, owner_id FROM projects WHERE id = ?`,
      [id]
    );

    if (!project) {
      throw new AppError(404, 'Project not found.', 'NOT_FOUND');
    }

    if (project.owner_id !== userId) {
      throw new AppError(403, 'Only the project owner can remove members.', 'FORBIDDEN');
    }

    if (memberId === project.owner_id) {
      throw new AppError(400, 'Project owner cannot be removed from their own project.', 'CANNOT_REMOVE_OWNER');
    }

    const now = new Date().toISOString();
    await dbRun(
      `DELETE FROM project_members WHERE project_id = ? AND user_id = ?`,
      [id, memberId]
    );

    // Unassign tasks assigned to removed member
    await dbRun(
      `UPDATE tasks SET assignee_id = NULL, updated_at = ? WHERE project_id = ? AND assignee_id = ?`,
      [now, id, memberId]
    );

    const { memberIds, memberDetails } = await getProjectMembersMap(id);

    res.status(200).json({
      message: 'Member removed and tasks unassigned successfully.',
      projectId: id,
      removedMemberId: memberId,
      memberIds,
      memberDetails,
    });
  } catch (error) {
    next(error);
  }
};
