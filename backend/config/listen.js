const listen = (app, port, name, { required = false } = {}) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`${name} running on port ${port}`);
      resolve(server);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (required) {
          console.error(`\n${name}: port ${port} is already in use.`);
          console.error('Stop the existing process first:');
          console.error(`  lsof -ti :${port} | xargs kill -9\n`);
          process.exit(1);
        }
        console.warn(`${name}: port ${port} already in use — skipping (may already be running)`);
        resolve(null);
      } else {
        console.error(`${name} failed to start:`, err.message);
        process.exit(1);
      }
    });
  });
};

module.exports = listen;
