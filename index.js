const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/flavors')
const app = express()


app.use(express.json())
app.use(require('morgan')('dev'))

app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
        SELECT * from flavors ORDER;
        `
        const result = await client.query(SQL)
        res.send(result.rows[0])
    } catch (ex) {
        next(ex)
    }
});

app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        SELECT flavor FROM flavors WHERE id = 1;
        `
        const result = await client.query(SQL)
        res.send(result.rows[0])
    } catch (ex) {
        next(ex)
    }
});

app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `INSERT INTO flavors(flovor, order_number)
        VALUES ($1, $2)
        RETURNING *`
        const result = await client.query(SQL, [req.body.flavor, req.body.order_number])
        res.send(result.rows[0])
    } catch (ex) {
        next(ex)
    }
});

app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE FROM flavors
        WHERE id = $1;
      `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }
})

app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `UPDATE flavors
        SET flavor = $1, order_number = $2, updated_at=now()
        WHERE id = $3 RETURNING *`
        const result = await client.query(SQL, [req.body.flavor, req.body.order_number, req.params.id])
        res.send(result.rows[0])
    } catch (ex) {
        next(ex)
    }
})

const init = async () => {
    await client.connect();
    console.log('connected to database')

    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
        id SERIAL PRIMARY KEY,
        created_at TIMESTAMP DEFAULT now(),
        order_number INTEGER DEFAULT 3 NOT NULL,
        flavor VARCHAR(255) NOT NULL
    `;

    await client.query(SQL)
    console.log('tables created')

    SQL = `
    INSERT INTO flavors(flavor, order_number) VALUES('Orange', 3);
    INSERT INTO flavors(flavor, order_number) VALUES('strawberry', 5);
    INSERT INTO flavors(flavor, order_number) VALUES('Vanilla', 5);
    INSERT INTO flavors(flavor, order_number) VALUES('Vanilla', 8);
    
    `;
    await client.query(SQL)
    console.log('data seeded')
};

    const port = process.env.PORT || 3000;
    app.listen(port, () => console.log(`listening on port ${port}`))
init();