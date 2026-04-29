export async function POST() {
    const response = Response.json({ success: true })
    response.cookies.set('authToken', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/'
    })
    return response
  }