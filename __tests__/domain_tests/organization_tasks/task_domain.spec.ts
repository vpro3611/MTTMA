import { Task } from "../../../backend/src/modules/organization_task/domain/task_domain.js";
import { TaskTitle } from "../../../backend/src/modules/organization_task/domain/task_title.js";
import { TaskDescription } from "../../../backend/src/modules/organization_task/domain/task_description.js";
import {
    CannotChangeCancelledError,
    CannotChangeCompletedError,
    UnchangeableDueToStatusError,
} from "../../../backend/src/modules/organization_task/errors/task_domain_errors.js";

describe("Task (domain)", () => {
    const ORG_ID = "org-1";
    const USER_ID = "user-1";

    const createTask = () =>
        Task.create(
            ORG_ID,
            TaskTitle.create("Initial title"),
            TaskDescription.create("Initial description"),
            USER_ID,
            USER_ID
        );

    describe("rename", () => {
        it("should allow rename when status is TODO", () => {
            const task = createTask();

            task.rename(TaskTitle.create("New title"));

            expect(task.getTitle().getValue()).toBe("New title");
        });

        it("should throw if task is CANCELED", () => {
            const task = createTask();
            task.changeStatus("CANCELED");

            expect(() => {
                task.rename(TaskTitle.create("New title"));
            }).toThrow(UnchangeableDueToStatusError);
        });

        it("should throw if task is COMPLETED", () => {
            const task = createTask();
            task.changeStatus("COMPLETED");

            expect(() => {
                task.rename(TaskTitle.create("New title"));
            }).toThrow(UnchangeableDueToStatusError);
        });
    });

    describe("changeDescription", () => {
        it("should allow description change when status is TODO", () => {
            const task = createTask();

            task.changeDescription(TaskDescription.create("New description"));

            expect(task.getDescription().getValue()).toBe("New description");
        });

        it("should throw if task is CANCELED", () => {
            const task = createTask();
            task.changeStatus("CANCELED");

            expect(() => {
                task.changeDescription(
                    TaskDescription.create("New description")
                );
            }).toThrow(UnchangeableDueToStatusError);
        });

        it("should throw if task is COMPLETED", () => {
            const task = createTask();
            task.changeStatus("COMPLETED");

            expect(() => {
                task.changeDescription(
                    TaskDescription.create("New description")
                );
            }).toThrow(UnchangeableDueToStatusError);
        });
    });

    describe("changeStatus", () => {
        it("should allow changing TODO → IN_PROGRESS", () => {
            const task = createTask();

            task.changeStatus("IN_PROGRESS");

            expect(task.getStatus()).toBe("IN_PROGRESS");
        });

        it("should allow changing TODO → COMPLETED", () => {
            const task = createTask();

            task.changeStatus("COMPLETED");

            expect(task.getStatus()).toBe("COMPLETED");
        });

        it("should allow changing IN_PROGRESS → COMPLETED", () => {
            const task = createTask();
            task.changeStatus("IN_PROGRESS");

            task.changeStatus("COMPLETED");

            expect(task.getStatus()).toBe("COMPLETED");
        });

        it("should throw if task is CANCELED", () => {
            const task = createTask();
            task.changeStatus("CANCELED");

            expect(() => {
                task.changeStatus("IN_PROGRESS");
            }).toThrow(CannotChangeCancelledError);
        });

        it("should throw if trying to reopen COMPLETED task", () => {
            const task = createTask();
            task.changeStatus("COMPLETED");

            expect(() => {
                task.changeStatus("IN_PROGRESS");
            }).toThrow(CannotChangeCompletedError);
        });
    });
});
