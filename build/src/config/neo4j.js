"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.session = exports.driver = void 0;
const neo4j_driver_1 = __importDefault(require("neo4j-driver"));
const driver = neo4j_driver_1.default.driver('neo4j+s://b641f24a.databases.neo4j.io', 
// 'bolt://127.0.0.1:7687',
neo4j_driver_1.default.auth.basic('neo4j', '8n2HGgKPToBlAoVr1GlTD2ry4Ue9yH3kCH60fUgeO20'));
exports.driver = driver;
driver.getServerInfo().then(serverInfo => {
    console.log("serverInfo----", serverInfo);
}).catch(error => {
    console.error("Error getting server info:", error);
});
const session = driver.session({ database: 'neo4j' });
exports.session = session;
