"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessagesModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const messages_controller_1 = require("./messages.controller");
const messages_service_1 = require("./messages.service");
const messages_gateway_1 = require("./messages.gateway");
const whatsapp_api_service_1 = require("./whatsapp-api.service");
const prisma_module_1 = require("../prisma/prisma.module");
let MessagesModule = class MessagesModule {
};
exports.MessagesModule = MessagesModule;
exports.MessagesModule = MessagesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, config_1.ConfigModule],
        controllers: [messages_controller_1.MessagesController],
        providers: [messages_service_1.MessagesService, messages_gateway_1.MessagesGateway, whatsapp_api_service_1.WhatsappApiService],
        exports: [messages_service_1.MessagesService, messages_gateway_1.MessagesGateway, whatsapp_api_service_1.WhatsappApiService],
    })
], MessagesModule);
//# sourceMappingURL=messages.module.js.map