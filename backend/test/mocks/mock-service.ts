export class MockService<T> {
  public createQueryBuilder = jest.fn(() => this.queryBuilder);

  public findOneById = jest.fn();
  public findOneByEmail = jest.fn();
  public create = jest.fn();
  public update = jest.fn();
  public deleteOneById = jest.fn();
  public delete = jest.fn();
  public setPassword = jest.fn();
  public removeUnpublishedCourses = jest.fn();

  public queryBuilder = {
    findOneById: jest.fn().mockReturnThis(),
    findOneByEmail: jest.fn().mockReturnThis(),
    create: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    deleteOneById: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    setPassword: jest.fn().mockReturnThis(),
    removeUnpublishedCourses: jest.fn().mockReturnThis(),
  };
}
