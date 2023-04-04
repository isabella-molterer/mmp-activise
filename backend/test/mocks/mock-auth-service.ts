export class MockAuthService {
    public createQueryBuilder = jest.fn(() => this.queryBuilder);  
    public storeRefreshToken  = jest.fn();
    public findUserByEmail = jest.fn();  
    public register = jest.fn();
    public login = jest.fn();  
    public authenticateUserByJwt = jest.fn();  
    public logout = jest.fn();  
    public getAccessTokenFromRefreshToken = jest.fn();  
    public renewTokenForUser = jest.fn();
    public checkPasswordForUser = jest.fn();
    public updatePasswordForUser = jest.fn();
    public changePassword = jest.fn();
    public resetPassword = jest.fn();
    public createMailOptions = jest.fn();
    public sendEmailForgotPassword = jest.fn();
  
    public queryBuilder = {
      register: jest.fn().mockReturnThis(),
      storeRefreshToken: jest.fn().mockReturnThis(),
      findUserByEmail: jest.fn().mockReturnThis(),
      login: jest.fn().mockReturnThis(),
      authenticateUserByJwt: jest.fn().mockReturnThis(),
      logout: jest.fn().mockReturnThis(),
      getAccessTokenFromRefreshToken: jest.fn().mockReturnThis(),
      renewTokenForUser: jest.fn().mockReturnThis(),
      checkPasswordForUser: jest.fn().mockReturnThis(),
      updatePasswordForUser: jest.fn().mockReturnThis(),
      changePassword: jest.fn().mockReturnThis(),
      resetPassword: jest.fn().mockReturnThis(),
      createMailOptions: jest.fn().mockReturnThis(),
      sendEmailForgotPassword: jest.fn().mockReturnThis(),
    };
  }
  