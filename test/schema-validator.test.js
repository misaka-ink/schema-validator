/**
 * @file (schema-validator.test)
 * Created by Xinyi on 2019-07-22
 */

import Koa from 'koa'
import validator from '../lib/index'
import fetch2, {Error} from '@misaka.ink/fetch2'
import testReqSchema from './test.req.schema'
import testResSchema from './test.res.schema'

// fetch2
const f2 = fetch2.getInstance()

// test res data
const testRes = {
    status: 0,
    data: {
        hello: 'world'
    },
    msg: 'success'
}

// error res data
const errorRes = {
    status: 1,
    data: {
        bye: 'bye'
    }
}

// mock server
const app = new Koa()

app.use(async (ctx, next) => {
    await next()
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
})

app.use(async ctx => {
    if (ctx.request.path.indexOf('/req') > -1) {
        ctx.body = testRes
    }
    else if (ctx.request.path.indexOf('/res') > -1) {
        ctx.body = testRes
    }
    else if (ctx.request.path.indexOf('/error') > -1) {
        ctx.body = errorRes
    }
    else ctx.body = 400
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
        target: '/req',
        reqSchema: testReqSchema
    },
    {
        target: '/res',
        resSchema: testResSchema
    },
    {
        target: '/error',
        resSchema: testResSchema
    }
]

f2.use(validator(schema))

describe('use fetch2 schema-validator middelware', function () {
    test('response schema verification should passed', async function () {
        try {
            const result = await f2.request('http://localhost:3000/res')
            return expect(result.data.hello).toEqual('world')
        } catch (e) {
            throw e
        }
    })

    test('response schema verification should not pass', async function () {
        try {
            const result = await f2.request('http://localhost:3000/error')
        } catch (e) {
            expect(e.name).toEqual('FetchError')
        }
    })

    test('request schema verification should passed', async function() {
        try {
            const result = await f2.request('http://localhost:3000/req', {
                id: 1
            })
            return expect(result.data.hello).toEqual('world')
        } catch (e) {
            throw e
        }
    })
})
