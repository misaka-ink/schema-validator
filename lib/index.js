/**
 * @file (index)
 * Created by Xinyi on 2019-07-22
 */

import Ajv from 'ajv'
const ajv = new Ajv()

export default function (kvs) {
    kvs = kvs instanceof Array ? kvs : [kvs]
    let validators = {}

    for (const kv of kvs) {
        validators[kv.target] = {}
        validators[kv.target]['reqSchema'] = kv.reqSchema && ajv.compile(kv.reqSchema)
        validators[kv.target]['resSchema'] = kv.resSchema && ajv.compile(kv.resSchema)
    }

    return async (ctx, next) => {
        const reqSchema = validators[ctx.location.pathname] && validators[ctx.location.pathname].reqSchema
        const resSchema = validators[ctx.location.pathname] && validators[ctx.location.pathname].resSchema

        console.log(ctx._params)
        console.log(reqSchema)

        if (reqSchema && !reqSchema(ctx._params)) {
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
