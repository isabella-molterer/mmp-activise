export class MockRepository<T> {
    public createQueryBuilder = jest.fn(() => this.queryBuilder);

    public manager = { transaction: a => Promise.resolve(a()) };
    public metadata = { connection: { options: { type: null } }, columns: [], relations: [] }

    public create = jest.fn();
    public save = jest.fn();
    public delete = jest.fn();
    public update = jest.fn();
    public findOne = jest.fn();
    public findOneOrFail = jest.fn();
    public find = jest.fn();
    public getMany = jest.fn();
    public getOne = jest.fn();
    public getManyBase = jest.fn();
    public getOneBase = jest.fn();

    public queryBuilder = {
      offset: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      addFrom: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
      getMany: jest.fn(),
      getManyBase: jest.fn(),
      getOne: jest.fn(),
      getOneBase: jest.fn(),
      delete: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnThis()
    };
  }
