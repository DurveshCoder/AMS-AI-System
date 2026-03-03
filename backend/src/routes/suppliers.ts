import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const suppliers = await prisma.supplier.findMany({
            where: { organizationId: req.user!.organizationId },
            include: { _count: { select: { assets: true } } },
            orderBy: { companyName: 'asc' }
        });
        res.json({ success: true, data: suppliers });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: req.params.id },
            include: { assets: { include: { assetType: true, brand: true } }, _count: { select: { assets: true } } }
        });
        if (!supplier) return res.status(404).json({ success: false, error: 'Not found' });

        const totalValue = await prisma.asset.aggregate({
            where: { supplierId: req.params.id },
            _sum: { purchasePrice: true }
        });

        res.json({ success: true, data: { ...supplier, totalAssetValue: totalValue._sum.purchasePrice || 0 } });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const supplier = await prisma.supplier.create({
            data: { ...req.body, organizationId: req.user!.organizationId }
        });
        res.status(201).json({ success: true, data: supplier });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const supplier = await prisma.supplier.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: supplier });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const assetCount = await prisma.asset.count({ where: { supplierId: req.params.id } });
        if (assetCount > 0) return res.status(400).json({ success: false, error: `Cannot delete: ${assetCount} assets linked` });
        await prisma.supplier.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

export default router;
