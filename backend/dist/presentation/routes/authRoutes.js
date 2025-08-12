"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const router = (0, express_1.Router)();
// Rota de login
router.post('/login', AuthController_1.AuthController.login);
// Rota para obter dados do usuário atual
router.get('/me', AuthController_1.AuthController.me);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map