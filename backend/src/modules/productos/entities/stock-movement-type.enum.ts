export enum StockMovementType {
  ENTRADA = 'ENTRADA',
  SALIDA = 'SALIDA',
  AJUSTE_POSITIVO = 'AJUSTE_POSITIVO',
  AJUSTE_NEGATIVO = 'AJUSTE_NEGATIVO',
  ANULACION_VENTA = 'ANULACION_VENTA',
}

export const ADJUSTMENT_REASONS = [
  'Merma',
  'Error de carga',
  'Diferencia física',
  'Producto vencido',
  'Otro',
] as const;

export type AdjustmentReason = (typeof ADJUSTMENT_REASONS)[number];
