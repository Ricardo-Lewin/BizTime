

const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");
const router = new express.Router();


router.get('/', async (req, res, next) => {
    try {
     const results = await db.query(`SELECT industry, name FROM industries
                                        LEFT JOIN company_industries ON industries.code = company_industries.industry_code
                                        LEFT JOIN companies ON company_industries.company_code = companies.code`)
                                        
    let industries = Array.from(new Set(results.rows.map(i => i.industry)))
    let resArr = []
    for(let i of industries){
        let newObj = {}
        newObj.industry = i;
        newObj.companies = []
        resArr.push(newObj)
    }
    for(i = 0; i < results.rows.length; i++){
        let index = results.rows[i]
        let resIndex = resArr.findIndex( x => x.industry === index.industry)
        resArr[resIndex].companies.push(index.name)
    }
    
        return res.json(resArr)
    } catch(e){
        next(e)
    }
})


router.post('/', async (req, res , next) => {
    try{
        const results = await db.query(`INSERT INTO industries (industry, code) VALUES ($2, $1) RETURNING industry, code`, [req.body.code, req.body.industry])
        return res.status(201).json({industry: {code: req.body.code, industry: req.body.industry}})
    } catch(e){
        next(e)
    }
})


router.post('/:company_code', async (req, res, next) => {
    console.log(req.params.company_code)
    try{
        const {company_code} = req.params;
        const {industry_code} = req.body;
        const results = await db.query(`INSERT into company_industries (industry_code, company_code) VALUES ($1,  $2) RETURNING industry_code, company_code`, [industry_code, company_code])
        return res.status(201).json({company_industry: {company_code: company_code, industry_code: industry_code}})
    } catch(e){
        next(e)
    }
})





module.exports = router;