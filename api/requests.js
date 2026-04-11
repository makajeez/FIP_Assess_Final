const { requests, generateId, json, cors, extractId } = require('./_data')

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); return res.status(204).end() }

  const id = extractId(req, 'requests')

  // GET /api/requests  or  GET /api/requests?studentId=s1
  if (req.method === 'GET' && !id) {
    const { studentId, status } = req.query ?? {}
    let result = [...requests]
    if (studentId) result = result.filter((r) => r.studentId === studentId)
    if (status)    result = result.filter((r) => r.status === status)
    return json(res, 200, result)
  }

  // GET /api/requests/:id
  if (req.method === 'GET' && id) {
    const r = requests.find((r) => r.id === id)
    if (!r) return json(res, 404, { message: 'Request not found' })
    return json(res, 200, r)
  }

  // POST /api/requests
  if (req.method === 'POST') {
    const newReq = {
      id: generateId('r'),
      ...req.body,
      date: new Date().toISOString().slice(0, 10),
      status: 'pending',
      adminNote: '',
      documentId: '',
    }
    requests.push(newReq)
    return json(res, 201, newReq)
  }

  // PATCH /api/requests/:id
  if (req.method === 'PATCH' && id) {
    const idx = requests.findIndex((r) => r.id === id)
    if (idx === -1) return json(res, 404, { message: 'Request not found' })
    requests[idx] = { ...requests[idx], ...req.body }
    return json(res, 200, requests[idx])
  }

  // DELETE /api/requests/:id
  if (req.method === 'DELETE' && id) {
    const idx = requests.findIndex((r) => r.id === id)
    if (idx === -1) return json(res, 404, { message: 'Request not found' })
    requests.splice(idx, 1)
    return json(res, 200, { deleted: id })
  }

  return json(res, 405, { message: 'Method not allowed' })
}
