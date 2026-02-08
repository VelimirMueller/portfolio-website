import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { record, type } = body

    // Handle both old_record and record formats
    const data = record || body.old_record || body

    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'velimir.mueller@googlemail.com',
      subject: 'New Contact Form Submission',
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}