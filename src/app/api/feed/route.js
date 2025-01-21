export default async function handler(req, res) {
  const apiUrl = 'https://api.qubicweb.com/v1/feed'

  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    res.status(200).json(data)
  } catch (error) {
    console.error('Error fetching feed:', error.message)
    res.status(500).json({ error: 'Failed to fetch feed' })
  }
}
