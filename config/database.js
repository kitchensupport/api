export default {
      host: process.env.CS307_DB_HOST,
      port: process.env.CS307_DB_PORT,
      user: process.env.CS307_DB_USER,
      password: process.env.CS307_DB_PASSWORD,
      database: process.env.NODE_ENV.toLowerCase() === 'production' ? 'ddcuonfs99l7rg' : 'ddcuonfs99l7rg'
  };