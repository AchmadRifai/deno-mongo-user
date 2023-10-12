import { mongo, jwt, oak, Mutex } from '../deps.js'

const secret = Deno.env.get('SECRET') || 'everythinkwhatyouwant'

export const decrypt = token => jwt.verify(token, secret)

export const refreshToken = (ctx = new oak.Context()) => {
    let token = ctx.request.headers.get('Authorization')
    if (!token || !token.startsWith('Bearer ')) throw new Error('Token not found')
    token = token.replace('Bearer ', '')
    const result = decrypt(token)
    ctx.response.headers.append('Authorization', encrypt(result.sub, result.access))
    return result
}

export const encrypt = (subject, access) => jwt.sign({ access }, secret, { subject, algorithm: 'HS512', expiresIn: Date.now() + (1000 * 8 * 60) })

export const dbTrans = async (exec = async (_ = new mongo.Db()) => { }) => {
    const dbUrl = Deno.env.get('DB_URL') || 'mongodb://127.0.0.1:27017/users'
    const dbName = Deno.env.get('DB_URL') || 'users'
    const cli = new mongo.MongoClient(dbUrl)
    try {
        await cli.connect()
        const mu = new Mutex()
        await mu.acquire()
        const session = cli.startSession()
        try {
            session.startTransaction()
            await exec(cli.db(dbName))
            await session.commitTransaction()
        } catch (e) {
            await session.abortTransaction()
            throw e
        } finally {
            await session.endSession()
            mu.release()
        }
    } finally {
        await cli.close()
    }
}

export const dbConnection = async (exec = async (_ = new mongo.Db()) => { }) => {
    const dbUrl = Deno.env.get('DB_URL') || 'mongodb://127.0.0.1:27017/users'
    const dbName = Deno.env.get('DB_URL') || 'users'
    const cli = new mongo.MongoClient(dbUrl)
    try {
        await cli.connect()
        await exec(cli.db(dbName))
    } finally {
        await cli.close()
    }
}