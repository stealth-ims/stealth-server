import { format } from 'date-fns';

export function generateExportFilename(
  reportType: string,
  extension: 'csv' | 'xlsx' = 'csv',
) {
  const timestamp = format(new Date(), 'yyyy-MM-dd_HH:mm');
  return `Stealth_IMS_${reportType}_${timestamp}.${extension}`;
}
