export class MockTokenService {
    public createQueryBuilder = jest.fn(() => this.queryBuilder);
      
    public deleteTokenInDB = jest.fn();
    public createPayload = jest.fn();  
    public createToken = jest.fn();  
    public verifyToken = jest.fn();  
    public retrieveValidToken = jest.fn();  
    public extractTokenFromHeaders = jest.fn();  
    public createForgottenPasswordToken = jest.fn();
  
    public queryBuilder = {
        deleteTokenInDB: jest.fn().mockReturnThis(),
        createPayload: jest.fn().mockReturnThis(),
        createToken: jest.fn().mockReturnThis(),
        verifyToken: jest.fn().mockReturnThis(),
        retrieveValidToken: jest.fn().mockReturnThis(),
        extractTokenFromHeaders: jest.fn().mockReturnThis(),
        createForgottenPasswordToken: jest.fn().mockReturnThis(),
    };
  }
  