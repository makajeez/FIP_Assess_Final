const { courses, json, cors, extractId } = require('./_data')

module.exports = function handler(req, res) {
  if (req.method === 'OPTIONS') { cors(res); return res.status(204).end() }

  const id = extractId(req, 'courses')

  if (req.method === 'GET') {
    if (!id) {
      const { studentId } = req.query ?? {}
      const result = studentId
        ? courses.filter((c) => c.studentId === studentId)
        : courses
      return json(res, 200, result)
    }
    const c = courses.find((c) => c.id === id)
    if (!c) return json(res, 404, { message: 'Course not found' })
    return json(res, 200, c)
  }

  return json(res, 405, { message: 'Method not allowed' })
}
