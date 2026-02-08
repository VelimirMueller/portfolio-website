import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'npm:resend'

const resend = new Resend(Deno.env.get('RESEND_API_KEY'))

serve(async (req) => {
  try {
    const { record } = await req.json()

    // Send email with Resend
    const data = await resend.emails.send({
          from: "onboarding@resend.dev",
          to: 'velimir.mueller@googlemail.com', // Changed to your verified email
          subject: 'New Contact Form Submission',
          html: `
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f7; padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">

                      <!-- Header -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 600; letter-spacing: -0.5px;">
                            New Contact Message
                          </h1>
                          <p style="margin: 10px 0 0; color: #e0e7ff; font-size: 14px;">
                            You've received a new inquiry from your website
                          </p>
                        </td>
                      </tr>

                      <!-- Content -->
                      <tr>
                        <td style="padding: 40px 30px;">

                          <!-- Name Field -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
                                  Name
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f9fafb; border-left: 3px solid #667eea; padding: 12px 16px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 16px; color: #111827; font-weight: 500;">
                                  ${record.name}
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- Email Field -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
                                  Email
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f9fafb; border-left: 3px solid #667eea; padding: 12px 16px; border-radius: 4px;">
                                <a href="mailto:${record.email}" style="margin: 0; font-size: 16px; color: #667eea; font-weight: 500; text-decoration: none;">
                                  ${record.email}
                                </a>
                              </td>
                            </tr>
                          </table>

                          <!-- Message Field -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding-bottom: 8px;">
                                <p style="margin: 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280;">
                                  Message
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="background-color: #f9fafb; border-left: 3px solid #667eea; padding: 16px; border-radius: 4px;">
                                <p style="margin: 0; font-size: 15px; color: #374151; line-height: 1.7; white-space: pre-wrap;">
            ${record.message}
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- Reply Button -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                            <tr>
                              <td align="center">
                                <a href="mailto:${record.email}?subject=Re: Your inquiry" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);">
                                  Reply to ${record.name.split(' ')[0]}
                                </a>
                              </td>
                            </tr>
                          </table>

                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
                          <p style="margin: 0; font-size: 13px; color: #6b7280;">
                            This message was sent from your contact form at<br>
                            <a href="https://velimir-mueller.de" style="color: #667eea; text-decoration: none; font-weight: 500;">velimir-mueller.de</a>
                          </p>
                          <p style="margin: 16px 0 0; font-size: 12px; color: #9ca3af;">
                            ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
          `
        })

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})