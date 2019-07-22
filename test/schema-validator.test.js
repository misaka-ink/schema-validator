/**
 * @file (schema-validator.test)
 * Created by Xinyi on 2019-07-22
 */

import Koa from 'koa'
import validator from '../lib/index'
import fetch2 from '@misaka.ink/fetch2'
import testSchema from './test.schema';

// fetch2
const f2 = fetch2.getInstance()

// test data
const testData = {
    status: 0,
    data: {
        hello: 'world'
    },
    msg: 'success'
}

// mock server
const app = new Koa()

app.use(async (ctx, next) => {
    await next()
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
})

app.use(async ctx => {
    ctx.body = testData
})

let server

// start
beforeAll(async done => {
    server = await app.listen(3000)
    done()
})

// close
afterAll(async done => {
    await server.close()
    done()
})

const schema = [
    {
        url: '/test',
        resSchema: testSchema
    }
]

f2.use(validator(schema))

describe('use fetch2 schema-validator middelware', function () {
    test('Verification passed', async function () {
        try {
            const result = await f2.request('http://localhost:3000/test')
            console.log(result)
            // return expect(result).toEqual('<h1>Hello Mine, here is user template</h1>')
        } catch (e) {
            throw e
        }
    })

    test('Verification failed', function () {

    })
})
