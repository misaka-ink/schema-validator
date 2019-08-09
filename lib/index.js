/**
 * @file (index)
 * Created by Xinyi on 2019-07-22
 */

import Ajv from 'ajv'
const ajv = new Ajv()

export default function (kvs) {
    kvs = kvs instanceof Array ? kvs : [kvs]
    const validators = {}

    for (const kv of kvs) {
        validators[kv.url] = {}
        validators[kv.url]['reqSchema'] = kv.reqSchema && ajv.compile(kv.reqSchema)
        validators[kv.url]['resSchema'] = kv.resSchema && ajv.compile(kv.resSchema)
    }

    console.log(validators)

    return async (ctx, next) => {
        console.log(ctx.url.host, ctx.url.pathname, ctx.url.search)
        const reqSchema = validators[ctx._request.url] && validators[ctx._request.url].reqSchema
        const resSchema = validators[ctx._request.url] && validators[ctx._request.url].resSchema
        if (reqSchema && !reqSchema(ctx._request)) {
            const errorMsg = reqSchema.errors.map((err, index) =>
                `（${index + 1}）${err.keyword} error, the '${err.dataPath}' ${err.message}`).join('.')
            throw `["${ctx._request.url}"] validate error: ${errorMsg}`
        }
        await next()
        if (resSchema && !resSchema(ctx.response)) {
            const errorMsg = resSchema.errors.map((err, index) =>
                `（${index + 1}）${err.keyword} error, the '${err.dataPath}' ${err.message}`).join('.')
            throw `["${ctx._request.url}"] validate error: ${errorMsg}`
        }
    };
}
