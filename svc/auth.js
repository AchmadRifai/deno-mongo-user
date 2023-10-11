import { oak, mongo } from '../deps.js'
import { dbConnection, dbTrans, refreshToken, encrypt } from '../config/db.js'
import { toDto, toModel } from '../utils/util.js'

export const users = async (ctx = new oak.Context()) => {
    if (!ctx.request.hasBody) throw new Error('Body is required')
    const { page, size, where } = await ctx.request.body().value
    if (!page || !size || !where) throw new Error('page, size and where is required')
    if (0 >= page || 0 >= size) throw new Error('page and size must be positive')
    refreshToken(ctx)
    const result = { page, size }
    await dbConnection(async db => {
        let ids = await db.collection('users').distinct('_id', toModel(where))
        result.pageCount = Math.ceil(ids.length / size)
        ids = ids.slice((page - 1) * size, page * size)
        const users = await db.collection('users').find({ _id: { $in: ids } }).toArray()
        result.data = users.map(toDto)
    })
    ctx.response.body = result
}

export const logout = async (ctx = new oak.Context()) => {
    const jwt = refreshToken(ctx)
    await dbConnection(async db => {
        const users = await db.collection('users').find({ _id: new mongo.ObjectId(jwt.sub) }).toArray()
        if (0 == users.length) throw new Error('User not found')
        ctx.response.body = { msg: 'Success' }
    })
}

export const iam = async (ctx = new oak.Context()) => {
    const jwt = refreshToken(ctx)
    await dbConnection(async db => {
        const users = await db.collection('users').find({ _id: new mongo.ObjectId(jwt.sub) }).toArray()
        if (0 == users.length) throw new Error('User not found')
        const user = users[0]
        ctx.response.headers.append('Authorization', encrypt(user._id.toString(), 'global'))
        ctx.response.body = toDto(user)
    })
}

export const register = async (ctx = new oak.Context()) => {
    if (!ctx.request.hasBody) throw new Error('Body is required')
    const { username, password, name } = await ctx.request.body().value
    if (!username || !password || !name) throw new Error('Username, name and password is required')
    await dbTrans(async db => {
        const data = await db.collection('users').insertOne({ username, sandi: password, name })
        ctx.response.headers.append('Authorization', encrypt(data.insertedId.toString(), 'global'))
        ctx.response.body = { msg: 'Success' }
    })
}

export const login = async (ctx = new oak.Context()) => {
    if (!ctx.request.hasBody) throw new Error('Body is required')
    const { username, password } = await ctx.request.body().value
    if (!username || !password) throw new Error('Username and password is required')
    await dbConnection(async db => {
        const users = await db.collection('users').find({ username, sandi: password }).toArray()
        if (0 == users.length) throw new Error(`User ${username} not found`)
        const user = users[0]
        ctx.response.headers.append('Authorization', encrypt(user._id.toString(), 'global'))
        ctx.response.body = toDto(user)
    })
}