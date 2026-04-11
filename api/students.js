const { students, json, cors, extractId } = require('./_data')

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); return res.status(204).end() }

  const id = extractId(req, 'students')

  if (req.method === 'GET') {
    if (!id) return json(res, 200, students)
    const s = students.find((s) => s.id === id)
    if (!s) return json(res, 404, { message: 'Student not found' })
    return json(res, 200, s)
  }

  return json(res, 405, { message: 'Method not allowed' })
}
