// pages/api/fetch-rss.js

export default async function handler(req, res) {
  try {
    const response = await fetch('https://server.qubicweb.com/rss-feed')
    const data = await response.json() // Assuming the feed is in JSON format; if it's XML, you'll need to parse it accordingly

    // Transform the data into a structure that your page can use
    const newsData = data.map((item, index) => ({
      id: index + 1,
      title: item.title,
      points: Math.floor(Math.random() * 100),
      comments: Math.floor(Math.random() * 50),
      time: item.pubDate
    }))

    res.status(200).json(newsData)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch RSS feed' })
  }
}
