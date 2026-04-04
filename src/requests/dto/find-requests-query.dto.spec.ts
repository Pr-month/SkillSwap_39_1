import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { FindRequestsQueryDto } from './find-requests-query.dto';

describe('FindRequestsQueryDto', () => {
  it('должен преобразовывать строковые query-параметры в числа', async () => {
    const dto = plainToInstance(FindRequestsQueryDto, {
      page: '2',
      limit: '5',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
    expect(dto.page).toBe(2);
    expect(dto.limit).toBe(5);
  });

  it('должен возвращать ошибку при некорректных значениях query-параметров', async () => {
    const dto = plainToInstance(FindRequestsQueryDto, {
      page: '0',
      limit: '101',
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(2);
  });
});
