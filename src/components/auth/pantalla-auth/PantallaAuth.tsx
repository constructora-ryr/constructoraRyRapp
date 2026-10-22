/**
 * Marco de las pantallas de acceso (login, restablecer contraseña):
 * escritorio en dos columnas (panel de marca | formulario); en celular,
 * el panel de marca queda como franja arriba y el formulario debajo.
 */

import type { ReactNode } from 'react'

import Image from 'next/image'

export function PantallaAuth({ children }: { children: ReactNode }) {
  return (
    <div className='grid min-h-dvh w-full bg-white dark:bg-[#0c0c0f] lg:grid-cols-[1.15fr_1fr]'>
      {/* Panel de marca */}
      <aside className='relative h-56 overflow-hidden bg-[#0a0a0d] sm:h-64 lg:h-auto lg:min-h-dvh'>
        {/* Fondo de marca (sin foto): brillos rojos, retícula de plano y
            líneas diagonales como la barra de la "R" del logo */}
        <div
          aria-hidden
          className='absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-red-600/40 blur-[110px] motion-safe:animate-pulse-slow'
        />
        <div
          aria-hidden
          className='absolute -bottom-40 -right-24 h-[30rem] w-[30rem] rounded-full bg-rose-700/30 blur-[120px]'
        />
        <div
          aria-hidden
          className='absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/15 blur-[90px]'
        />
        <div
          aria-hidden
          className='absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:44px_44px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]'
        />
        <div
          aria-hidden
          className='absolute inset-0 hidden overflow-hidden lg:block'
        >
          <span className='absolute -right-24 top-[-10%] h-[130%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-red-500/60 to-transparent' />
          <span className='absolute -right-10 top-[-10%] h-[130%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-white/20 to-transparent' />
          <span className='absolute -left-16 top-[-10%] h-[130%] w-px rotate-[24deg] bg-gradient-to-b from-transparent via-red-500/30 to-transparent' />
        </div>

        <div className='absolute inset-0 flex flex-col items-center justify-end p-6 text-center text-white sm:p-8 lg:justify-center lg:p-12'>
          <div className='relative h-14 w-64 sm:h-16 sm:w-80 lg:h-28 lg:w-[30rem] xl:h-32 xl:w-[34rem]'>
            <Image
              src='/images/logo1-dark.png'
              alt='Constructora RyR Ltda.'
              fill
              priority
              sizes='(min-width: 1280px) 544px, (min-width: 1024px) 480px, 320px'
              className='object-contain drop-shadow-2xl'
            />
          </div>
          <p className='mt-3 text-base font-semibold text-white/90 sm:text-lg lg:mt-8 lg:text-2xl'>
            Sistema de gestión administrativa
          </p>
        </div>

        {/* Acento con el rojo de la marca */}
        <span
          aria-hidden
          className='absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600 lg:inset-y-0 lg:left-auto lg:right-0 lg:h-auto lg:w-1 lg:bg-gradient-to-b'
        />
      </aside>

      {/* Formulario */}
      <main className='relative flex flex-col overflow-hidden px-5 sm:px-8'>
        {/* Brillo suave de la marca para que el panel no se sienta vacío */}
        <div
          aria-hidden
          className='pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-red-500/10 blur-3xl dark:bg-red-600/15'
        />
        <div
          aria-hidden
          className='pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-rose-400/10 blur-3xl dark:bg-rose-500/10'
        />
        <div className='relative flex flex-1 items-start justify-center py-8 sm:py-12 lg:items-center'>
          <div className='w-full max-w-sm xl:max-w-md'>{children}</div>
        </div>
        <footer className='relative pb-6 text-center text-xs text-slate-400 dark:text-zinc-500'>
          © {new Date().getFullYear()} Constructora RyR Ltda.
        </footer>
      </main>
    </div>
  )
}

/** Encabezado del formulario: ícono de la marca, título y subtítulo */
export function EncabezadoAuth({
  titulo,
  subtitulo,
}: {
  titulo: string
  subtitulo: string
}) {
  return (
    <header className='mb-7 text-center'>
      <div className='relative mx-auto mb-5 h-20 w-20'>
        {/* Halo rojo de la marca detrás del ícono */}
        <div
          aria-hidden
          className='absolute inset-0 scale-125 rounded-full bg-red-500/20 blur-2xl dark:bg-red-600/25'
        />
        <Image
          src='/images/logo2.png'
          alt=''
          fill
          sizes='80px'
          className='object-contain dark:hidden'
        />
        <Image
          src='/images/logo2-dark.png'
          alt=''
          fill
          sizes='80px'
          className='hidden object-contain dark:block'
        />
      </div>
      <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl'>
        {titulo}
      </h1>
      <p className='mt-1.5 text-sm text-slate-500 dark:text-slate-400'>
        {subtitulo}
      </p>
    </header>
  )
}
