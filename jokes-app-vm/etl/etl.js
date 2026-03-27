const express = require('express');
const amqp = require('amqplib');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors())

const PORT = process.env.ETL_PORT || 3002;
const DB_TYPE = process.env.DB_TYPE || 'MYSQL';
const MYSQL_MODULE = process.env.MYSQL_MODULE || './mysql-database-fns';
const MONGO_MODULE = process.env.MONGO_MODULE || './mongo-database-fns';
const RMQ_HOST = process.env.RMQ_HOST || 'localhost';
const QUEUE_NAME = process.env.QUEUE_NAME || 'jokes-queue';

const db = (DB_TYPE === 'MYSQL') ? require(`${MYSQL_MODULE}`) : require(`${MONGO_MODULE}`);

let gChannel = null;
let gConnection = null;

// Check endpoint
app.get('/', (req, res) => {
  res.send('ETL Service is running');
});

// Retrieve pending messages from queue without consuming
app.get('/queue-status', async (req, res) => {
  try {
    if (!gChannel) {
      return res.status(500).json({ error: 'Not connected to RabbitMQ' });
    }
    const queue = await gChannel.assertQueue(QUEUE_NAME, { durable: true });
    res.json({ 
      queue: QUEUE_NAME,
      messageCount: queue.messageCount,
      consumerCount: queue.consumerCount
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Process a single message manually
app.post('/process-message', async (req, res) => {
  try {
    if (!gChannel) {
      return res.status(500).json({ error: 'Not connected to RabbitMQ' });
    }
    
    const message = await gChannel.get(QUEUE_NAME);
    if (!message) {
      return res.json({ message: 'No messages in queue' });
    }

    const content = JSON.parse(message.content.toString());
    await insertJoke(content);
    gChannel.ack(message);
    
    res.json({ success: true, payload: content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Insert joke and type into database
async function insertJoke(payload) {
  const { setup, punchline, type } = payload;

  if (!setup || !punchline || !type) {
    throw new Error('Missing required fields: setup, punchline, type');
  }

  try {
    if (DB_TYPE === 'MYSQL') {
      await db.insertJoke(setup, punchline, type);
    } else {
      await db.insertJoke({ setup, punchline, type });
    }
    console.log(`✓ Inserted joke: "${setup.substring(0, 30)}..."`);
  } catch (err) {
    console.error(`Failed to insert joke: ${err.message}`);
    throw err;
  }
}

// Continuous message listener
async function startMsgListener(channel, queue) {
  console.log(`Listening for messages on queue: ${queue}`);
  
  channel.consume(queue, async (msg) => {
    if (msg) {
      try {
        const content = JSON.parse(msg.content.toString());
        console.log('Received message:', content);
        await insertJoke(content);
        channel.ack(msg);
      } catch (err) {
        console.error('Error processing message:', err.message);
        channel.nack(msg, false, true); // Requeue on error
      }
    }
  });
}

// Connect to RabbitMQ and start consuming
async function connectRabbitMQ() {
  try {
    const rmqURL = `amqp://guest:guest@${RMQ_HOST}:5672`;
    gConnection = await amqp.connect(rmqURL);
    gChannel = await gConnection.createChannel();
    
    await gChannel.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Connected to RabbitMQ at ${RMQ_HOST}`);
    console.log(`Queue "${QUEUE_NAME}" ready`);
    
    // Uncomment to enable continuous listening, or use /process-message endpoint for manual processing
    // startMsgListener(gChannel, QUEUE_NAME);
    
  } catch (err) {
    console.error(`Failed to connect to RabbitMQ: ${err.message}`);
    console.log('Retrying in 5 seconds...');
    setTimeout(connectRabbitMQ, 5000);
  }
}

// Verify database connection
async function checkDbConnected() {
  try {
    const dbName = await db.isConnected();
    console.log(`✓ Connected to ${DB_TYPE}: ${dbName}`);
  } catch (err) {
    console.error(`Failed to connect to database: ${err.message}`);
    process.exit(1);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`ETL Service listening on port ${PORT}`);
  checkDbConnected();
  connectRabbitMQ();
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\nShutting down...');
  if (gChannel) await gChannel.close();
  if (gConnection) await gConnection.close();
  process.exit(0);
});