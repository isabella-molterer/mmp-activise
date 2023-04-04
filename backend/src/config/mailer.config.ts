export default () => ({
  mail: {
    host: 'mail.gmx.net',
    port: 587,
    secure: false,
    auth: {
      user: process.env.GMX_USER,
      pass: process.env.GMX_PASS,
    },
    tls: {
      ciphers: 'SSLv3',
    },
    debug: true,
  },

  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',
});
