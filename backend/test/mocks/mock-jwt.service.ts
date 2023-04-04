export class MockJwtService {
    public createQueryBuilder = jest.fn(() => this.queryBuilder);
        
    public sign = jest.fn();
    public verify = jest.fn();  

    public queryBuilder = {
        sign: jest.fn().mockReturnThis(),
        verify: jest.fn().mockReturnThis(),
    };
}
  