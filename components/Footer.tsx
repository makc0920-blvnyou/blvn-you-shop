import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="relative bg-[#1a1a2e] text-white/80 mt-16 overflow-hidden">
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <Image
          src="/images/logo-flowers.jpg"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🐱</span>
              <span className="font-nunito font-bold text-lg text-white">
                blvn<span className="text-blvn-pink">.you</span>
              </span>
            </div>
            <p className="text-sm text-white/60">
              Дофаминовые мелочи для души ✨
            </p>
          </div>

          <div>
            <h3 className="font-nunito font-bold text-sm text-white mb-3">Информация</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-white/60 hover:text-blvn-pink transition-colors">
                  Политика конфиденциальности
                </Link>
              </li>
              <li>
                <Link href="/offer" className="text-sm text-white/60 hover:text-blvn-pink transition-colors">
                  Публичная оферта
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-sm text-white/60 hover:text-blvn-pink transition-colors">
                  Возврат и обмен
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-nunito font-bold text-sm text-white mb-3">Реквизиты ИП</h3>
            <div className="text-sm text-white/70 space-y-2">
              <p className="font-semibold text-white">ИП Попова Екатерина Валентиновна</p>
              <p>УНП: 291921539</p>
              <p>Юр. адрес: 224000, г. Брест, пер. Дружный 4-й, д. 15</p>
              <p>
                <a href="tel:+375298002233" className="hover:text-blvn-pink transition-colors">
                  +375 (29) 800-22-33
                </a>
                {' '}|{' '}
                <a href="mailto:blvnyou@yandex.ru" className="hover:text-blvn-pink transition-colors">
                  blvnyou@yandex.ru
                </a>
              </p>
              <p>Режим работы: Пн-Вс 09:00–21:00 (прием онлайн-заказов круглосуточно)</p>
              <p className="text-xs text-white/50 mt-2">
                Свидетельство о государственной регистрации выдано администрацией Московского района г. Бреста 09.10.2025
              </p>
            </div>
          </div>
        </div>

        {/* Социальные сети */}
        <div className="mb-8 pt-6 border-t border-white/10">
          <p className="text-sm font-semibold text-white mb-3">Мы в социальных сетях:</p>
          <div className="flex gap-4">
            <a
              href="https://t.me/blvnyou"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.751-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.015 3.333-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.154.232.17.325.015.093.034.305.019.471z"/>
              </svg>
              <span className="text-sm font-medium">Telegram</span>
            </a>

            <a
              href="https://www.instagram.com/blvn.you"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:from-purple-600 hover:via-pink-600 hover:to-orange-600 text-white px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105 shadow-md"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span className="text-sm font-medium">Instagram</span>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} blvn.you. Все права защищены.
          </p>
        </div>
      </div>
    </footer>
  )
}
