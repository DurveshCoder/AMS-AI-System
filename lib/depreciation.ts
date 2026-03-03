import type { Asset, AssetType, DepreciationRecord } from './types';
import { generateId } from './utils';

export function generateDepreciationForAsset(
  asset: Asset,
  assetType: AssetType
): DepreciationRecord[] {
  const records: DepreciationRecord[] = [];
  if (!asset.purchaseDate || !asset.purchasePrice) return records;

  const salvageValue = asset.purchasePrice * (assetType.salvageValuePercent / 100);
  const usefulMonths = assetType.usefulLifeYears * 12;
  let openingValue = asset.purchasePrice;
  let cumDep = 0;

  const startDate = new Date(asset.purchaseDate);
  const now = new Date();
  const totalMonthsElapsed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth()) + 1;

  const monthsToGenerate = Math.min(usefulMonths, Math.max(totalMonthsElapsed, usefulMonths));

  for (let m = 0; m < monthsToGenerate; m++) {
    const depDate = new Date(startDate.getFullYear(), startDate.getMonth() + m, 1);
    let depAmount = 0;

    if (assetType.depreciationMethod === 'STRAIGHT_LINE') {
      depAmount = (asset.purchasePrice - salvageValue) / usefulMonths;
    } else if (assetType.depreciationMethod === 'DECLINING_BALANCE') {
      const rate = 1 - Math.pow(salvageValue / asset.purchasePrice, 1 / assetType.usefulLifeYears);
      depAmount = (openingValue * rate) / 12;
    }

    const closingValue = Math.max(salvageValue, openingValue - depAmount);
    depAmount = openingValue - closingValue;
    cumDep += depAmount;

    records.push({
      id: generateId(),
      assetId: asset.id,
      year: depDate.getFullYear(),
      month: depDate.getMonth() + 1,
      openingValue: Math.round(openingValue * 100) / 100,
      depreciationAmount: Math.round(depAmount * 100) / 100,
      closingValue: Math.round(closingValue * 100) / 100,
      cumulativeDepreciation: Math.round(cumDep * 100) / 100,
      method: assetType.depreciationMethod,
    });

    openingValue = closingValue;
    if (openingValue <= salvageValue) break;
  }

  return records;
}

export function getCurrentBookValue(
  assetId: string,
  records: DepreciationRecord[]
): number {
  const assetRecords = records
    .filter((r) => r.assetId === assetId)
    .sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  // Find record for current month or the latest before it
  for (const rec of assetRecords) {
    if (rec.year < currentYear || (rec.year === currentYear && rec.month <= currentMonth)) {
      return rec.closingValue;
    }
  }

  // If no record found before now, return the first record's opening value
  if (assetRecords.length > 0) {
    return assetRecords[assetRecords.length - 1].openingValue;
  }

  return 0;
}

export function getDepreciationSummary(
  asset: Asset,
  assetType: AssetType | undefined,
  records: DepreciationRecord[]
) {
  const assetRecords = records.filter((r) => r.assetId === asset.id);
  if (!assetType || assetRecords.length === 0) {
    return {
      originalCost: asset.purchasePrice,
      currentBookValue: asset.currentValue,
      totalDepreciated: 0,
      remainingLifeMonths: 0,
      percentDepreciated: 0,
    };
  }

  const currentBookValue = getCurrentBookValue(asset.id, records);
  const totalDepreciated = asset.purchasePrice - currentBookValue;
  const salvageValue = asset.purchasePrice * (assetType.salvageValuePercent / 100);
  const depreciableAmount = asset.purchasePrice - salvageValue;
  const percentDepreciated = depreciableAmount > 0
    ? Math.min(100, (totalDepreciated / depreciableAmount) * 100)
    : 0;

  const startDate = new Date(asset.purchaseDate);
  const now = new Date();
  const monthsElapsed =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    (now.getMonth() - startDate.getMonth());
  const totalMonths = assetType.usefulLifeYears * 12;
  const remainingLifeMonths = Math.max(0, totalMonths - monthsElapsed);

  return {
    originalCost: asset.purchasePrice,
    currentBookValue: Math.round(currentBookValue * 100) / 100,
    totalDepreciated: Math.round(totalDepreciated * 100) / 100,
    remainingLifeMonths,
    percentDepreciated: Math.round(percentDepreciated * 100) / 100,
  };
}
