export class MockUserTokenService {
    public createQueryBuilder = jest.fn(() => this.queryBuilder);
      
    public findOneByToken = jest.fn();
    public checkForExistingToken = jest.fn();  
    public create = jest.fn();  
    public delete = jest.fn();  
  
    public queryBuilder = {
        findOneByToken: jest.fn().mockReturnThis(),
        checkForExistingToken: jest.fn().mockReturnThis(),
        create: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
     };
  }
  