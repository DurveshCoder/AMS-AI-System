import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// List inventory
router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;
        const branchId = req.query.branchId as string;
        const where: any = { asset: { organizationId: orgId } };
        if (branchId) where.branchId = branchId;

        const records = await prisma.inventoryRecord.findMany({
            where,
            include: {
                asset: { select: { id: true, name: true, assetCode: true, status: true } },
                branch: { select: { id: true, name: true } }
            },
            orderBy: { updatedAt: 'desc' }
        });

        // Summary stats
        const totalSkus = records.length;
        const totalStockValue = records.reduce((sum, r) => sum + r.quantity, 0);
        const lowStock = records.filter(r => r.quantity <= r.minStockLevel).length;
        const outOfStock = records.filter(r => r.quantity === 0).length;

        res.json({
            success: true,
            data: records,
            summary: { totalSkus, totalStockValue, lowStock, outOfStock }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

// Adjust stock
router.put('/:id/adjust', async (req: AuthRequest, res: Response) => {
    try {
        const { quantity, notes } = req.body;
        const record = await prisma.inventoryRecord.update({
            where: { id: req.params.id },
            data: {
                quantity: parseInt(quantity),
                notes,
                lastAuditDate: new Date(),
                auditedBy: req.user!.name
            },
            include: {
                asset: { select: { name: true } },
                branch: { select: { name: true } }
            }
        });
        res.json({ success: true, data: record });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
