require("dotenv").config();
const mysql2 = require("mysql2/promise.js")

// Load database connection details from environment variables
const { MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE, MYSQL_PORT } = process.env;

// Database connection configuration
const connectionConfig =
{
    host: MYSQL_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
    port: MYSQL_PORT
};

/*
Brief: Connects to MySQL Database using connectionConfig.

@Returns: Connection Object
@ReturnT: Promise<Connection>
@ReturnF: Promise<Error>
*/
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

/*
Brief: Executes a query on the database with the provided user input.

@Params1: query - The SQL query to execute, with placeholders for user input.
@Params2: user_input - The user input to be safely inserted into the query.

@Returns: Query Result
@ReturnT: Promise<QueryResult>
@ReturnF: Promise<Error>
*/
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

module.exports = { queryDatabase };