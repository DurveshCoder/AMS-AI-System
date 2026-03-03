import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const types = await prisma.assetType.findMany({
            where: { organizationId: req.user!.organizationId },
            include: { brand: { select: { name: true } }, _count: { select: { assets: true } } },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: types });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const type = await prisma.assetType.create({
            data: { ...req.body, organizationId: req.user!.organizationId }
        });
        res.status(201).json({ success: true, data: type });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const type = await prisma.assetType.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: type });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const count = await prisma.asset.count({ where: { assetTypeId: req.params.id } });
        if (count > 0) return res.status(400).json({ success: false, error: `Cannot delete: ${count} assets linked` });
        await prisma.assetType.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

export default router;
