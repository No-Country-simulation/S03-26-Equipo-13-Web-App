"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlowsModule = void 0;
const common_1 = require("@nestjs/common");
const bull_1 = require("@nestjs/bull");
const flows_controller_1 = require("./flows.controller");
const flows_service_1 = require("./flows.service");
const flows_processor_1 = require("./flows.processor");
const prisma_module_1 = require("../prisma/prisma.module");
const messages_module_1 = require("../messages/messages.module");
let FlowsModule = class FlowsModule {
};
exports.FlowsModule = FlowsModule;
exports.FlowsModule = FlowsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            messages_module_1.MessagesModule,
            bull_1.BullModule.registerQueue({ name: flows_processor_1.FLOWS_QUEUE }),
        ],
        controllers: [flows_controller_1.FlowsController],
        providers: [flows_service_1.FlowsService, flows_processor_1.FlowsProcessor],
        exports: [flows_service_1.FlowsService],
    })
], FlowsModule);
//# sourceMappingURL=flows.module.js.map