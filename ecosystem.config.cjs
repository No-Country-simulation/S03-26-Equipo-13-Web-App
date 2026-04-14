module.exports = {
  apps: [
    {
      name: 'crm-api',
      cwd: '/var/www/S03-26-Equipo-13-Web-App/apps/api',
      script: 'node',
      args: 'dist/main.js',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3003,
        DATABASE_URL: 'postgresql://crmuser:crmpass2024@172.18.0.4:5432/startupcrm',
        REDIS_HOST: '127.0.0.1',
        REDIS_PORT: '6379',
      },
    },
    {
      name: 'crm-web',
      cwd: '/var/www/S03-26-Equipo-13-Web-App/apps/web',
      script: '/var/www/S03-26-Equipo-13-Web-App/node_modules/.bin/next',
      args: 'start --port 3002',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M',
      env_production: {
        NODE_ENV: 'production',
        PORT: 3002,
        NEXT_PUBLIC_API_URL: 'https://api.vigu.blog',
      },
    },
  ],
};
