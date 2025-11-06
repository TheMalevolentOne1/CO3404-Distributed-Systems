require("dotenv").config();
const mysql2 = require("mysql2/promise.js")

const connectionConfig =
{
   host: process.env.DB_HOST,
   user: process.env.DB_USER,
   password: process.env.DB_PASSWORD,
   database: process.env.DB_DATABASE
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
    return new Promise(async (res, rej) =>
    {
        const connection = await connectToDatabase();

        try
        {
            const jokes = await connection.execute(query, user_input);
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

module.exports = { connectToDatabase, queryDatabase };