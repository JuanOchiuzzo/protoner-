import React, { useState } from 'react';
import { Button } from './components/ui/button';
import { ProgressIndicator } from './components/ProgressIndicator';
import { ZoomableImage } from './components/ZoomableImage';
import { ImageWithFallback } from './components/figma/ImageWithFallback';
import { ArrowLeft, RotateCcw, CheckCircle, Plus, FileText, Lightbulb, Tag, Headphones, History, CreditCard, DollarSign, Banknote, Smartphone, Truck } from 'lucide-react';

type Screen = 'home' | 'consulta' | 'produtos' | 'produtos-novo' | 'verificar-pagamento' | 'boadica' | 'protoner' | 'cadastro';
type ProductType = 'boadica' | 'protoner' | null;

interface NavigationState {
  currentScreen: Screen;
  history: Screen[];
  selectedProductType: ProductType;
}

const screenSteps: Record<Screen, number> = {
  home: 1,
  consulta: 2,
  cadastro: 2,
  produtos: 3,
  'produtos-novo': 3,
  'verificar-pagamento': 4,
  boadica: 5,
  protoner: 5
};

const stepLabels = ['Início', 'Cliente', 'Produtos', 'Pagamento', 'Finalizar'];

// URLs das imagens de exemplo
const historyExampleImageUrl = 'https://i.ibb.co/hRR2y3pB/cel.png';
const historyViewImageUrl = 'https://i.ibb.co/WW73T9Sk/historico.png';
const vendedorExampleImageUrl = 'https://i.ibb.co/dwS10YNH/vendedor.png';
const cadastroExampleImageUrl = 'https://ajuda.bling.com.br/hc/article_attachments/10791100416023';
const protonerLogoUrl = 'https://images.tcdn.com.br/img/img_prod/730006/1570215196_logo_site_2.png';

export default function App() {
  const [navigation, setNavigation] = useState<NavigationState>({
    currentScreen: 'home',
    history: [],
    selectedProductType: null
  });

  const navigateTo = (screen: Screen, productType?: ProductType) => {
    setNavigation(prev => ({
      currentScreen: screen,
      history: [...prev.history, prev.currentScreen],
      selectedProductType: productType || prev.selectedProductType
    }));
  };

  const goBack = () => {
    if (navigation.history.length > 0) {
      const previousScreen = navigation.history[navigation.history.length - 1];
      setNavigation(prev => ({
        currentScreen: previousScreen,
        history: prev.history.slice(0, -1),
        selectedProductType: prev.selectedProductType
      }));
    }
  };

  const restart = () => {
    setNavigation({
      currentScreen: 'home',
      history: [],
      selectedProductType: null
    });
  };

  const canGoBack = navigation.history.length > 0;
  const currentStep = screenSteps[navigation.currentScreen];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)' }}>
      {/* Header fixo com logo */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="container mx-auto px-4 py-3 max-w-5xl">
          <div className="flex items-center justify-center">
            <button
              onClick={restart}
              className="hover:scale-105 transition-transform duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg"
              aria-label="Voltar ao início"
            >
              <ImageWithFallback
                src={protonerLogoUrl}
                alt="Logo Protoner"
                className="h-12 w-auto object-contain"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Conteúdo principal com padding para compensar o header fixo */}
      <div className="pt-20">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          {/* Progress Indicator */}
          <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={5} 
            stepLabels={stepLabels}
          />

          {/* Main Content */}
          <div className="animate-fade-in-up">
            {navigation.currentScreen === 'home' && <HomeScreen onNavigate={navigateTo} />}
            {navigation.currentScreen === 'consulta' && <ConsultaScreen onNavigate={navigateTo} />}
            {navigation.currentScreen === 'produtos' && <ProdutosScreen onNavigate={navigateTo} />}
            {navigation.currentScreen === 'produtos-novo' && <ProdutosNovoScreen onNavigate={navigateTo} />}
            {navigation.currentScreen === 'verificar-pagamento' && (
              <VerificarPagamentoScreen 
                onNavigate={navigateTo} 
                selectedProductType={navigation.selectedProductType}
              />
            )}
            {navigation.currentScreen === 'boadica' && <BoaDicaScreen />}
            {navigation.currentScreen === 'protoner' && <ProtonerScreen />}
            {navigation.currentScreen === 'cadastro' && <CadastroScreen onNavigate={navigateTo} />}
          </div>

          {/* Footer Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-white/20 p-4">
            <div className="container mx-auto max-w-5xl flex justify-between">
              <Button
                variant="outline"
                onClick={goBack}
                disabled={!canGoBack}
                className="flex items-center gap-2 bg-white/90 border-white/30 text-blue-600 hover:bg-white hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
              <Button
                variant="outline"
                onClick={restart}
                className="flex items-center gap-2 bg-white/90 border-white/30 text-blue-600 hover:bg-white hover:scale-105 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                Reiniciar
              </Button>
            </div>
          </div>

          {/* Bottom padding to account for fixed footer */}
          <div className="h-20"></div>
        </div>
      </div>
    </div>
  );
}

