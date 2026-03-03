import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// Depreciation summary
router.get('/summary', async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;
        const assets = await prisma.asset.findMany({
            where: { organizationId: orgId },
            include: {
                assetType: true,
                depreciationSchedule: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 1 }
            }
        });

        const totalAccumulated = assets.reduce((sum, a) => {
            const latestDep = a.depreciationSchedule[0];
            return sum + (latestDep?.cumulativeDepreciation || 0);
        }, 0);

        const netBookValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
        const fullyDepreciated = assets.filter(a => a.currentValue <= 0).length;

        const now = new Date();
        const thisMonth = await prisma.depreciationSchedule.aggregate({
            where: {
                asset: { organizationId: orgId },
                year: now.getFullYear(),
                month: now.getMonth() + 1
            },
            _sum: { depreciationAmount: true }
        });

        const assetDepreciationList = assets.map(a => {
            const latestDep = a.depreciationSchedule[0];
            const accumulated = latestDep?.cumulativeDepreciation || 0;
            const remaining = a.assetType ? a.assetType.usefulLifeYears - (accumulated > 0 ? Math.floor(accumulated / (a.purchasePrice / (a.assetType.usefulLifeYears || 1))) : 0) : 0;

            return {
                id: a.id,
                name: a.name,
                assetCode: a.assetCode,
                method: a.assetType?.depreciationMethod || 'STRAIGHT_LINE',
                purchasePrice: a.purchasePrice,
                accumulatedDepreciation: accumulated,
                netBookValue: a.currentValue,
                remainingLife: Math.max(0, remaining),
                percentDepreciated: a.purchasePrice > 0 ? Math.min(100, (accumulated / a.purchasePrice) * 100) : 0
            };
        });

        res.json({
            success: true,
            data: {
                summary: {
                    totalAccumulatedDepreciation: totalAccumulated,
                    netBookValue,
                    fullyDepreciated,
                    depreciationThisMonth: thisMonth._sum.depreciationAmount || 0
                },
                assets: assetDepreciationList
            }
        });
    } catch (error) {
        console.error('Depreciation summary error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Get asset depreciation schedule
router.get('/:assetId/schedule', async (req: AuthRequest, res: Response) => {
    try {
        const schedules = await prisma.depreciationSchedule.findMany({
            where: { assetId: req.params.assetId },
            orderBy: [{ year: 'asc' }, { month: 'asc' }]
        });
        const asset = await prisma.asset.findUnique({
            where: { id: req.params.assetId },
            select: { name: true, purchasePrice: true, currentValue: true, assetType: true }
        });
        res.json({ success: true, data: { asset, schedules } });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Run monthly depreciation
router.post('/run-monthly', async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;

        const assets = await prisma.asset.findMany({
            where: { organizationId: orgId, status: 'ACTIVE', purchasePrice: { gt: 0 }, currentValue: { gt: 0 } },
            include: { assetType: true, depreciationSchedule: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 1 } }
        });

        let processed = 0;
        for (const asset of assets) {
            if (!asset.assetType) continue;

            // Check if already depreciated this month
            const existing = await prisma.depreciationSchedule.findFirst({
                where: { assetId: asset.id, year, month }
            });
            if (existing) continue;

            const latestDep = asset.depreciationSchedule[0];
            const openingValue = latestDep ? latestDep.closingValue : asset.purchasePrice;
            const salvageValue = asset.purchasePrice * (asset.assetType.salvageValuePercent / 100);

            if (openingValue <= salvageValue) continue;

            let depAmount = 0;
            const method = asset.assetType.depreciationMethod;

            if (method === 'STRAIGHT_LINE') {
                const annualDep = (asset.purchasePrice - salvageValue) / asset.assetType.usefulLifeYears;
                depAmount = annualDep / 12;
            } else if (method === 'DECLINING_BALANCE') {
                const rate = 1 - Math.pow(salvageValue / asset.purchasePrice, 1 / asset.assetType.usefulLifeYears);
                depAmount = (openingValue * rate) / 12;
            } else {
                depAmount = (asset.purchasePrice - salvageValue) / (asset.assetType.usefulLifeYears * 12);
            }

            const closingValue = Math.max(salvageValue, openingValue - depAmount);
            depAmount = openingValue - closingValue;
            const cumDep = (latestDep?.cumulativeDepreciation || 0) + depAmount;

            await prisma.depreciationSchedule.create({
                data: {
                    assetId: asset.id,
                    year,
                    month,
                    openingValue,
                    depreciationAmount: depAmount,
                    closingValue,
                    cumulativeDepreciation: cumDep,
                    method,
                    rate: method === 'DECLINING_BALANCE' ? (1 - Math.pow(salvageValue / asset.purchasePrice, 1 / asset.assetType.usefulLifeYears)) * 100 : (100 / asset.assetType.usefulLifeYears)
                }
            });

            await prisma.asset.update({ where: { id: asset.id }, data: { currentValue: closingValue } });
            processed++;
        }

        res.json({ success: true, data: { processed, month: `${year}-${String(month).padStart(2, '0')}` } });
    } catch (error) {
        console.error('Monthly depreciation error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
