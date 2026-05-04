"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.web3EventService = exports.Web3EventService = void 0;
const approvalListener_1 = require("./approvalListener");
const effectivePullAmount_1 = require("./effectivePullAmount");
const monitor_1 = require("../jobs/monitor");
/**
 * Service to manage all Web3 event listeners and background jobs
 */
class Web3EventService {
    isRunning = false;
    /**
     * Start all services
     */
    async start() {
        if (this.isRunning) {
            console.warn('[Web3EventService] Services already running');
            return;
        }
        try {
            console.log('[Web3EventService] Starting all Web3 services...');
            // Start approval listener
            await approvalListener_1.approvalListener.start();
            // Start effective pull amount updater
            await effectivePullAmount_1.effectivePullAmountService.start();
            // Start fast inactivity monitor and alert engine
            await monitor_1.inactivityMonitorJob.start();
            this.isRunning = true;
            console.log('[Web3EventService] All Web3 services started successfully');
        }
        catch (error) {
            console.error('[Web3EventService] Failed to start services:', error);
            // Attempt cleanup
            await this.stop();
            throw error;
        }
    }
    /**
     * Stop all services gracefully
     */
    async stop() {
        console.log('[Web3EventService] Stopping all Web3 services...');
        try {
            approvalListener_1.approvalListener.stop();
            effectivePullAmount_1.effectivePullAmountService.stop();
            monitor_1.inactivityMonitorJob.stop();
            this.isRunning = false;
            console.log('[Web3EventService] All Web3 services stopped successfully');
        }
        catch (error) {
            console.error('[Web3EventService] Error stopping services:', error);
        }
    }
    /**
     * Check if services are running
     */
    isHealthy() {
        return this.isRunning;
    }
    getStatus() {
        return {
            running: this.isRunning,
            inactivityMonitor: monitor_1.inactivityMonitorJob.getStatus(),
        };
    }
}
exports.Web3EventService = Web3EventService;
// Export singleton instance
exports.web3EventService = new Web3EventService();
