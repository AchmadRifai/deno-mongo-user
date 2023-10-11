import { oak } from '../deps.js'
import { iam, login, logout, register, users } from '../svc/auth.js'
import { error500 } from '../utils/util.js'

const router = new oak.Router()
router.post('/login', ctx => login(ctx).catch(e => error500(ctx, e)))
router.post('/register', ctx => register(ctx).catch(e => error500(ctx, e)))
router.get('/iam', ctx => iam(ctx).catch(e => error500(ctx, e)))
router.get('/logout', ctx => logout(ctx).catch(e => error500(ctx, e)))
router.post('/users', ctx => users(ctx).catch(e => error500(ctx, e)))

export default router