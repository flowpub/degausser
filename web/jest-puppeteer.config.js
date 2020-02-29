module.exports = {
  server: {
    command: 'npm run static',
  },
  launch: {
    headless: process.env.HEADLESS !== 'false',
  },
}