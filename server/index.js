require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const nodemailer = require('nodemailer')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const jwt = require('jsonwebtoken')
const Stripe = require('stripe')

const app = express()
const PORT = process.env.PORT || 3001

app.use(helmet())
app.use(bodyParser.json())

const corsOptions = { origin: process.env.FRONTEND_ORIGIN || '*' }
app.use(cors(corsOptions))

// Basic rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 120 })
app.use(limiter)

const dataDir = path.join(__dirname, 'data')
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir)

const ordersFile = path.join(dataDir, 'orders.json')
const quotesFile = path.join(dataDir, 'quotes.json')

function readJson(file){ try { return JSON.parse(fs.readFileSync(file, 'utf8') || '[]') } catch { return [] } }
function writeJson(file, data){ fs.writeFileSync(file, JSON.stringify(data, null, 2)) }

function isValidEmail(email){ return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) }
function sanitize(input){ if (!input) return ''; return String(input).replace(/\r|\n|<|>|\\/g, '') }

const stripe = process.env.STRIPE_SECRET_KEY ? Stripe(process.env.STRIPE_SECRET_KEY) : null

app.post('/api/contact', async (req, res) => {
  try {
    const { email, whatsapp } = req.body || {}
    const cleanEmail = sanitize(email)
    const cleanWhatsapp = sanitize(whatsapp)
    if (!isValidEmail(cleanEmail)) return res.status(400).json({ ok:false, message:'Email invalide' })

    const entry = { id: Date.now(), email: cleanEmail, whatsapp: cleanWhatsapp, createdAt: new Date().toISOString() }
    const logDir = path.join(__dirname, 'logs'); if (!fs.existsSync(logDir)) fs.mkdirSync(logDir)
    fs.appendFileSync(path.join(logDir, 'contacts.log'), JSON.stringify(entry) + '\n')

    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: process.env.SMTP_SECURE==='true', auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@eclusedazur.local', to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER, subject: `Nouveau contact: ${cleanEmail}`, text: JSON.stringify(entry) }).catch(console.error)
    }

    return res.json({ ok:true, message:'Contact reçu' })
  } catch (err){ console.error(err); res.status(500).json({ ok:false, message:'Erreur serveur' }) }
})

app.post('/api/quotes', (req, res) => {
  try {
    const { name, email, details } = req.body || {}
    if (!name || !isValidEmail(email) || !details) return res.status(400).json({ ok:false, message:'Données invalides' })
    const quotes = readJson(quotesFile)
    const quote = { id: Date.now(), name, email, details, status: 'pending', createdAt: new Date().toISOString() }
    quotes.unshift(quote); writeJson(quotesFile, quotes)
    return res.json({ ok:true, message:'Demande de devis envoyée', quote })
  } catch (err){ console.error(err); res.status(500).json({ ok:false }) }
})

app.post('/api/orders', (req, res) => {
  try {
    const { buyerName, email, items, payment } = req.body || {}
    if (!buyerName || !isValidEmail(email) || !items) return res.status(400).json({ ok:false, message:'Données invalides' })
    const orders = readJson(ordersFile)
    const order = { id: Date.now(), buyerName, email, items, payment: payment||null, status:'pending', createdAt: new Date().toISOString() }
    orders.unshift(order); writeJson(ordersFile, orders)
    return res.json({ ok:true, order })
  } catch (err){ console.error(err); res.status(500).json({ ok:false }) }
})

app.post('/api/checkout/stripe', async (req, res) => {
  try {
    const { amount, currency='eur' } = req.body || {}
    if (!stripe) return res.status(500).json({ ok:false, message:'Stripe non configuré' })
    if (!amount || amount <= 0) return res.status(400).json({ ok:false, message:'Montant invalide' })
    const paymentIntent = await stripe.paymentIntents.create({ amount: Math.round(amount), currency })
    res.json({ ok:true, clientSecret: paymentIntent.client_secret })
  } catch (err){ console.error(err); res.status(500).json({ ok:false, message:'Erreur Stripe' }) }
})

app.post('/api/checkout/paystack', async (req, res) => {
  try {
    const { email, amount } = req.body || {}
    if (!email || !amount) return res.status(400).json({ ok:false })
    if (process.env.PAYSTACK_SECRET){
      const resp = await fetch('https://api.paystack.co/transaction/initialize', { method:'POST', headers:{ 'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`, 'Content-Type':'application/json' }, body: JSON.stringify({ email, amount }) })
      const j = await resp.json(); return res.json({ ok:true, data:j })
    }
    return res.json({ ok:true, data:{ message:'Paystack non configuré sur le serveur' } })
  } catch (err){ console.error(err); res.status(500).json({ ok:false }) }
})

app.post('/api/checkout/flutterwave', async (req, res) => {
  try {
    const { tx_ref, amount, currency, redirect_url } = req.body || {}
    if (process.env.FLUTTERWAVE_SECRET){
      const resp = await fetch('https://api.flutterwave.com/v3/payments', { method:'POST', headers:{ 'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET}`, 'Content-Type':'application/json' }, body: JSON.stringify({ tx_ref, amount, currency, redirect_url }) })
      const j = await resp.json(); return res.json({ ok:true, data:j })
    }
    return res.json({ ok:true, data:{ message:'Flutterwave non configuré sur le serveur' } })
  } catch (err){ console.error(err); res.status(500).json({ ok:false }) }
})

function generateToken(payload){ return jwt.sign(payload, process.env.JWT_SECRET || 'dev-secret', { expiresIn: '8h' }) }
function verifyToken(req, res, next){ const auth = req.headers.authorization; if (!auth) return res.status(401).json({ ok:false, message:'Missing token' }); const [, token] = auth.split(' '); try { req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret'); next() } catch (err) { return res.status(401).json({ ok:false, message:'Invalid token' }) } }

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ ok:false })
  if (username === (process.env.ADMIN_USER || 'admin') && password === (process.env.ADMIN_PASS || 'password')){ const token = generateToken({ username, role:'admin' }); return res.json({ ok:true, token }) }
  return res.status(403).json({ ok:false, message:'Invalid credentials' })
})

app.get('/api/admin/orders', verifyToken, (req, res) => { const orders = readJson(ordersFile); res.json({ ok:true, orders }) })
app.get('/api/admin/quotes', verifyToken, (req, res) => { const quotes = readJson(quotesFile); res.json({ ok:true, quotes }) })

app.post('/api/admin/orders/:id/validate', verifyToken, (req, res) => {
  try {
    const id = Number(req.params.id)
    const orders = readJson(ordersFile)
    const idx = orders.findIndex(o => o.id === id)
    if (idx === -1) return res.status(404).json({ ok:false })
    orders[idx].status = req.body.status || 'validated'
    writeJson(ordersFile, orders)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS){
      const transporter = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||587), secure: process.env.SMTP_SECURE==='true', auth:{ user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } })
      transporter.sendMail({ from: process.env.SMTP_FROM || 'no-reply@eclusedazur.local', to: orders[idx].email, subject:'Votre commande a été mise à jour', text:`Statut: ${orders[idx].status}` }).catch(console.error)
    }
    res.json({ ok:true, order: orders[idx] })
  } catch (err){ console.error(err); res.status(500).json({ ok:false }) }
})

app.listen(PORT, () => { console.log(`Contact & API server listening on http://localhost:${PORT}`) })
