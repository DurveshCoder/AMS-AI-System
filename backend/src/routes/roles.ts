import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPermissionMatrix } from '../middleware/permissions';

const router = Router();
router.use(authenticate);

router.get('/', async (_req: AuthRequest, res: Response) => {
    try {
        const matrix = getPermissionMatrix();
        const roles = ['ADMIN', 'MANAGER', 'TECHNICIAN', 'VIEWER'];
        const features = ['dashboard', 'assets', 'inventory', 'maintenance', 'depreciation',
            'reports', 'asset-types', 'brands', 'suppliers', 'roles', 'settings', 'import', 'users'];
        res.json({ success: true, data: { matrix, roles, features } });
    } catch (error) { res.status(500).json({ success: false, error: 'Server error' }); }
});

export default router;