// Componente wrapper para usar ZoomableImage com ImageWithFallback
const ZoomableImageWithFallback: React.FC<{
  src: string;
  alt: string;
  className?: string;
  zoomLevel?: number;
  lensSize?: number;
}> = ({ src, alt, className, zoomLevel = 2.5, lensSize = 120 }) => {
  const [isZooming, setIsZooming] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [imageRect, setImageRect] = useState<DOMRect | null>(null);
  const imageRef = React.useRef<HTMLImageElement>(null);

  const handleMouseEnter = React.useCallback(() => {
    if (imageRef.current) {
      const rect = imageRef.current.getBoundingClientRect();
      setImageRect(rect);
      setIsZooming(true);
    }
  }, []);

  const handleMouseLeave = React.useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleMouseMove = React.useCallback((e: React.MouseEvent) => {
    if (!imageRect || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setMousePos({ x, y });
  }, [imageRect]);

  const getLensStyle = () => {
    if (!imageRect) return {};

    const lensX = mousePos.x - lensSize / 2;
    const lensY = mousePos.y - lensSize / 2;

    const maxX = imageRect.width - lensSize;
    const maxY = imageRect.height - lensSize;
    const clampedX = Math.max(0, Math.min(maxX, lensX));
    const clampedY = Math.max(0, Math.min(maxY, lensY));

    return {
      left: `${clampedX}px`,
      top: `${clampedY}px`,
      width: `${lensSize}px`,
      height: `${lensSize}px`,
    };
  };

  const getZoomStyle = () => {
    if (!imageRect) return {};

    const backgroundX = -(mousePos.x * zoomLevel - lensSize / 2);
    const backgroundY = -(mousePos.y * zoomLevel - lensSize / 2);

    return {
      backgroundImage: `url(${src})`,
      backgroundSize: `${imageRect.width * zoomLevel}px ${imageRect.height * zoomLevel}px`,
      backgroundPosition: `${backgroundX}px ${backgroundY}px`,
      backgroundRepeat: 'no-repeat',
    };
  };

  return (
    <div className="relative inline-block">
      <ImageWithFallback
        ref={imageRef}
        src={src}
        alt={alt}
        className={`${className} cursor-crosshair`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        draggable={false}
      />
      
      {/* Lens overlay */}
      {isZooming && imageRect && (
        <>
          {/* Lens circle */}
          <div
            className="absolute pointer-events-none border-2 border-blue-400 rounded-full shadow-lg opacity-80 transition-opacity duration-200"
            style={getLensStyle()}
          />
          
          {/* Zoomed content */}
          <div
            className="absolute pointer-events-none border-2 border-blue-400 rounded-full shadow-2xl z-10 transition-opacity duration-200"
            style={{
              ...getLensStyle(),
              ...getZoomStyle(),
            }}
          />
          
          {/* Lens effect overlay */}
          <div
            className="absolute pointer-events-none rounded-full shadow-inner transition-opacity duration-200"
            style={{
              ...getLensStyle(),
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(0.5px)',
              border: '3px solid rgba(59, 130, 246, 0.6)',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.1)',
            }}
          />
        </>
      )}
      
      {/* Instruction hint */}
      {!isZooming && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm backdrop-blur-sm">
            🔍 Passe o mouse para ampliar
          </div>
        </div>
      )}
    </div>
  );
};

