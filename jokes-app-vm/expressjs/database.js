require("dotenv").config();
const mysql2 = require("mysql2/promise.js")

const { DB_HOST, DB_USER, DB_PASSWORD, DB_DATABASE, DB_PORT } = process.env;

const connectionConfig =
{
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    port: DB_PORT
};

const connectToDatabase = () =>
{
    return new Promise((res, rej) =>
    {
        const connection = mysql2.createConnection(connectionConfig)
        .then((connection) => 
        {
            console.log("Connected to the database.");
            res(connection);
        }).catch((error) =>
        {
            console.error("Error connecting to the database:", error);
            rej(error);
        });
    });
};

const queryDatabase = (query, user_input) => 
{
    console.log(`Executing query: ${query} with input: ${user_input}`);
    return new Promise(async (res, rej) =>
    {
        const connection = await connectToDatabase();

        try
        {
            const jokes = await connection.execute(query, user_input);
            console.log(jokes);
            res(jokes);
        }
        catch (error)
        {
            console.error("Error querying the database:", error);
            rej(error);
        }
        finally
        {
            connection.end();
        }
    });
}

module.exports = { queryDatabase };