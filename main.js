import { oak } from './deps.js'
import { log } from './utils/util.js'
import router from "./routers/auth.js"

const app = new oak.Application()
app.addEventListener('listen', () => log('listen', 'Listening on 2101'))

app.use(router.routes())
app.use(router.allowedMethods())

app.use(ctx => {
    ctx.response.status = oak.Status.NotFound
    ctx.response.body = { msg: 'Not found' }
})

await app.listen({ port: 2101 })