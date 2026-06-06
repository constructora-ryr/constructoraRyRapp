import { Resend } from 'resend'

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { createRouteClient } from '@/lib/supabase/server-route'
import { logger } from '@/lib/utils/logger'

export async function POST(request: NextRequest) {
  const resend = new Resend(process.env.RESEND_API_KEY)
  try {
    const supabase = await createRouteClient()
    const {
      data: { user: adminUser },
    } = await supabase.auth.getUser()

    if (!adminUser) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const { data: adminPerfil } = await supabase
      .from('usuarios')
      .select('rol, estado')
      .eq('id', adminUser.id)
      .single()

    if (
      adminPerfil?.rol !== 'Administrador' ||
      adminPerfil?.estado !== 'Activo'
    ) {
      return NextResponse.json(
        { error: 'No tienes permisos para reenviar invitaciones' },
        { status: 403 }
      )
    }

    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 })
    }

    const origin =
      process.env.NEXT_PUBLIC_SITE_URL ??
      request.headers.get('origin') ??
      'http://localhost:3000'

    // generateLink genera un link directo que bypasea PKCE — funciona en cualquier browser.
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email,
        options: { redirectTo: `${origin}/bienvenida` },
      })

    if (linkError || !linkData?.properties?.action_link) {
      logger.error('❌ [REENVIAR-INVITACION] Error generando link:', linkError)
      return NextResponse.json(
        { error: linkError?.message ?? 'Error al generar enlace' },
        { status: 500 }
      )
    }

    const actionLink = linkData.properties.action_link

    // Enviar email con Resend usando el template de invitación
    const { error: emailError } = await resend.emails.send({
      from: 'Constructora RyR <no-reply@constructoraryrltda.com>',
      to: [email],
      subject: 'Te invitaron a RyR Constructora',
      html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;">
          <div style="max-width:560px;margin:40px auto;padding:0 16px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:20px;font-weight:800;color:#1e293b;">
                Constructora <span style="color:#dc2626;">RyR</span>
              </div>
              <div style="font-size:11px;color:#64748b;margin-top:3px;letter-spacing:1px;text-transform:uppercase;">
                Sistema de Gestión Administrativa
              </div>
            </div>
            <div style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
              <div style="background:#4f46e5;padding:44px 32px 40px;text-align:center;">
                <div style="font-size:48px;margin-bottom:16px;">👋</div>
                <div style="font-size:28px;font-weight:800;color:#ffffff;margin-bottom:10px;">¡Has sido invitado!</div>
                <div style="font-size:15px;color:rgba(255,255,255,0.85);">Tu cuenta en el sistema de Constructora RyR está lista</div>
              </div>
              <div style="padding:36px 32px;">
                <p style="font-size:16px;color:#334155;margin-bottom:32px;line-height:1.7;">
                  Haz clic en el botón para <strong style="color:#4f46e5;">crear tu contraseña</strong> y acceder al sistema.
                </p>
                <div style="text-align:center;margin-bottom:28px;">
                  <a href="${actionLink}" style="display:inline-block;background-color:#4f46e5;color:#ffffff;text-decoration:none;font-size:17px;font-weight:700;padding:18px 48px;border-radius:12px;">
                    Crear contraseña →
                  </a>
                </div>
                <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:14px 16px;">
                  <span style="font-size:13px;color:#92400e;">
                    ⏰ Este enlace es válido por <strong>1 hora</strong>.
                  </span>
                </div>
              </div>
              <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 32px;text-align:center;">
                <div style="font-size:14px;font-weight:700;color:#475569;">
                  Constructora <span style="color:#dc2626;">RyR</span> LTDA.
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      logger.error('❌ [REENVIAR-INVITACION] Error enviando email:', emailError)
      return NextResponse.json(
        { error: 'Error al enviar el correo' },
        { status: 500 }
      )
    }

    logger.info(`✅ [REENVIAR-INVITACION] Invitación reenviada a ${email}`)
    return NextResponse.json({ ok: true })
  } catch (error) {
    logger.error('❌ [REENVIAR-INVITACION] Error inesperado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
