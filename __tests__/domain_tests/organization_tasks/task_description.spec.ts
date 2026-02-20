import { TaskDescription } from "../../../src/modules/organization_task/domain/task_description.js";
import {
    TaskDescriptionTooLongError,
    TaskDescriptionTooShortError,
} from "../../../src/modules/organization_task/errors/task_description_errors.js";

describe("TaskDescription (domain)", () => {

    it("should create task description with valid value", () => {
        const desc = TaskDescription.create("Some description");

        expect(desc).toBeInstanceOf(TaskDescription);
        expect(desc.getValue()).toBe("Some description");
    });

    it("should trim description value", () => {
        const desc = TaskDescription.create("   Some description   ");

        expect(desc.getValue()).toBe("Some description");
    });

    it("should throw if description is empty", () => {
        expect(() => {
            TaskDescription.create("");
        }).toThrow(TaskDescriptionTooShortError);
    });

    it("should throw if description contains only spaces", () => {
        expect(() => {
            TaskDescription.create("     ");
        }).toThrow(TaskDescriptionTooShortError);
    });

    it("should throw if description is longer than 500 characters", () => {
        const longDesc = "a".repeat(501);

        expect(() => {
            TaskDescription.create(longDesc);
        }).toThrow(TaskDescriptionTooLongError);
    });
});
