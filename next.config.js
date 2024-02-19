/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/api/:id',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
