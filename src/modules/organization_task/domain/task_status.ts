
export const TaskStatus = {
    TODO: "TODO",
    COMPLETED: "COMPLETED",
    IN_PROGRESS: "IN_PROGRESS",
    CANCELLED: "CANCELLED",
} as const;

export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];