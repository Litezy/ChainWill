import { approvalListener } from './approvalListener';
import { effectivePullAmountService } from './effectivePullAmount';
import { factoryIndexer } from '../jobs/factory-indexer';
import { willIndexer } from '../jobs/will-indexer';

/**
 * Service to manage all Web3 event listeners and background jobs
 */
export class Web3EventService {
  private isRunning = false;

  /**
   * Start all services
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('[Web3EventService] Services already running');
      return;
    }

    try {
      console.log('[Web3EventService] Starting all Web3 services...');

      // Start factory indexer first so newly created wills are available for child listeners
      await factoryIndexer.start();

      // Start child will event indexer
      await willIndexer.start();

      // Start approval listener
      await approvalListener.start();

      // Start effective pull amount updater
      await effectivePullAmountService.start();

      // Start fast inactivity monitor and alert engine
      await inactivityMonitorJob.start();

      this.isRunning = true;
      console.log('[Web3EventService] All Web3 services started successfully');
    } catch (error) {
      console.error('[Web3EventService] Failed to start services:', error);
      // Attempt cleanup
      await this.stop();
      throw error;
    }
  }

  /**
   * Stop all services gracefully
   */
  async stop(): Promise<void> {
    console.log('[Web3EventService] Stopping all Web3 services...');

    try {
      approvalListener.stop();
      factoryIndexer.stop();
      willIndexer.stop();
      effectivePullAmountService.stop();
      inactivityMonitorJob.stop();
      this.isRunning = false;
      console.log('[Web3EventService] All Web3 services stopped successfully');
    } catch (error) {
      console.error('[Web3EventService] Error stopping services:', error);
    }
  }

  /**
   * Check if services are running
   */
  isHealthy(): boolean {
    return this.isRunning;
  }

  getStatus(): {
    running: boolean;
    inactivityMonitor: ReturnType<typeof inactivityMonitorJob.getStatus>;
  } {
    return {
      running: this.isRunning,
      inactivityMonitor: inactivityMonitorJob.getStatus(),
    };
  }
}

// Export singleton instance
export const web3EventService = new Web3EventService();
