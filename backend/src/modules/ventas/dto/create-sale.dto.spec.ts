import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateSaleDto } from './create-sale.dto';

const validItem = { producto_id: 1, quantity: 2, unit_price: 500 };

describe('CreateSaleDto', () => {
  describe('payment_method', () => {
    it('falla la validación cuando falta payment_method', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeDefined();
    });

    it('falla la validación cuando payment_method tiene un valor fuera del enum', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'bitcoin',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeDefined();
    });

    it('acepta payment_method con valor válido cash', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeUndefined();
    });

    it('acepta payment_method con valor válido transfer', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'transfer',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeUndefined();
    });

    it('acepta payment_method con valor válido debit', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'debit',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeUndefined();
    });

    it('acepta payment_method con valor válido credit', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'credit',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'payment_method');
      expect(field).toBeUndefined();
    });
  });

  describe('discount_percent', () => {
    it('acepta el DTO sin discount_percent (opcional, default 0)', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'discount_percent');
      expect(field).toBeUndefined();
    });

    it('acepta discount_percent en 0', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
        discount_percent: 0,
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'discount_percent');
      expect(field).toBeUndefined();
    });

    it('acepta discount_percent en 100', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
        discount_percent: 100,
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'discount_percent');
      expect(field).toBeUndefined();
    });

    it('rechaza discount_percent menor a 0', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
        discount_percent: -1,
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'discount_percent');
      expect(field).toBeDefined();
    });

    it('rechaza discount_percent mayor a 100', async () => {
      const dto = plainToInstance(CreateSaleDto, {
        items: [validItem],
        payment_method: 'cash',
        discount_percent: 101,
      });
      const errors = await validate(dto);
      const field = errors.find((e) => e.property === 'discount_percent');
      expect(field).toBeDefined();
    });
  });
});
