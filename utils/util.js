import { oak, mongo } from '../deps.js'

export const toModel = dto => {
    const data = { ...dto }
    if (data.id) {
        data._id = new mongo.ObjectId(data.id)
        delete data.id
    }
    return data
}

export const toDto = data => {
    const dto = { ...data }
    if (dto._id) {
        dto.id = dto._id.toString()
        delete dto._id
    }
    delete dto.sandi
    delete dto.password
    return dto
}

export const error500 = (ctx = new oak.Context(), e = new Error()) => {
    log(ctx.request.url, e)
    ctx.response.status = oak.Status.InternalServerError
    ctx.response.body = { msg: e.message }
}

export const log = (funcName, data) => console.log('[', new Date().toString(), funcName, ']', data)