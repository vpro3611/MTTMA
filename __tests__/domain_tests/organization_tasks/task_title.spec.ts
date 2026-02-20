import { TaskTitle } from "../../../src/modules/organization_task/domain/task_title.js";
import {
    TaskTitleTooShortError,
    TaskTitleTooLongError,
} from "../../../src/modules/organization_task/errors/task_title_errors.js";

describe("TaskTitle (domain)", () => {

    it("should create task title with valid value", () => {
        const title = TaskTitle.create("My task");

        expect(title).toBeInstanceOf(TaskTitle);
        expect(title.getValue()).toBe("My task");
    });

    it("should trim title value", () => {
        const title = TaskTitle.create("   My task   ");

        expect(title.getValue()).toBe("My task");
    });

    it("should throw if title is empty", () => {
        expect(() => {
            TaskTitle.create("");
        }).toThrow(TaskTitleTooShortError);
    });

    it("should throw if title contains only spaces", () => {
        expect(() => {
            TaskTitle.create("     ");
        }).toThrow(TaskTitleTooShortError);
    });

    it("should throw if title is longer than 255 characters", () => {
        const longTitle = "a".repeat(256);

        expect(() => {
            TaskTitle.create(longTitle);
        }).toThrow(TaskTitleTooLongError);
    });
});
