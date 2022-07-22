process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');
const db = require('../db');

let testCompany;
let testIndustry;
let testInvoice;
let testIndustry2

beforeAll(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM invoices`)
    await db.query(`DELETE FROM industries`)
})

beforeEach(async () => {
    const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('fgl', 'Foreground Leads', 'marketing agency') RETURNING code, name, description`);
    testCompany = result.rows[0]
    const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('fgl', 150) RETURNING *`)
    testInvoice = invoice.rows[0]
    const industry = await db.query(`INSERT INTO industries (code, industry) VALUES ('mktg', 'Marketing') RETURNING code, industry`)
    testIndustry = industry.rows[0]
    await db.query(`INSERT INTO company_industries(industry_code, company_code)
    VALUES ('mktg', 'fgl')`)
})

afterEach(async () => {
    await db.query(`DELETE FROM companies`)
    await db.query(`DELETE FROM industries`)
})

afterAll(async () => {
    await db.end()
})

describe("GET /", () => {
    test("Should return all industries with companies attached to them", async () => {
        const res = await request(app).get('/industries');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([{industry: testIndustry.industry, companies: [testCompany.name]}])
    })
})

describe("POST /", () => {
    test("Create a new industry", async () => {
        const res = await request(app).post('/industries').send({code: "fin", industry: "Finance"})
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({industry: {code: "fin", industry: "Finance"}})
    })
})

describe(" POST /:company_code", () => {
    test("create a new industry for a company", async () => {
        const industry2 = await db.query(`INSERT INTO industries (code, industry) VALUES ('fin', 'Finance') RETURNING code, industry`)
        testIndustry2 = industry2.rows[0]
        const res = await request(app).post("/industries/fgl").send({industry_code: "fin"})
        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({company_industry:{company_code: "fgl", industry_code: "fin"}})
    })
})