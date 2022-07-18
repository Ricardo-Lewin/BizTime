process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testInvoice;


beforeAll(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
})

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('google', 'Google', 'powerful search engine') RETURNING code, name, description`);
    testCompany = result.rows[0]

    const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('google', 150) RETURNING *`)
    testInvoice = invoice.rows[0]
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /", () => {
    test("List all invoices", async () => {
        const res = await request(app).get('/invoices')
        expect(res.statusCode).toBe(200);
        expect(res.body.invoices[0].comp_code).toEqual('google')
    })
})