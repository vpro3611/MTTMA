
//pgm.createType("task_status", ["TODO", "COMPLETED", "CANCELED", "IN_PROGRESS"]);

import {TaskDescription} from "./task_description.js";
import {TaskTitle} from "./task_title.js";
import {
    CannotChangeCancelledError,
    CannotChangeCompletedError,
    UnchangeableDueToStatusError
} from "../errors/task_domain_errors.js";
import {TaskStatus} from "./task_status.js";

// export type TaskStatus = "TODO" | "COMPLETED" | "CANCELED" | "IN_PROGRESS"

export class Task {
    constructor(
        public readonly id: string,
        public readonly organizationId: string,
        private title: TaskTitle,
        private description: TaskDescription,
        private status: TaskStatus,
        private assignedTo: string,
        private createdBy: string,
        private createdAt: Date
    ) {}

    private checkTaskStatus = (taskStatus: TaskStatus) => {
        if (taskStatus === TaskStatus.CANCELLED || taskStatus === TaskStatus.COMPLETED) {
            throw new UnchangeableDueToStatusError(taskStatus);
        }
    }

    private assertStatusForChange = (newStatus: TaskStatus) => {
        if (this.status === TaskStatus.CANCELLED) {
            throw new CannotChangeCancelledError()
        }

        if (this.status === TaskStatus.COMPLETED && newStatus === TaskStatus.IN_PROGRESS) {
            throw new CannotChangeCompletedError()
        }
    }

    static restore(props: {
        id: string;
        organizationId: string;
        title: string;
        description: string ;
        status: TaskStatus;
        assignedTo: string ;
        createdBy: string;
        createdAt: Date;
    }) {
        return new Task(
            props.id,
            props.organizationId,
            TaskTitle.create(props.title),
            TaskDescription.create(props.description),
            props.status,
            props.assignedTo,
            props.createdBy,
            props.createdAt
        );
    }

    static create(organizationId: string, title: TaskTitle, description: TaskDescription, assignedTo: string, createdBy: string) {
        return new Task(
            crypto.randomUUID(),
            organizationId,
            title,
            description,
            TaskStatus.TODO,
            assignedTo,
            createdBy,
            new Date()
        )
    }

    rename = (newTitle: TaskTitle) => {
        this.checkTaskStatus(this.status);
        this.title = newTitle;
    }

    changeDescription = (newDescription: TaskDescription) => {
        this.checkTaskStatus(this.status);
        this.description = newDescription;
    }

    changeStatus = (newStatus: TaskStatus) => {
        this.checkTaskStatus(this.status);
        this.assertStatusForChange(newStatus);
        this.status = newStatus;
    }

    getTitle = () => this.title;
    getDescription = () => this.description;
    getStatus = () => this.status;
    getAssignedTo = () => this.assignedTo;
    getCreatedBy = () => this.createdBy;
    getCreatedAt = () => this.createdAt;
}