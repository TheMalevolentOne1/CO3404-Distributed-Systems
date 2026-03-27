require('dotenv').config();
const mysql2 = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');

// Database connection configuration
const connectionConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
};

// Function to connect to database
const connectToDatabase = async () => {
    try {
        const connection = await mysql2.createConnection(connectionConfig);
        console.log('✓ Connected to the database successfully');
        return connection;
    } catch (error) {
        console.error('✗ Error connecting to the database:', error.message);
        throw error;
    }
};

// Function to read and parse jokes.json file
const readJokesFile = async () => {
    try {
        const filePath = path.join(__dirname, 'jokes.json');
        console.log('📖 Reading jokes from:', filePath);
        
        const data = await fs.readFile(filePath, 'utf8');
        const jokes = JSON.parse(data);
        
        console.log(`✓ Successfully loaded ${jokes.length} jokes from file`);
        return jokes;
    } catch (error) {
        console.error('✗ Error reading jokes file:', error.message);
        throw error;
    }
};

// Function to get unique joke types
const getUniqueTypes = (jokes) => {
    const types = [...new Set(jokes.map(joke => joke.type))];
    console.log(`📝 Found ${types.length} unique joke types:`, types);
    return types;
};

// Function to populate types table
const populateTypes = async (connection, types) => {
    try {
        console.log('🔄 Populating types table...');
        
        // Clear existing types (optional - remove if you want to keep existing data)
        await connection.execute('DELETE FROM types');
        console.log('  - Cleared existing types');
        
        // Insert each type
        const insertTypeQuery = 'INSERT INTO types (type_name) VALUES (?)';
        let insertedCount = 0;
        
        for (const type of types) {
            try {
                await connection.execute(insertTypeQuery, [type]);
                insertedCount++;
                console.log(`  - Inserted type: ${type}`);
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    console.log(`  - Type '${type}' already exists, skipping`);
                } else {
                    console.error(`  - Error inserting type '${type}':`, error.message);
                }
            }
        }
        
        console.log(`✓ Successfully inserted ${insertedCount} types`);
        
        // Get type mappings for reference
        const [typeRows] = await connection.execute('SELECT id, type_name FROM types');
        const typeMap = {};
        typeRows.forEach(row => {
            typeMap[row.type_name] = row.id;
        });
        
        return typeMap;
    } catch (error) {
        console.error('✗ Error populating types table:', error.message);
        throw error;
    }
};

// Function to populate jokes table
const populateJokes = async (connection, jokes, typeMap) => {
    try {
        console.log('🔄 Populating jokes table...');
        
        // Clear existing jokes (optional - remove if you want to keep existing data)
        await connection.execute('DELETE FROM jokes');
        console.log('  - Cleared existing jokes');
        
        // Insert each joke
        const insertJokeQuery = 'INSERT INTO jokes (setup, punchline, type_id) VALUES (?, ?, ?)';
        let insertedCount = 0;
        let errorCount = 0;
        
        for (const joke of jokes) {
            try {
                const typeId = typeMap[joke.type];
                
                if (!typeId) {
                    console.error(`  - Error: Type '${joke.type}' not found in types table`);
                    errorCount++;
                    continue;
                }
                
                await connection.execute(insertJokeQuery, [joke.setup, joke.punchline, typeId]);
                insertedCount++;
                
                // Log progress every 100 jokes
                if (insertedCount % 100 === 0) {
                    console.log(`  - Inserted ${insertedCount} jokes...`);
                }
            } catch (error) {
                console.error(`  - Error inserting joke ID ${joke.id}:`, error.message);
                errorCount++;
            }
        }
        
        console.log(`✓ Successfully inserted ${insertedCount} jokes`);
        if (errorCount > 0) {
            console.log(`⚠ ${errorCount} jokes had errors and were skipped`);
        }
        
    } catch (error) {
        console.error('✗ Error populating jokes table:', error.message);
        throw error;
    }
};

// Function to verify the population
const verifyPopulation = async (connection) => {
    try {
        console.log('🔍 Verifying database population...');
        
        // Count types
        const [typeCountResult] = await connection.execute('SELECT COUNT(*) as count FROM types');
        const typeCount = typeCountResult[0].count;
        
        // Count jokes
        const [jokeCountResult] = await connection.execute('SELECT COUNT(*) as count FROM jokes');
        const jokeCount = jokeCountResult[0].count;
        
        // Count jokes by type
        const [jokesByType] = await connection.execute(`
            SELECT t.type_name, COUNT(j.id) as joke_count 
            FROM types t 
            LEFT JOIN jokes j ON t.id = j.type_id 
            GROUP BY t.id, t.type_name 
            ORDER BY joke_count DESC
        `);
        
        console.log('📊 Database Statistics:');
        console.log(`  - Total types: ${typeCount}`);
        console.log(`  - Total jokes: ${jokeCount}`);
        console.log('  - Jokes by type:');
        jokesByType.forEach(row => {
            console.log(`    • ${row.type_name}: ${row.joke_count} jokes`);
        });
        
    } catch (error) {
        console.error('✗ Error verifying population:', error.message);
        throw error;
    }
};

// Main function to orchestrate the population process
const populateDatabase = async () => {
    let connection = null;
    
    try {
        console.log('🚀 Starting database population process...\n');
        
        // Step 1: Read jokes from file
        const jokes = await readJokesFile();
        
        // Step 2: Get unique types
        const uniqueTypes = getUniqueTypes(jokes);
        
        // Step 3: Connect to database
        connection = await connectToDatabase();
        
        // Step 4: Populate types table
        const typeMap = await populateTypes(connection, uniqueTypes);
        
        // Step 5: Populate jokes table
        await populateJokes(connection, jokes, typeMap);
        
        // Step 6: Verify population
        await verifyPopulation(connection);
        
        console.log('\n🎉 Database population completed successfully!');
        
    } catch (error) {
        console.error('\n❌ Database population failed:', error.message);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔓 Database connection closed');
        }
    }
};

// Run the population if this script is executed directly
if (require.main === module) {
    populateDatabase();
}