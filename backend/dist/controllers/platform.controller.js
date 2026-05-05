"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlatformStats = getPlatformStats;
const db_1 = require("../config/db");
function checkDatabaseConnection(res) {
    const dbConnected = global.dbConnected || false;
    if (!dbConnected) {
        res.status(503).json({
            error: 'Database unavailable. Please check your DATABASE_URL configuration.',
            hint: 'For testing without a database, use mock endpoints.',
        });
        return false;
    }
    return true;
}
async function getPlatformStats(req, res) {
    if (!checkDatabaseConnection(res))
        return;
    try {
        const [totalWills, lockedWills] = await Promise.all([
            db_1.prisma.will.count(),
            db_1.prisma.will.findMany({
                where: {
                    isLocked: true,
                    feePaid: {
                        not: null,
                    },
                },
                select: {
                    feePaid: true,
                },
            }),
        ]);
        const totalPlatformFeesCollected = lockedWills
            .reduce((sum, will) => sum + BigInt(will.feePaid ?? '0'), 0n)
            .toString();
        return res.json({
            totalWills,
            totalPlatformFeesCollected,
        });
    }
    catch (error) {
        console.error('[PlatformController] Error fetching platform stats:', error);
        return res.status(500).json({ error: 'Failed to fetch platform stats' });
    }
}
