import Image from "next/image";

/**
 * Molduras dos cantos, fiéis ao convite impresso:
 * - Folhagens em aquarela: canto superior esquerdo (original) e inferior direito (girada 180°).
 * - Arabesco dourado: canto superior direito (original) e inferior esquerdo (girado 180°).
 * As imagens já foram desenhadas ancoradas no canto, então ficam em `top/right/bottom/left: 0`
 * sem espelhamento (`scale-x`), que era o que deixava as folhas "viradas".
 */
export function Ornaments() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <Image
        src="/folhas.png"
        alt=""
        width={462}
        height={540}
        priority
        className="absolute left-0 top-0 w-36 opacity-90 sm:w-56"
      />
      <Image
        src="/ornamento.png"
        alt=""
        width={432}
        height={576}
        className="absolute right-0 top-0 w-20 opacity-80 sm:w-28"
      />
      <Image
        src="/folhas.png"
        alt=""
        width={462}
        height={540}
        className="absolute bottom-0 right-0 w-36 rotate-180 opacity-90 sm:w-56"
      />
      <Image
        src="/ornamento.png"
        alt=""
        width={432}
        height={576}
        className="absolute bottom-0 left-0 w-20 rotate-180 opacity-80 sm:w-28"
      />
    </div>
  );
}
