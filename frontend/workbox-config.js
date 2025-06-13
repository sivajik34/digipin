module.exports = {
    globDirectory: 'build/',
    globPatterns: [
      '**/*.{js,css,html,png,jpg,json,svg,ico}'
    ],
    swDest: 'build/service-worker.js',
    clientsClaim: true,
    skipWaiting: true,
  };
  