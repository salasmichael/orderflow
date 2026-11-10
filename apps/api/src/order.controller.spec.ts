import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { PriceCalculator } from './price-calculator';
import { ORDER_REPOSITORY } from './order.repository';
import { NOTIFICATION_SENDER } from './notification-sender';
import { BlackFridayDiscount } from './black-friday.discount';


describe('OrderController (validation)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrderController],
      providers: [
        OrderService,
        {
          provide: PriceCalculator,
          useValue: new PriceCalculator([new BlackFridayDiscount()]),
        },
        { provide: ORDER_REPOSITORY, useValue: { save: async () => {} } },
        {
          provide: NOTIFICATION_SENDER,
          useValue: { sendOrderCreated: async () => {} },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a valid order', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        email: 'test@example.com',
        coupon: 'BLACKFRIDAY',
        items: [{ productId: 'p1', priceInCents: 100, quantity: 2 }],
      })
      .expect(201)
      .expect({ total: 140 });
  });

  it('rejects an empty items list', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({ email: 'test@example.com', items: [] })
      .expect(400);
  });

  it('rejects an invalid email', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        email: 'not-an-email',
        items: [{ productId: 'p1', priceInCents: 100, quantity: 1 }],
      })
      .expect(400);
  });

  it('rejects a negative price', async () => {
    await request(app.getHttpServer())
      .post('/orders')
      .send({
        email: 'test@example.com',
        items: [{ productId: 'p1', priceInCents: -5, quantity: 1 }],
      })
      .expect(400);
  });
});