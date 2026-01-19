import 'dotenv/config';
import { createServer } from './server';

const PORT = process.env.PORT || 3002;

async function main() {
  const server = await createServer();

  server.listen(PORT, () => {
    console.log(`Ladrilho server running on port ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
