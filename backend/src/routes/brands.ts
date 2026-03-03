import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
    try {
        const brands = await prisma.brand.findMany({
            where: { organizationId: req.user!.organizationId },
            include: { _count: { select: { assets: true, assetTypes: true } } },
            orderBy: { name: 'asc' }
        });
        res.json({ success: true, data: brands });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const brand = await prisma.brand.findUnique({
            where: { id: req.params.id },
            include: { assets: { include: { assetType: true } }, _count: { select: { assets: true } } }
        });
        if (!brand) return res.status(404).json({ success: false, error: 'Not found' });
        res.json({ success: true, data: brand });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.post('/', async (req: AuthRequest, res: Response) => {
    try {
        const brand = await prisma.brand.create({
            data: { ...req.body, organizationId: req.user!.organizationId }
        });
        res.status(201).json({ success: true, data: brand });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const brand = await prisma.brand.update({ where: { id: req.params.id }, data: req.body });
        res.json({ success: true, data: brand });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
    try {
        const assetCount = await prisma.asset.count({ where: { brandId: req.params.id } });
        if (assetCount > 0) return res.status(400).json({ success: false, error: `Cannot delete: ${assetCount} assets linked` });
        await prisma.brand.delete({ where: { id: req.params.id } });
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

export default router;
