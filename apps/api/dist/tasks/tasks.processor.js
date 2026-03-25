"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var TasksProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksProcessor = exports.TASKS_QUEUE = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
exports.TASKS_QUEUE = 'tasks';
let TasksProcessor = TasksProcessor_1 = class TasksProcessor {
    logger = new common_1.Logger(TasksProcessor_1.name);
    async handleReminder(job) {
        const { taskId, title, assignedToId } = job.data;
        this.logger.log(`Reminder fired — task "${title}" (${taskId}) for user ${assignedToId ?? 'unassigned'}`);
    }
};
exports.TasksProcessor = TasksProcessor;
__decorate([
    (0, bull_1.Process)('reminder'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TasksProcessor.prototype, "handleReminder", null);
exports.TasksProcessor = TasksProcessor = TasksProcessor_1 = __decorate([
    (0, bull_1.Processor)(exports.TASKS_QUEUE)
], TasksProcessor);
//# sourceMappingURL=tasks.processor.js.map