const { users, generateId, json, cors, extractId } = require('./_data')

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); return res.status(204).end() }

  const id = extractId(req, 'users')

  // GET /api/users  or  GET /api/users?email=x
  if (req.method === 'GET' && !id) {
    const { email } = req.query ?? {}
    const result = email
      ? users.filter((u) => u.email.toLowerCase() === email.toLowerCase())
      : users
    return json(res, 200, result)
  }

  // GET /api/users/:id
  if (req.method === 'GET' && id) {
    const user = users.find((u) => u.id === id)
    if (!user) return json(res, 404, { message: 'User not found' })
    return json(res, 200, user)
  }

  // POST /api/users
  if (req.method === 'POST') {
    const newUser = { id: generateId('u'), ...req.body }
    users.push(newUser)
    return json(res, 201, newUser)
  }

  // PATCH /api/users/:id
  if (req.method === 'PATCH' && id) {
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return json(res, 404, { message: 'User not found' })
    users[idx] = { ...users[idx], ...req.body }
    return json(res, 200, users[idx])
  }

  // DELETE /api/users/:id
  if (req.method === 'DELETE' && id) {
    const idx = users.findIndex((u) => u.id === id)
    if (idx === -1) return json(res, 404, { message: 'User not found' })
    users.splice(idx, 1)
    return json(res, 200, { deleted: id })
  }

  return json(res, 405, { message: 'Method not allowed' })
}
