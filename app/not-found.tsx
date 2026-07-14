import Link from 'next/link'
import Image from 'next/image'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFE4EC] to-[#FFF0F5] flex items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="relative w-64 h-64 mx-auto animate-float">
          <Image
            src="/images/kotik-rozovyi-s-fonarikami.jpg"
            alt="Грустный котик"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        <div className="space-y-4">
          <h1 className="font-nunito font-bold text-6xl text-blvn-pink">
            404
          </h1>
          <h2 className="font-nunito font-semibold text-2xl text-text-primary">
            Ой, котик убежал! 🐱
          </h2>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Страница, которую вы ищете, не найдена. Возможно, котик спрятал её в другом месте.
          </p>
        </div>

        <Link
          href="/"
          className="inline-block bg-blvn-pink hover:bg-blvn-pink/90 text-white font-semibold px-8 py-4 rounded-2xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
        >
          Вернуться в магазин
        </Link>

        <div className="text-4xl space-x-4 opacity-50">
          <span>🌸</span>
          <span>🎀</span>
          <span>✨</span>
        </div>
      </div>
    </div>
  )
}
