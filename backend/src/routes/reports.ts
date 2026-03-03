import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import ExcelJS from 'exceljs';

const router = Router();
const prisma = new PrismaClient();
router.use(authenticate);

// Get report data
router.get('/:type', async (req: AuthRequest, res: Response) => {
    try {
        const orgId = req.user!.organizationId;
        const type = req.params.type;
        const format = req.query.format as string; // 'json' | 'excel'

        let data: any;
        let title = '';

        switch (type) {
            case 'asset-register':
                title = 'Asset Register Report';
                data = await prisma.asset.findMany({
                    where: { organizationId: orgId },
                    include: { branch: true, brand: true, supplier: true, assetType: true, assignedTo: { select: { name: true } } },
                    orderBy: { assetCode: 'asc' }
                });
                break;
            case 'asset-valuation':
                title = 'Asset Valuation Report';
                data = await prisma.asset.findMany({
                    where: { organizationId: orgId },
                    include: { branch: true, assetType: true },
                    orderBy: { currentValue: 'desc' }
                });
                break;
            case 'depreciation-schedule':
                title = 'Depreciation Schedule Report';
                data = await prisma.asset.findMany({
                    where: { organizationId: orgId },
                    include: { assetType: true, depreciationSchedule: { orderBy: [{ year: 'asc' }, { month: 'asc' }] } }
                });
                break;
            case 'maintenance-history':
                title = 'Maintenance History Report';
                data = await prisma.maintenanceLog.findMany({
                    where: { organizationId: orgId },
                    include: { asset: true, technician: { select: { name: true } } },
                    orderBy: { scheduledDate: 'desc' }
                });
                break;
            case 'inventory-stock':
                title = 'Inventory Stock Report';
                data = await prisma.inventoryRecord.findMany({
                    where: { asset: { organizationId: orgId } },
                    include: { asset: true, branch: true }
                });
                break;
            case 'asset-by-supplier':
                title = 'Asset by Supplier Report';
                data = await prisma.supplier.findMany({
                    where: { organizationId: orgId },
                    include: { assets: { include: { assetType: true } } }
                });
                break;
            case 'asset-by-brand':
                title = 'Asset by Brand Report';
                data = await prisma.brand.findMany({
                    where: { organizationId: orgId },
                    include: { assets: { include: { assetType: true } } }
                });
                break;
            case 'asset-by-branch':
                title = 'Asset by Location Report';
                data = await prisma.branch.findMany({
                    where: { organizationId: orgId },
                    include: { assets: { include: { assetType: true, brand: true } } }
                });
                break;
            case 'fully-depreciated':
                title = 'Fully Depreciated Assets';
                data = await prisma.asset.findMany({
                    where: { organizationId: orgId, currentValue: { lte: 0 } },
                    include: { assetType: true, branch: true }
                });
                break;
            case 'warranty-expiry':
                title = 'Warranty Expiry Report';
                const days = parseInt(req.query.days as string) || 90;
                data = await prisma.asset.findMany({
                    where: {
                        organizationId: orgId,
                        warrantyExpiryDate: {
                            lte: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
                            gte: new Date()
                        }
                    },
                    include: { brand: true, branch: true },
                    orderBy: { warrantyExpiryDate: 'asc' }
                });
                break;
            case 'audit-trail':
                title = 'Audit Trail Report';
                data = await prisma.auditLog.findMany({
                    where: { user: { organizationId: orgId } },
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' },
                    take: 500
                });
                break;
            case 'import-history':
                title = 'Import History Report';
                data = await prisma.importJob.findMany({
                    where: { organizationId: orgId },
                    include: { user: { select: { name: true } } },
                    orderBy: { createdAt: 'desc' }
                });
                break;
            default:
                return res.status(400).json({ success: false, error: 'Invalid report type' });
        }

        if (format === 'excel') {
            const workbook = new ExcelJS.Workbook();
            const ws = workbook.addWorksheet(title);

            if (Array.isArray(data) && data.length > 0) {
                const flatData = data.map((item: any) => {
                    const flat: any = {};
                    Object.entries(item).forEach(([k, v]) => {
                        if (v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof Date)) {
                            Object.entries(v as any).forEach(([k2, v2]) => {
                                if (typeof v2 !== 'object') flat[`${k}_${k2}`] = v2;
                            });
                        } else if (!(v && typeof v === 'object' && Array.isArray(v))) {
                            flat[k] = v;
                        }
                    });
                    return flat;
                });

                const headers = Object.keys(flatData[0]);
                ws.addRow(headers);
                const headerRow = ws.getRow(1);
                headerRow.font = { bold: true };
                headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
                headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

                flatData.forEach(row => ws.addRow(Object.values(row)));
                ws.columns.forEach(col => { col.width = 18; });
            }

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-report.xlsx`);
            await workbook.xlsx.write(res);
            return res.end();
        }

        res.json({ success: true, data, title });
    } catch (error) {
        console.error('Report error:', error);
        res.status(500).json({ success: false, error: 'Server error' });
    }
});

export default router;
