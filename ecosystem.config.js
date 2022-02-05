module.exports = {
  apps : [{
    name: "efas-art",
    script: 'app.js',
    instances: '5',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }]
};
