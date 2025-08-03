import Image from "next/image";
import Link from "next/link";
import Coin3D from "./Coin3d";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Wallet2Icon } from "lucide-react";
import { Button } from "~~/components/shadcn/ui/button";

export default function Landing() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-sm bg-black/20">
        <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 justify-center">
            <div className="relative w-8 h-8">
              <Image src={"/favicon.png"} alt="orbit dao" fill={true} />
            </div>
            <span className="text-xl font-bold text-white">Fusion Link</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Características
            </Link>
            <Link href="#about" className="text-gray-300 hover:text-white transition-colors">
              Acerca de
            </Link>
            <Link href="#roadmap" className="text-gray-300 hover:text-white transition-colors">
              Roadmap
            </Link>
            <Button
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
            >
              Conectar Wallet
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl" />
        <div className="container mx-auto px-4 lg:px-6 relative">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight lg:mx-16">
              Fusion Link:
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {" "}
                The bridge that does the heavy lifting.
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Unleash the power of bridgeless swaps. A new way to receive crypto without limits or friction.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <ConnectButton.Custom>
                {({ openConnectModal }) => {
                  return (
                    <Button
                      onClick={openConnectModal}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      <Wallet2Icon />
                      Connect Wallet
                    </Button>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>

        <Coin3D coinName="optimis" className="left-0" appearanceRight={true} />
        <Coin3D coinName="usdc" className="right-0" />
      </section>

      {/* Features Section */}
      {/* <section id="features" className="py-20 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Why choose swap inbox?</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Construida sobre tecnología blockchain de vanguardia para ofrecerte la mejor experiencia descentralizada
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Seguridad Total</CardTitle>
                <CardDescription className="text-gray-300">
                  Tus datos están protegidos por criptografía de nivel militar y contratos inteligentes auditados
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Multiples wallets</CardTitle>
                <CardDescription className="text-gray-300">
                  Connecta con Metamask, oneInchWallet entre otras.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Comunidad</CardTitle>
                <CardDescription className="text-gray-300">
                  Únete a miles de usuarios que ya forman parte de la revolución descentralizada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Ultra Rápido</CardTitle>
                <CardDescription className="text-gray-300">
                  Transacciones instantáneas con tarifas mínimas gracias a nuestra tecnología optimizada
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Sin Censura</CardTitle>
                <CardDescription className="text-gray-300">
                  Libertad total para expresarte y transaccionar sin intermediarios ni restricciones
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-white text-xl">Rentabilidad</CardTitle>
                <CardDescription className="text-gray-300">
                  Participa en el ecosistema y obtén recompensas por tu contribución a la red
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section> */}

      {/* CTA Section */}
      {/* <section className="py-20">
        <div className="container mx-auto px-4 lg:px-6">
          <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 backdrop-blur-sm">
            <CardContent className="p-12 text-center">
              <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">¿Listo para comenzar tu viaje Web3?</h3>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Únete a la revolución descentralizada hoy mismo. Sin tarifas ocultas, sin intermediarios, solo tú y la
                blockchain.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg"
                >
                  Conectar Wallet
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-4 text-lg bg-transparent"
                >
                  Leer Documentación
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section> */}

      {/* Footer */}
      {/* <footer className="border-t border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 lg:px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">DecentraApp</span>
              </div>
              <p className="text-gray-400">La DApp del futuro, disponible hoy.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Características
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Precios
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    API
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Documentación
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Tutoriales
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Comunidad</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Discord
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    Twitter
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    GitHub
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 DecentraApp. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer> */}
    </main>
  );
}