// Tela 1: Página Inicial
const HomeScreen: React.FC<{ onNavigate: (screen: Screen, productType?: ProductType) => void }> = ({ onNavigate }) => (
  <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      {/* Header com ícone */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent"></div>
        <div className="relative">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Headphones className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">ATENDIMENTO - Balcão e WhatsApp</h1>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-10">
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
          Veja se tem cadastro e se necessário consulte pelo número de Cel no bling
        </p>
        <div className="space-y-5">
          <Button
            onClick={() => onNavigate('consulta')}
            className="modern-button w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <CheckCircle className="w-6 h-6" />
            Possui Cadastro
          </Button>
          <Button
            onClick={() => onNavigate('cadastro')}
            className="modern-button w-full py-6 text-lg bg-gray-500 hover:bg-gray-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Plus className="w-6 h-6" />
            Não Possui Cadastro
          </Button>
        </div>
        
        {/* Exemplo de como pesquisar no Bling */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-center text-gray-700 mb-6 font-semibold">
            💡 Exemplo: Como pesquisar cadastro pelo número de telefone no Bling
          </h3>
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-700 text-sm leading-relaxed">
                  <strong>1.</strong> Acesse Pedidos de Venda no Bling
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-amber-700 text-sm leading-relaxed">
                  <strong>2.</strong> Clique em "Adicionar Filtros" em busca customizada e escolha a opção "Telefone/Celular"
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-green-700 text-sm leading-relaxed">
                  <strong>3.</strong> Digite o número do celular para buscar o cliente
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ZoomableImageWithFallback
                src={historyExampleImageUrl}
                alt="Tela do Bling mostrando como adicionar filtros para pesquisar por celular"
                className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                zoomLevel={2.5}
                lensSize={120}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 2: Consulte o Cadastro
const ConsultaScreen: React.FC<{ onNavigate: (screen: Screen, productType?: ProductType) => void }> = ({ onNavigate }) => (
  <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Consulte o Cadastro</h1>
      </div>
      <div className="p-10">
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
          Consulte os dados do cliente no sistema para verificar as informações de cadastro e histórico.
        </p>
        <Button
          onClick={() => onNavigate('produtos')}
          className="modern-button w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
        >
          <FileText className="w-6 h-6" />
          Inserir no Pedido
        </Button>
        
        {/* Exemplo de como visualizar histórico */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-center text-gray-700 mb-6 font-semibold">
            📋 Exemplo: Como visualizar histórico de compras do cliente
          </h3>
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-700 text-sm leading-relaxed">
                  <strong>1.</strong> Clique no pedido do cliente na lista
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-amber-700 text-sm leading-relaxed">
                  <strong>2.</strong> Clique no ícone (i) para visualizar informações detalhadas dos preços de pedidos anteriores
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-green-700 text-sm leading-relaxed">
                  <strong>3.</strong> Analise o histórico de compras e valores anteriores
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="text-purple-700 text-sm leading-relaxed">
                  <strong>4.</strong> Use essas informações para manter consistência nos preços
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ZoomableImageWithFallback
                src={historyViewImageUrl}
                alt="Tela do Bling mostrando como visualizar histórico clicando no ícone (i) do pedido"
                className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                zoomLevel={2.5}
                lensSize={120}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 3: Inserir Produtos (para clientes com cadastro)
const ProdutosScreen: React.FC<{ onNavigate: (screen: Screen, productType?: ProductType) => void }> = ({ onNavigate }) => (
  <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center">
        <h1 className="text-2xl font-bold text-white">Inserir Produtos</h1>
      </div>
      <div className="p-10">
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
          Inserir no pedido os produtos informados pelo cliente com as quantidades.
        </p>
        <div className="space-y-5">
          <Button
            onClick={() => onNavigate('verificar-pagamento', 'boadica')}
            className="modern-button w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Lightbulb className="w-6 h-6" />
            Boa Dica
          </Button>
          <Button
            onClick={() => onNavigate('verificar-pagamento', 'protoner')}
            className="modern-button w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Tag className="w-6 h-6" />
            Protoner
          </Button>
        </div>
        
        {/* Exemplo de como identificar o tipo de cliente */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-center text-gray-700 mb-6 font-semibold">
            🔍 Exemplo: Como identificar se o cliente é Protoner ou Boa Dica
          </h3>
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-700 text-sm leading-relaxed">
                  <strong>1.</strong> Consulte o histórico de compras do cliente conforme mostrado anteriormente
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-amber-700 text-sm leading-relaxed">
                  <strong>2.</strong> Verifique a opção "Vendedor" no pedido para identificar o tipo de cliente
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-green-700 text-sm leading-relaxed">
                  <strong>3.</strong> Se aparecer "Protoner" no campo vendedor = cliente Protoner
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="text-purple-700 text-sm leading-relaxed">
                  <strong>4.</strong> Se aparecer "Boa Dica" no campo vendedor = cliente Boa Dica
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ZoomableImageWithFallback
                src={vendedorExampleImageUrl}
                alt="Tela do Bling mostrando como verificar o campo vendedor para identificar se é cliente Protoner ou Boa Dica"
                className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                zoomLevel={2.5}
                lensSize={120}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 3b: Inserir Produtos (para clientes novos/sem cadastro)
const ProdutosNovoScreen: React.FC<{ onNavigate: (screen: Screen, productType?: ProductType) => void }> = ({ onNavigate }) => (
  <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
        <h1 className="text-2xl font-bold text-white">Inserir Produtos - Novo Cliente</h1>
      </div>
      <div className="p-10">
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
          Inserir no pedido os produtos informados pelo cliente com as quantidades.
        </p>
        <div className="space-y-5">
          <Button
            onClick={() => onNavigate('verificar-pagamento', 'boadica')}
            className="modern-button w-full py-6 text-lg bg-amber-500 hover:bg-amber-600 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Lightbulb className="w-6 h-6" />
            Boa Dica
          </Button>
          <Button
            onClick={() => onNavigate('verificar-pagamento', 'protoner')}
            className="modern-button w-full py-6 text-lg bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
          >
            <Tag className="w-6 h-6" />
            Protoner
          </Button>
        </div>
        
        {/* Exemplo completo de cadastro no Bling */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <h3 className="text-center text-gray-700 mb-6 font-semibold">
            📝 Exemplo: Como cadastrar cliente e criar pedido no Bling direto do "FRENTE DE CAIXA"
          </h3>
          <div className="bg-gray-50 rounded-2xl p-6 shadow-sm">
            <div className="space-y-4">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                <p className="text-blue-700 text-sm leading-relaxed">
                  <strong>1. ABA CLIENTE:</strong> Cadastre apenas NOME e TELEFONE para venda simples. Para nota fiscal, adicione CPF/CNPJ e endereço completo.
                </p>
              </div>
              <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-r-lg">
                <p className="text-purple-700 text-sm leading-relaxed">
                  <strong>2. ABA PRODUTO:</strong> Use sempre "Pesquisa Avançada" para localizar produtos. Após selecionar não esqueça de definir o PREÇO e clicar em "INSERIR".
                </p>
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
                <p className="text-amber-700 text-sm leading-relaxed">
                  <strong>3. MÚLTIPLOS PRODUTOS:</strong> Após inserir um produto, aparecerá uma pergunta. Clique "NÃO" para adicionar mais produtos ou "SIM" para finalizar e ser direcionado para aba "pagamento".
                </p>
              </div>
              <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
                <p className="text-green-700 text-sm leading-relaxed">
                  <strong>4. ABA PAGAMENTO:</strong> Selecione a forma de pagamento e o TIPO DE VENDEDOR (Protoner ou Boa Dica). Depois clique em "Finalizar Venda".
                </p>
              </div>
            </div>
            <div className="mt-6">
              <ZoomableImageWithFallback
                src={cadastroExampleImageUrl}
                alt="Tela do Bling mostrando o processo completo de cadastro de cliente e criação de pedido"
                className="w-full h-auto rounded-lg shadow-md border border-gray-200"
                zoomLevel={2.5}
                lensSize={120}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 4: Verificar Forma de Pagamento
const VerificarPagamentoScreen: React.FC<{ 
  onNavigate: (screen: Screen, productType?: ProductType) => void;
  selectedProductType: ProductType;
}> = ({ onNavigate, selectedProductType }) => {
  const [valor, setValor] = useState<string>('');
  const [formaPagamento, setFormaPagamento] = useState<string>('');

  // Configuração das taxas de cada forma de pagamento
  const taxasPagamento: Record<string, number> = {
    dinheiro: 0,
    pix: 5,
    debito: 5,
    credito: 10,
    boleto: 0,
    entrega: 30
  };

  // Calcular valor final
  const calcularValorFinal = (): number => {
    if (!valor || !formaPagamento) return 0;
    
    const valorNumerico = parseFloat(valor.replace(',', '.'));
    if (isNaN(valorNumerico)) return 0;
    
    const taxa = taxasPagamento[formaPagamento] || 0;
    return valorNumerico * (1 + taxa / 100);
  };

  const valorFinal = calcularValorFinal();

  const handleFinalizar = () => {
    if (selectedProductType === 'boadica') {
      onNavigate('boadica');
    } else if (selectedProductType === 'protoner') {
      onNavigate('protoner');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
      <div className="modern-card overflow-hidden">
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Verificar Forma de Pagamento</h1>
        </div>
        <div className="p-10">
          <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
            Verifique qual é a forma de pagamento preferida do cliente e confirme as informações do pedido.
          </p>
          
          {/* Indicador da escolha anterior */}
          {selectedProductType && (
            <div className="mb-8 p-6 bg-gray-50 rounded-2xl border-l-4 border-blue-400">
              <div className="flex items-center gap-3 mb-6">
                {selectedProductType === 'boadica' ? (
                  <Lightbulb className="w-6 h-6 text-amber-500" />
                ) : (
                  <Tag className="w-6 h-6 text-blue-500" />
                )}
                <div>
                  <p className="font-semibold text-gray-800">
                    Tipo selecionado: {selectedProductType === 'boadica' ? 'Boa Dica' : 'Protoner'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProductType === 'boadica' 
                      ? 'Preencha o valor e selecione a forma de pagamento para calcular o valor final.'
                      : 'Siga as instruções específicas do Protoner para definir preços e condições.'
                    }
                  </p>
                </div>
              </div>

              {/* Formulário de valor - apenas para Boa Dica */}
              {selectedProductType === 'boadica' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      💰 Valor do produto (R$)
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={valor}
                        onChange={(e) => setValor(e.target.value)}
                        placeholder="0,00"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Opções de pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-4">
                      💳 Forma de pagamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'dinheiro', label: 'Dinheiro', icon: Banknote, taxa: '0%' },
                        { key: 'pix', label: 'PIX', icon: Smartphone, taxa: '+5%' },
                        { key: 'debito', label: 'Débito', icon: CreditCard, taxa: '+5%' },
                        { key: 'credito', label: 'Crédito', icon: CreditCard, taxa: '+10%' },
                        { key: 'boleto', label: 'Boleto', icon: FileText, taxa: '0%' },
                        { key: 'entrega', label: 'Entrega', icon: Truck, taxa: '+30%' }
                      ].map(({ key, label, icon: Icon, taxa }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormaPagamento(key)}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            formaPagamento === key
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <Icon className="w-6 h-6" />
                            <span className="text-sm font-medium">{label}</span>
                            <span className="text-xs opacity-70">{taxa}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Resultado calculado */}
                  {valor && formaPagamento && (
                    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 text-center">
                      <p className="text-sm font-medium text-green-700 mb-2">Valor final:</p>
                      <p className="text-3xl font-bold text-green-800">
                        R$ {valorFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      {taxasPagamento[formaPagamento] > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          Inclui {taxasPagamento[formaPagamento]}% de acréscimo
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-lg">
              <h3 className="font-semibold text-blue-800 mb-2">📋 Perguntas importantes:</h3>
              <ul className="text-blue-700 text-sm space-y-2">
                <li>• Qual será a forma de pagamento?</li>
                <li>• À vista ou parcelado?</li>
                <li>• Cartão, PIX, dinheiro ou boleto?</li>
                <li>• Há algum desconto aplicável?</li>
              </ul>
            </div>

            <Button
              onClick={handleFinalizar}
              className="modern-button w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg"
            >
              <CheckCircle className="w-6 h-6" />
              Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Tela 5: Detalhe Boa Dica
const BoaDicaScreen: React.FC = () => (
  <div className="w-full max-w-3xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-8 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lightbulb className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Boa Dica — Procedimento de Valor e Marca</h1>
      </div>
      <div className="p-10">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-amber-800 mb-4 text-lg">💰 VALOR</h3>
            <p className="text-amber-700 leading-relaxed text-base">
              Veja histórico e mantenha igual ou maior do que o anunciado.
            </p>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-blue-800 mb-4 text-lg">ℹ️ OBSERVAÇÃO</h3>
            <p className="text-blue-700 leading-relaxed text-base">
              Se o cliente informar o valor do BoaDica e tivermos a marca, pode fazer sem problemas.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-green-800 mb-4 text-lg">🏷️ MARCA</h3>
            <p className="text-green-700 leading-relaxed text-base">
              Não tendo a marca, ofereça o valor anunciado, e só faça desconto se necessário.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 6: Detalhe Protoner
const ProtonerScreen: React.FC = () => (
  <div className="w-full max-w-3xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Protoner — Procedimento de Valor e Marca</h1>
      </div>
      <div className="p-10">
        <div className="space-y-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-l-4 border-blue-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-blue-800 mb-4 text-lg">💰 VALOR</h3>
            <p className="text-blue-700 leading-relaxed text-base">
              Consulte no site.
            </p>
          </div>
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-green-800 mb-4 text-lg">🔄 ATUALIZAÇÃO</h3>
            <p className="text-green-700 leading-relaxed text-base">
              Use o valor do site atualizado.
            </p>
          </div>
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-400 p-8 rounded-r-2xl shadow-sm">
            <h3 className="font-bold text-purple-800 mb-4 text-lg">🏷️ MARCA</h3>
            <p className="text-purple-700 leading-relaxed text-base">
              Use a marca mais barata ou a solicitada.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Tela 7: Cadastrar Novo Cliente
const CadastroScreen: React.FC<{ onNavigate: (screen: Screen, productType?: ProductType) => void }> = ({ onNavigate }) => (
  <div className="w-full max-w-2xl mx-auto animate-slide-in-scale">
    <div className="modern-card overflow-hidden">
      <div className="bg-gradient-to-r from-green-500 to-green-600 px-8 py-6 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Cadastrar Novo Cliente</h1>
      </div>
      <div className="p-10">
        <p className="text-center text-gray-600 mb-10 text-lg leading-relaxed">
          Pergunte se viu o preço em algum lugar ou como encontrou a nossa loja.
        </p>
        
        {/* Observação importante sobre classificação de clientes */}
        <div className="mb-10 p-6 bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl shadow-sm">
          <h3 className="font-bold text-amber-800 mb-3 text-lg">⚠️ IMPORTANTE - Classificação do Cliente</h3>
          <div className="space-y-3">
            <div className="bg-amber-100 border border-amber-200 p-4 rounded-xl">
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>🟡 Cliente Boa Dica:</strong> APENAS se o cliente disser que veio do "Boa Dica" ou mencionar especificamente essa marca.
              </p>
            </div>
            <div className="bg-blue-100 border border-blue-200 p-4 rounded-xl">
              <p className="text-blue-800 text-sm leading-relaxed">
                <strong>🔵 Cliente Protoner:</strong> QUALQUER outra resposta (Google, indicação, redes sociais, etc.) que NÃO mencione o "Boa Dica".
              </p>
            </div>
          </div>
        </div>
        
        <Button
          onClick={() => onNavigate('produtos-novo')}
          className="modern-button w-full py-6 text-lg bg-green-600 hover:bg-green-700 text-white rounded-2xl flex items-center justify-center gap-3 shadow-lg mb-10"
        >
          <FileText className="w-6 h-6" />
          Inserir no Pedido
        </Button>

      </div>
    </div>
  </div>
);