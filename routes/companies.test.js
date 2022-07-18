process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;
let testInvoice;

beforeEach(async () => {
  const result = await db.query(`INSERT INTO companies (code, name, description) VALUES ('amazon', 'Amazon', 'prime shipping') RETURNING  code, name, description`);
  testCompany = result.rows[0]

  const invoice = await db.query(`INSERT INTO invoices (comp_code, amt) VALUES ('amazon', 150) RETURNING *`)
  testInvoice = invoice.rows[0]
})

afterEach(async () => {
  await db.query(`DELETE FROM companies`)
})

afterAll(async () => {
  await db.end()
})



describe("GET /companies", () => {
  test("Get a list with one company", async () => {
    const res = await request(app).get('/companies')
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ companies: [testCompany] })
  })
})

describe("GET /companies/:code", () => {
    test("get single company data", async () => {
      const res = await request(app).get('/companies/amazon')
      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({company: testCompany, invoices: [testInvoice.id]})
    })
    test("get a 404 when searching for wrong company code", async () => {
      const res = await request(app).get('/companies/blank')
      expect(res.statusCode).toBe(404)
    })
  })


describe("POST /companies", () => {
  test("Creates a single company", async () => {
    const res = await request(app).post('/companies').send({ code: 'test', name: 'Test', description: 'test description' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      company: { code: 'test', name: 'Test', description: 'test description' }
    })
  })
})


describe("PUT /companies/:code", () => {
  test("Updates a single company", async () => {
    const res = await request(app).put(`/companies/amazon`).send({ name: 'AmazonTest', description: 'test' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      company: { code: 'amazon', name: 'AmazonTest', description: 'test' }
    })
  })
  test("Responds with 404 for invalid company", async () => {
    const res = await request(app).patch(`/companies/0`).send({ name: 'Test', description: 'test' });
    expect(res.statusCode).toBe(404);
  })
})


describe("DELETE /companies/:code", () => {
  test("Deletes a single company", async () => {
    const res = await request(app).delete(`/companies/${testCompany.code}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ msg: 'DELETED!' })
  })
});