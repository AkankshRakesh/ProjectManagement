import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getTasks = async (
    req: Request,
    res: Response
) : Promise<void> => {
    const {projectId} = req.query;
    try{
        const tasks = await prisma.task.findMany({
            where: { projectId: Number(projectId) },
            include: { author: true, assignee: true, attachments: true, comments: true }
        });
        res.json(tasks);
    } catch (error: any) {
        res.status(500).json({ message: `Error getting tasks ${error.message}` });
    }
};

export const createTask = async (
    req: Request,
    res: Response
) : Promise<void> => {
    const {title, description, priority, startDate, dueDate, tags, projectId, authorUserId, assignedUserId} = req.body;
};