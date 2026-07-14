import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Check, Copy, Eye, Sliders, Type, Grid, Heart, HelpCircle,
  Smartphone, Monitor, Laptop, Image, Scissors, Info, Layout, Layers,
  ChevronRight, Compass, ArrowUpRight, Award, CornerDownRight, FileText, CheckCircle2, AlertCircle
} from 'lucide-react';

interface BrandIdentityViewProps {
  lang: 'pt' | 'en' | 'es';
}

type TabId = 'story' | 'logo' | 'icon' | 'colors' | 'typography' | 'geometry' | 'rules' | 'mockups';

export default function BrandIdentityView({ lang }: BrandIdentityViewProps) {
  const [activeTab, setActiveTab] = useState<TabId>('story');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Logo render styles
  const [logoRenderStyle, setLogoRenderStyle] = useState<'full' | 'mono' | 'gold' | 'rosegold' | 'embossed'>('full');
  const [logoBackground, setLogoBackground] = useState<'light' | 'dark' | 'chocolate' | 'grid'>('light');

  // App icon style state
  const [iconPreviewStyle, setIconPreviewStyle] = useState<'rosegold' | 'gold' | 'dark' | 'white'>('rosegold');

  // Interactive Typography text
  const [customTyposText, setCustomTyposText] = useState<string>('RenaSer');

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const dictionary = {
    pt: {
      title: "Identidade de Marca RenaSer",
      subtitle: "Diretrizes de Marca, Conceitos Visuais e Suite de Ativos Premium",
      intro: "Esta é a assinatura visual de um movimento. RenaSer não é sobre se tornar alguém novo — é sobre lembrar quem você já é. Uma marca projetada para ser atemporal, elegante e emocionalmente poderosa.",
      tabs: {
        story: "Manifesto & Conceito",
        logo: "A Suite de Logos",
        icon: "O Ícone do Aplicativo",
        colors: "Paleta & Materiais",
        typography: "Tipografia",
        geometry: "Geometria & Margens",
        rules: "Do's & Don'ts",
        mockups: "Ecosystem Studio"
      },
      philosophy: {
        title: "A Filosofia da Marca",
        tagline: "se lembre de quem você é",
        description1: "O logotipo da RenaSer foi construído sob o princípio do refinamento e da verdade pessoal. Evitamos os clichês óbvios do mercado de bem-estar (como flores de lótus, mandalas ou asas de anjo). Em vez disso, nos inspiramos em geometrias puras e no movimento orgânico.",
        description2: "A marca evoca a transformação da borboleta, o crescimento elegante, a luz e a presença. Ela deve parecer algo desenhado pela Apple, Airbnb ou Arc Browser: minimalista, luxuosa e eterna."
      },
      logoSuite: {
        title: "Tipografia como Identidade",
        desc: "A palavra RenaSer é a heroína absoluta. A letra 'S' é sutilmente enfatizada — não de forma exagerada ou gigante, mas com o equilíbrio óptico perfeito para atuar como o ponto de virada, o despertar e o movimento contínuo.",
        renderStyle: "Estilo de Renderização",
        bgStyle: "Fundo de Visualização",
        primary: "Logotipo Principal",
        primaryDesc: "A assinatura de marca padrão com alinhamento e proporções ideais.",
        horizontal: "Logotipo Horizontal",
        horizontalDesc: "Otimizado para barras de navegação estreitas e cabeçalhos web.",
        stacked: "Logotipo Empilhado",
        stackedDesc: "Perfeito para mídias sociais, impressões quadradas e embalagens."
      },
      appIcon: {
        title: "Ícone do Aplicativo",
        desc: "Um ícone standalone premium que os usuários reconhecem instantaneamente em sua tela inicial. Ele evita o clichê de usar apenas a letra 'R'. Em vez disso, explora abstrações geométricas construídas ao redor da letra 'S', curvas orgânicas de asas de borboleta e movimento contínuo.",
        mockupsTitle: "Efeito no Ecossistema",
        mockupsDesc: "Como o ícone da RenaSer se destaca ao lado de outras marcas de classe mundial."
      },
      colors: {
        title: "Paleta Cromática & Materiais",
        desc: "Uma seleção de tons quentes, naturais e de extremo luxo que dão o 'vibe' de sofisticação, calma e modernidade.",
        copySuccess: "Copiado!",
        primaryColor: "Ouro Rosa Principal",
        primaryHighlight: "Destaque Ouro Rosa Secundário",
        accentColor: "Ouro de Luxo",
        lightBg: "Marfim Quente (Fundo)",
        darkBg: "Marrom Chocolate Profundo (Fundo)"
      },
      typography: {
        title: "Diretrizes de Tipografia",
        desc: "A tipografia é o alicerce de nossa sofisticação editorial. Usamos 'Playfair Display' para títulos display expressivos, e 'Outfit' para uma interface limpa, moderna e altamente legível.",
        fontPairing: "Combinação de Fontes Recomendada",
        headingFont: "Fonte Display: Playfair Display",
        headingDesc: "Usada para grandes cabeçalhos, citações e momentos de profunda reflexão. Expressa elegância clássica.",
        bodyFont: "Fonte Sans: Outfit",
        bodyDesc: "Usada para a interface do aplicativo, textos explicativos e botões. Transmite modernidade e precisão.",
        tryText: "Teste a Tipografia com seu texto:"
      },
      geometry: {
        title: "Geometria, Proporção e Margens",
        desc: "Nosso sistema visual exige espaço para respirar. O logotipo RenaSer é protegido por regras rígidas de espaçamento óptico baseadas na própria largura do 'S' (definida como 'X').",
        clearSpaceTitle: "Área de Respiro Livre (Clear Space)",
        clearSpaceDesc: "Nenhum elemento gráfico, texto ou margem de página deve invadir a área de proteção 1X ao redor do logotipo.",
        minSizeTitle: "Limites de Tamanho Mínimo",
        minSizeDesc: "Para manter a legibilidade máxima e a fidelidade da marca, siga os tamanhos mínimos absolutos:",
        digitalSize: "Digital (Telas): Mínimo 80px de largura",
        printSize: "Impressão: Mínimo 18mm de largura",
        iconSize: "Favicon / Watermark: Mínimo 16px"
      },
      rules: {
        title: "Regras de Uso de Marca",
        desc: "Mantenha a pureza e a força do RenaSer em todas as aplicações possíveis.",
        dos: "Uso Permitido (Do's)",
        donts: "Práticas Proibidas (Don'ts)"
      },
      mockups: {
        title: "Aplicações de Marca",
        desc: "Visualizações realistas de como a marca RenaSer se comporta na vida real, desde materiais físicos refinados até telas e mídias sociais."
      }
    },
    en: {
      title: "RenaSer Brand Identity",
      subtitle: "Brand Guidelines, Visual Concepts & Premium Asset Suite",
      intro: "This is the visual signature of a movement. RenaSer is not about becoming someone new — it is about remembering who you already are. A brand designed to be timeless, elegant, and emotionally powerful.",
      tabs: {
        story: "Manifesto & Concept",
        logo: "The Logo Suite",
        icon: "The App Icon",
        colors: "Palette & Materials",
        typography: "Typography",
        geometry: "Geometry & Clear Space",
        rules: "Do's & Don'ts",
        mockups: "Ecosystem Studio"
      },
      philosophy: {
        title: "The Brand Philosophy",
        tagline: "remember who you are",
        description1: "The RenaSer logo was built on the principles of refinement and personal truth. We strictly avoid the obvious wellness clichés (such as lotus flowers, mandalas, or angel wings). Instead, we draw inspiration from pure geometry and organic motion.",
        description2: "The brand evokes butterfly transformation, elegant movement, light, and presence. It feels like something Apple, Airbnb, or Arc Browser could have designed: minimal, luxury, and eternal."
      },
      logoSuite: {
        title: "Typography is the Logo",
        desc: "The word 'RenaSer' is the absolute hero. The capital 'S' is subtly emphasized — not oversized or exaggerated, but with the perfect optical alignment to symbolize the turning point, awakening, and continuous movement.",
        renderStyle: "Render Finish",
        bgStyle: "Background View",
        primary: "Primary Logo",
        primaryDesc: "The standard brand signature with ideal alignment and proportions.",
        horizontal: "Horizontal Logo",
        horizontalDesc: "Optimized for thin navigation bars and web headers.",
        stacked: "Stacked Logo",
        stackedDesc: "Perfect for social media, square prints, and packaging."
      },
      appIcon: {
        title: "The App Icon",
        desc: "A premium standalone app icon that users recognize instantly on their home screen. It avoids the generic cliché of using only the letter 'R'. Instead, it explores geometric abstractions built around the letter 'S', organic butterfly wing curves, and continuous flow.",
        mockupsTitle: "Ecosystem Positioning",
        mockupsDesc: "How the RenaSer icon stands out beautifully alongside world-class brands."
      },
      colors: {
        title: "Color Palette & Materials",
        desc: "A carefully curated selection of warm, natural, luxury tones that evoke sophistication, calm, and modern confidence.",
        copySuccess: "Copied!",
        primaryColor: "Primary Rose Gold",
        primaryHighlight: "Secondary Rose Gold Highlight",
        accentColor: "Luxury Gold",
        lightBg: "Warm Ivory (Background)",
        darkBg: "Deep Chocolate Brown (Background)"
      },
      typography: {
        title: "Typography Recommendations",
        desc: "Typography is the cornerstone of our editorial sophistication. We pair 'Playfair Display' for expressive display headings with 'Outfit' for a clean, modern, and highly legible UI.",
        fontPairing: "Recommended Font Pairing",
        headingFont: "Display Typeface: Playfair Display",
        headingDesc: "Used for major headings, quotes, and moments of deep reflection. Expresses classical elegance.",
        bodyFont: "Sans Typeface: Outfit",
        bodyDesc: "Used for application UI, micro-copy, and active elements. Conveys modernity and absolute precision.",
        tryText: "Try the Typography with your text:"
      },
      geometry: {
        title: "Refined Geometry & Proportions",
        desc: "Our visual identity demands generous negative space. The RenaSer logo is protected by strict optical spacing rules based on the width of the central 'S' (defined as 'X').",
        clearSpaceTitle: "Clear Space Rule",
        clearSpaceDesc: "No graphic element, text, or boundary should infringe upon the 1X safe zone surrounding the logo.",
        minSizeTitle: "Minimum Size Limits",
        minSizeDesc: "To ensure maximum legibility and brand premium quality across all mediums, follow these minimum sizes:",
        digitalSize: "Digital Screens: Minimum 80px width",
        printSize: "Print/Merchandise: Minimum 18mm width",
        iconSize: "Favicon / Video Watermark: Minimum 16px"
      },
      rules: {
        title: "Brand Mark Usage Rules",
        desc: "Protect the purity and emotional power of RenaSer across all brand applications.",
        dos: "Approved Usage (Do's)",
        donts: "Prohibited Actions (Don'ts)"
      },
      mockups: {
        title: "Ecosystem Studio",
        desc: "Real-world visual simulations of how the RenaSer identity shines on premium collateral, editorial designs, and digital devices."
      }
    },
    es: {
      title: "Identidad de Marca RenaSer",
      subtitle: "Guía de Estilo, Conceptos Visuales y Suite de Activos Premium",
      intro: "Esta es la firma visual de un movimiento. RenaSer no se trata de convertirse en alguien nuevo, sino de recordar quién ya eres. Una marca diseñada para ser atemporal, elegante y emocionalmente poderosa.",
      tabs: {
        story: "Manifiesto & Concepto",
        logo: "La Suite de Logos",
        icon: "El Icono de App",
        colors: "Paleta & Materiales",
        typography: "Tipografía",
        geometry: "Geometría & Márgenes",
        rules: "Do's & Don'ts",
        mockups: "Ecosystem Studio"
      },
      philosophy: {
        title: "La Filosofía de Marca",
        tagline: "recuerda quién eres",
        description1: "El logotipo de RenaSer fue construido sobre principios de refinamiento y verdad personal. Evitamos estrictamente los clichés obvios de bienestar (como flores de lótus, mandalas o alas). En su lugar, nos inspiramos en geometrías puras y movimiento orgánico.",
        description2: "La marca evoca la transformación de la mariposa, el crecimiento elegante, la luz y la presencia. Se siente como algo diseñado por Apple, Airbnb o Arc Browser: minimalista, lujoso y eterno."
      },
      logoSuite: {
        title: "La Tipografía es el Logo",
        desc: "La palabra 'RenaSer' es la heroína absoluta. La 'S' mayúscula está sutilmente enfatizada; no es de gran tamaño ni exagerada, sino con la alineación óptica perfecta para simbolizar el punto de inflexión, el despertar y el movimiento continuo.",
        renderStyle: "Estilo de Acabado",
        bgStyle: "Fondo de Visualización",
        primary: "Logotipo Principal",
        primaryDesc: "La firma estándar de la marca con alineación y proporciones ideales.",
        horizontal: "Logotipo Horizontal",
        horizontalDesc: "Optimizado para barras de navegación estrechas y cabeceras web.",
        stacked: "Logotipo Empilhado",
        stackedDesc: "Perfecto para redes sociales, impresiones cuadradas y empaques."
      },
      appIcon: {
        title: "El Icono del Aplicativo",
        desc: "Un icono independiente premium que los usuarios reconocen al instante en su pantalla de inicio. Evita el cliché genérico de usar solo la letra 'R'. En su lugar, explora abstracciones geométricas construidas alrededor de la letra 'S', curvas de alas de mariposa y flujo continuo.",
        mockupsTitle: "Efecto en el Ecosistema",
        mockupsDesc: "Cómo se destaca el icono de RenaSer junto a marcas de clase mundial."
      },
      colors: {
        title: "Paleta de Colores & Materiales",
        desc: "Una selección curada de tonos cálidos, naturales y de lujo que inspiran sofisticación, calma y confianza moderna.",
        copySuccess: "¡Copiado!",
        primaryColor: "Oro Rosa Principal",
        primaryHighlight: "Destaque Oro Rosa Secundario",
        accentColor: "Oro de Lujo",
        lightBg: "Marfil Cálido (Fondo)",
        darkBg: "Marrón Chocolate Profundo (Fundo)"
      },
      typography: {
        title: "Directrices de Tipografía",
        desc: "La tipografía es la base de nuestra sofisticación editorial. Combinamos 'Playfair Display' para títulos expresivos y 'Outfit' para una interfaz limpia, moderna y altamente legible.",
        fontPairing: "Combinación de Fuentes Recomendada",
        headingFont: "Tipografía Display: Playfair Display",
        headingDesc: "Usada para grandes títulos, citas y momentos de reflexión profunda. Expresa elegancia clásica.",
        bodyFont: "Tipografía Sans: Outfit",
        bodyDesc: "Usada para la interfaz del aplicativo, micro-textos y botones. Transmite modernidad y precisión.",
        tryText: "Prueba la Tipografía con tu texto:"
      },
      geometry: {
        title: "Geometría Refinada y Proporciones",
        desc: "Nuestra identidad visual exige un generoso espacio negativo. El logotipo de RenaSer está protegido por reglas ópticas estrictas de espaciado basadas en el ancho de la 'S' central (definido como 'X').",
        clearSpaceTitle: "Regla del Área Libre",
        clearSpaceDesc: "Ningún elemento gráfico, texto o borde debe interferir en la zona segura de 1X que rodea al logotipo.",
        minSizeTitle: "Límites de Tamaño Mínimo",
        minSizeDesc: "Para asegurar la máxima legibilidad y la calidad premium de la marca en todos los medios, siga estos tamaños mínimos:",
        digitalSize: "Pantallas Digitales: Mínimo 80px de ancho",
        printSize: "Impresión: Mínimo 18mm de ancho",
        iconSize: "Favicon / Video Watermark: Mínimo 16px"
      },
      rules: {
        title: "Reglas de Uso de Marca",
        desc: "Conserve la pureza y el impacto emocional de RenaSer en todas las aplicaciones de marca.",
        dos: "Uso Aprobado (Do's)",
        donts: "Acciones Prohibidas (Don'ts)"
      },
      mockups: {
        title: "Estudio de Ecosistema",
        desc: "Visualizaciones realistas de cómo brilla la identidad de RenaSer en papelería de lujo, productos editoriales y dispositivos móviles."
      }
    }
  }[lang];

  // Helper to render the geometric S butterfly app icon
  const renderGeometricIcon = (className: string, strokeWidth = 3, gradientId = "iconGrad") => {
    return (
      <svg viewBox="0 0 100 100" className={className}>
        <defs>
          <linearGradient id="iconGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#BF953F" />
            <stop offset="25%" stopColor="#FCF6BA" />
            <stop offset="50%" stopColor="#B38728" />
            <stop offset="100%" stopColor="#AA771C" />
          </linearGradient>
          <linearGradient id="iconGradRose" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B76E79" />
            <stop offset="50%" stopColor="#E8B4A0" />
            <stop offset="100%" stopColor="#B76E79" />
          </linearGradient>
          <linearGradient id="iconGradWhite" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
        </defs>
        
        {/* Continuous organic loop that creates a stylized "S" as two butterfly wings folded */}
        <motion.path 
          d="M 50,18 
             C 28,18 18,36 34,48 
             C 50,60 70,64 54,82 
             C 38,94 22,82 22,70 
             M 50,82 
             C 72,82 82,64 66,52 
             C 50,40 30,36 46,18 
             C 62,6 78,18 78,30"
          stroke={
            iconPreviewStyle === 'gold' ? 'url(#iconGradGold)' :
            iconPreviewStyle === 'rosegold' ? 'url(#iconGradRose)' :
            iconPreviewStyle === 'white' ? 'url(#iconGradWhite)' : '#B76E79'
          }
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: "easeInOut" }}
        />
        
        {/* Subtle geometric structural dots representing precision */}
        <circle cx="50" cy="18" r="2" fill={iconPreviewStyle === 'gold' ? '#D4AF37' : '#B76E79'} className="opacity-40" />
        <circle cx="50" cy="82" r="2" fill={iconPreviewStyle === 'gold' ? '#D4AF37' : '#B76E79'} className="opacity-40" />
        <circle cx="50" cy="50" r="1.5" fill={iconPreviewStyle === 'gold' ? '#FCF6BA' : '#E8B4A0'} className="opacity-60" />
      </svg>
    );
  };

  // Helper to render the typographic logo "RenaSer"
  const renderLogo = (style: typeof logoRenderStyle, layout: 'primary' | 'horizontal' | 'stacked' = 'primary') => {
    let colorClass = "";
    let sStyle = {};
    let textStyle = {};

    if (style === 'mono') {
      colorClass = "text-slate-900 dark:text-white";
    } else if (style === 'gold') {
      colorClass = "metallic-gold";
    } else if (style === 'rosegold') {
      colorClass = "metallic-rosegold";
    } else if (style === 'embossed') {
      colorClass = "text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-slate-600 dark:to-slate-800";
      sStyle = { filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.15))" };
    } else {
      // Full color
      colorClass = "text-[#B76E79]";
    }

    const sSpan = (
      <span 
        style={sStyle}
        className={`font-extrabold transition-all duration-300 ${
          style === 'full' ? 'text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.4)]' : ''
        }`}
      >
        S
      </span>
    );

    if (layout === 'horizontal') {
      return (
        <div className="flex items-center gap-4">
          {renderGeometricIcon("h-10 w-10 shrink-0", 2.5)}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <h1 className={`text-2xl font-sans tracking-[0.18em] uppercase font-light leading-none ${colorClass}`}>
            Rena{sSpan}er
          </h1>
        </div>
      );
    }

    if (layout === 'stacked') {
      return (
        <div className="flex flex-col items-center gap-4 text-center">
          {renderGeometricIcon("h-16 w-16", 2.8)}
          <h1 className={`text-2xl font-sans tracking-[0.25em] uppercase font-light leading-none mt-2 ${colorClass}`}>
            Rena{sSpan}er
          </h1>
          <span className="text-[9px] tracking-[0.4em] font-sans uppercase text-[#E8B4A0] dark:text-slate-400 mt-1 block">
            {dictionary.philosophy.tagline}
          </span>
        </div>
      );
    }

    // Default Primary
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <h1 className={`text-4xl sm:text-5xl md:text-6xl font-sans tracking-[0.28em] uppercase font-light text-center leading-normal select-none ${colorClass}`}>
          Rena{sSpan}er
        </h1>
        <p className="text-[10px] sm:text-xs tracking-[0.35em] font-sans uppercase text-[#E8B4A0] dark:text-slate-400 mt-4 font-light text-center">
          {dictionary.philosophy.tagline}
        </p>
      </div>
    );
  };

  return (
    <div className="space-y-12">
      {/* Editorial Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-[#2C221E] to-[#1E1715] p-8 sm:p-12 lg:p-16 border border-[#B76E79]/15 shadow-rosegold text-white">
        {/* Luxury subtle decoration loops */}
        <div className="absolute top-0 right-0 h-96 w-96 bg-[#B76E79]/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 h-96 w-96 bg-[#D4AF37]/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Floating Abstract Line artwork */}
        <div className="absolute top-1/2 right-12 -translate-y-1/2 opacity-10 hidden xl:block">
          {renderGeometricIcon("w-64 h-64", 1.5)}
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-3">
            <span className="px-4 py-1.5 rounded-full bg-[#B76E79]/15 border border-[#B76E79]/30 text-xs font-sans font-bold uppercase tracking-[0.25em] text-[#E8B4A0]">
              Brand Portal
            </span>
            <div className="flex gap-1">
              <Award className="h-4.5 w-4.5 text-[#D4AF37] animate-pulse" />
              <span className="text-[10px] uppercase font-sans tracking-widest text-[#D4AF37] font-semibold">10-Year Timeless System</span>
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-light tracking-tight text-white leading-none">
            {dictionary.title}
          </h1>
          
          <p className="text-sm sm:text-base font-sans text-slate-300 tracking-wide font-light max-w-xl leading-relaxed">
            {dictionary.subtitle}
          </p>

          <p className="text-xs sm:text-sm font-serif italic text-[#E8B4A0] leading-relaxed max-w-xl border-l-2 border-[#B76E79]/30 pl-4">
            {dictionary.intro}
          </p>
        </div>
      </div>

      {/* Tabs Menu Navigation */}
      <div className="flex overflow-x-auto gap-2 p-1.5 bg-rose-50/20 dark:bg-[#1E1715]/40 border border-[#B76E79]/10 rounded-[1.8rem] scrollbar-none shadow-inner">
        {(Object.keys(dictionary.tabs) as TabId[]).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-5 py-3 rounded-full text-xs font-sans font-semibold uppercase tracking-wider transition-all duration-300 shrink-0 cursor-pointer ${
              activeTab === tabKey
                ? 'bg-[#B76E79] text-white shadow-rosegold hover:scale-[1.02]'
                : 'text-slate-500 hover:text-[#B76E79] hover:bg-rose-50/50 dark:hover:bg-[#2C221E]/30'
            }`}
          >
            {dictionary.tabs[tabKey]}
          </button>
        ))}
      </div>

      {/* Primary Workspace View Area */}
      <div className="min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* TAB: Story & Concept */}
            {activeTab === 'story' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-7 bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 sm:p-10 shadow-rosegold flex flex-col justify-between">
                  <div className="space-y-6">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🌱</span>
                      <h2 className="text-2xl sm:text-3xl font-display font-light text-slate-900 dark:text-white">
                        {dictionary.philosophy.title}
                      </h2>
                    </div>

                    <div className="h-px bg-rose-100/10" />

                    <p className="text-base font-serif italic text-[#B76E79] tracking-wider uppercase font-light">
                      "{dictionary.philosophy.tagline}"
                    </p>

                    <div className="space-y-4 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-light font-sans">
                      <p>{dictionary.philosophy.description1}</p>
                      <p>{dictionary.philosophy.description2}</p>
                    </div>
                  </div>

                  <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-rose-100/15">
                    {[
                      { icon: <Compass className="h-4 w-4 text-[#B76E79]" />, label: lang === 'pt' ? "Reencontro" : "Reconnecting" },
                      { icon: <Sparkles className="h-4 w-4 text-[#D4AF37]" />, label: lang === 'pt' ? "Verdade" : "Truth" },
                      { icon: <Heart className="h-4 w-4 text-[#E8B4A0]" />, label: lang === 'pt' ? "Elegância" : "Elegance" }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-sans text-slate-500">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5 bg-gradient-to-b from-[#FAF8F5] to-[#E8B4A0]/20 dark:from-[#2C221E] dark:to-[#1E1715] rounded-[2rem] border border-rose-100/20 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-rosegold min-h-[350px]">
                  {/* Subtle radiating grid */}
                  <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />
                  
                  <div className="relative space-y-8">
                    <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {renderGeometricIcon("w-44 h-44 mx-auto", 1.8)}
                    </motion.div>

                    <div className="space-y-2">
                      <h3 className="text-xs font-sans uppercase tracking-[0.3em] text-[#B76E79] font-bold">
                        RenaSer Visual Signature
                      </h3>
                      <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                        Continuous ribbon curves forming the symmetric loops of the "S" and wings, depicting internal awakening and continuous flow.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Logo Suite */}
            {activeTab === 'logo' && (
              <div className="space-y-8">
                {/* Visualizer Frame Controls */}
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-6 flex flex-col md:flex-row gap-6 items-center justify-between shadow-rosegold">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                      {dictionary.logoSuite.renderStyle}:
                    </span>
                    <div className="flex gap-1.5 p-1 bg-rose-50/40 dark:bg-slate-900/50 rounded-xl border border-rose-100/10">
                      {(['full', 'mono', 'gold', 'rosegold', 'embossed'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => setLogoRenderStyle(style)}
                          className={`px-3.5 py-1.5 rounded-lg text-[10px] font-sans font-bold uppercase tracking-widest transition-all cursor-pointer ${
                            logoRenderStyle === style
                              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                              : 'text-slate-500 hover:text-[#B76E79]'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400">
                      {dictionary.logoSuite.bgStyle}:
                    </span>
                    <div className="flex gap-1.5 p-1 bg-rose-50/40 dark:bg-slate-900/50 rounded-xl border border-rose-100/10">
                      {(['light', 'dark', 'chocolate', 'grid'] as const).map((bg) => (
                        <button
                          key={bg}
                          onClick={() => setLogoBackground(bg)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-sans font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                            logoBackground === bg
                              ? 'bg-[#B76E79] text-white'
                              : 'text-slate-500 hover:text-[#B76E79]'
                          }`}
                        >
                          {bg}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Primary Interactive Display Canvas */}
                <div 
                  className={`relative h-[380px] rounded-[2.5rem] border border-rose-150/15 flex items-center justify-center overflow-hidden transition-all duration-500 shadow-rosegold ${
                    logoBackground === 'light' ? 'bg-[#FAF8F5]' :
                    logoBackground === 'dark' ? 'bg-slate-950 text-white border-white/5' :
                    logoBackground === 'chocolate' ? 'bg-[#1E1715] text-white border-white/5' :
                    'bg-[#FAF8F5] bg-diagonal-grid'
                  }`}
                >
                  {/* Grid Lines Overlay if Grid mode is selected */}
                  {logoBackground === 'grid' && (
                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div className="w-full h-full" style={{ backgroundImage: 'radial-gradient(rgba(183, 110, 121, 0.15) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                      <div className="absolute top-1/2 left-0 w-full h-px bg-[#B76E79]/20" />
                      <div className="absolute left-1/2 top-0 w-px h-full bg-[#B76E79]/20" />
                    </div>
                  )}

                  {/* Embossed paper shadows if selected */}
                  {logoRenderStyle === 'embossed' && (
                    <div className="absolute inset-0 pointer-events-none shadow-inner opacity-20 bg-gradient-to-tr from-slate-500/5 via-transparent to-white/10" />
                  )}

                  {/* Render Logo */}
                  {renderLogo(logoRenderStyle, 'primary')}
                </div>

                {/* Secondary Horizontal & Stacked logo grid showcase */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Horizontal Logo Display */}
                  <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                    <div className="flex items-center justify-between border-b border-rose-100/10 pb-4">
                      <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-400">
                        {dictionary.logoSuite.horizontal}
                      </h3>
                      <button 
                        onClick={() => copyToClipboard('RenaSer', 'HorizontalLogo')}
                        className="text-xs text-slate-400 hover:text-[#B76E79] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedText === 'HorizontalLogo' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedText === 'HorizontalLogo' ? dictionary.colors.copySuccess : 'Copy SVG'}</span>
                      </button>
                    </div>
                    <div className="h-36 bg-[#FAF8F5] dark:bg-[#2C221E]/30 rounded-2xl border border-rose-100/10 flex items-center justify-center p-6">
                      {renderLogo(logoRenderStyle, 'horizontal')}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      {dictionary.logoSuite.horizontalDesc}
                    </p>
                  </div>

                  {/* Stacked Logo Display */}
                  <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                    <div className="flex items-center justify-between border-b border-rose-100/10 pb-4">
                      <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-400">
                        {dictionary.logoSuite.stacked}
                      </h3>
                      <button 
                        onClick={() => copyToClipboard('RenaSer_Stacked', 'StackedLogo')}
                        className="text-xs text-slate-400 hover:text-[#B76E79] flex items-center gap-1 cursor-pointer"
                      >
                        {copiedText === 'StackedLogo' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedText === 'StackedLogo' ? dictionary.colors.copySuccess : 'Copy SVG'}</span>
                      </button>
                    </div>
                    <div className="h-44 bg-[#FAF8F5] dark:bg-[#2C221E]/30 rounded-2xl border border-rose-100/10 flex items-center justify-center p-6">
                      {renderLogo(logoRenderStyle, 'stacked')}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                      {dictionary.logoSuite.stackedDesc}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: App Icon */}
            {activeTab === 'icon' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-5 bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 sm:p-10 shadow-rosegold flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                        {dictionary.appIcon.title}
                      </h3>
                      <div className="h-px bg-rose-100/10" />
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-light font-sans">
                        {dictionary.appIcon.desc}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <span className="text-xs font-sans font-bold uppercase tracking-wider text-slate-400 block">
                        Select Finish:
                      </span>
                      <div className="flex gap-2">
                        {[
                          { key: 'rosegold', label: 'Rose Gold', color: 'bg-gradient-to-br from-[#B76E79] to-[#E8B4A0]' },
                          { key: 'gold', label: 'Gold Foil', color: 'bg-gradient-to-br from-[#BF953F] to-[#FCF6BA]' },
                          { key: 'dark', label: 'Dark Obsidian', color: 'bg-slate-900' },
                          { key: 'white', label: 'White Silk', color: 'bg-white border border-slate-200' }
                        ].map((btn) => (
                          <button
                            key={btn.key}
                            onClick={() => setIconPreviewStyle(btn.key as any)}
                            className={`px-3 py-1.5 rounded-xl text-[10px] font-sans font-semibold tracking-wider flex items-center gap-1.5 border cursor-pointer transition-all ${
                              iconPreviewStyle === btn.key
                                ? 'border-[#B76E79] bg-rose-50/10 shadow-xs'
                                : 'border-rose-100/10'
                            }`}
                          >
                            <span className={`h-2.5 w-2.5 rounded-full ${btn.color}`} />
                            {btn.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* App Icon Detailed Geometric Visualizer */}
                  <div className="lg:col-span-7 bg-slate-950 text-white rounded-[2rem] border border-white/5 p-8 flex items-center justify-center relative overflow-hidden shadow-rosegold min-h-[350px]">
                    {/* Concentric grid lines simulating high-end vector construction */}
                    <div className="absolute inset-0 pointer-events-none opacity-10 flex items-center justify-center">
                      <div className="absolute border border-rose-100 rounded-full h-80 w-80" />
                      <div className="absolute border border-rose-100 rounded-full h-64 w-64" />
                      <div className="absolute border border-rose-100 rounded-full h-48 w-48" />
                      <div className="absolute border border-rose-100 rounded-full h-32 w-32" />
                      <div className="absolute border border-rose-100 h-80 w-px" />
                      <div className="absolute border border-rose-100 w-80 h-px" />
                      <div className="absolute border border-rose-100 h-80 w-px rotate-45" />
                      <div className="absolute border border-rose-100 h-80 w-px -rotate-45" />
                    </div>

                    {/* App Icon Container */}
                    <div className="relative">
                      {/* Premium shadow backing */}
                      <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#B76E79]/20 to-[#D4AF37]/20 rounded-[2.5rem] blur-xl opacity-80" />
                      
                      <div className={`w-40 h-40 rounded-[2.5rem] flex items-center justify-center border border-white/10 transition-all duration-500 ${
                        iconPreviewStyle === 'dark' ? 'bg-[#120E0D]' :
                        iconPreviewStyle === 'white' ? 'bg-[#FAF8F5]' :
                        'bg-gradient-to-b from-[#2C221E] to-[#140E0C]'
                      }`}>
                        {renderGeometricIcon("w-28 h-28", 2.2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ecosystem Positioning Section */}
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-xl font-sans font-light tracking-tight text-slate-900 dark:text-white">
                      {dictionary.appIcon.mockupsTitle}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {dictionary.appIcon.mockupsDesc}
                    </p>
                  </div>

                  <div className="h-px bg-rose-100/10" />

                  {/* Simulated Apple iOS Home Screen */}
                  <div className="bg-slate-900 bg-radial-grid p-6 sm:p-8 rounded-2xl border border-rose-100/5 relative overflow-hidden flex flex-col justify-end min-h-[220px]">
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 px-4 py-1.5 rounded-full text-[10px] text-slate-300 font-sans backdrop-blur-md">
                      Simulated iOS Home Screen Dock
                    </div>
                    
                    <div className="grid grid-cols-5 sm:grid-cols-5 max-w-sm mx-auto w-full gap-4 relative z-10 pt-10">
                      {/* Brand 1: Calm */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl bg-[#2D4A8A] flex items-center justify-center text-white text-base font-bold shadow-md">
                          C
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans tracking-wide">Calm</span>
                      </div>

                      {/* Brand 2: Headspace */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center text-white text-base font-bold shadow-md">
                          H
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans tracking-wide">Headspace</span>
                      </div>

                      {/* RenaSer Icon */}
                      <div className="flex flex-col items-center gap-1.5 relative">
                        <div className="absolute -top-1 right-2 bg-emerald-500 h-2 w-2 rounded-full animate-pulse" />
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#2C221E] to-[#140E0C] flex items-center justify-center shadow-lg ring-1 ring-white/10">
                          {renderGeometricIcon("w-9 h-9", 2)}
                        </div>
                        <span className="text-[9px] text-white font-sans font-semibold tracking-wide">RenaSer</span>
                      </div>

                      {/* Brand 4: Spotify */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl bg-[#1DB954] flex items-center justify-center text-black text-lg font-bold shadow-md">
                          S
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans tracking-wide">Spotify</span>
                      </div>

                      {/* Brand 5: Apple Journal */}
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="w-12 h-12 rounded-xl bg-indigo-900 flex items-center justify-center text-white text-base font-bold shadow-md">
                          J
                        </div>
                        <span className="text-[9px] text-slate-400 font-sans tracking-wide">Journal</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Colors */}
            {activeTab === 'colors' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                  <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                    {dictionary.colors.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.colors.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { 
                      name: dictionary.colors.primaryColor, 
                      hex: '#B76E79', 
                      rgb: '183, 110, 121', 
                      cmyk: '24, 61, 41, 4', 
                      light: false, 
                      bg: 'bg-[#B76E79]', 
                      desc: 'Expresses elegant courage, refined heart, and emotional warmth.' 
                    },
                    { 
                      name: dictionary.colors.primaryHighlight, 
                      hex: '#E8B4A0', 
                      rgb: '232, 180, 160', 
                      cmyk: '6, 29, 31, 0', 
                      light: true, 
                      bg: 'bg-[#E8B4A0]', 
                      desc: 'A luminous tone evoking awakening, rising presence, and skin warmth.' 
                    },
                    { 
                      name: dictionary.colors.accentColor, 
                      hex: '#D4AF37', 
                      rgb: '212, 175, 55', 
                      cmyk: '19, 27, 85, 2', 
                      light: false, 
                      bg: 'bg-[#D4AF37]', 
                      desc: 'Premium golden highlights representing self-value, truth, and illumination.' 
                    },
                    { 
                      name: dictionary.colors.lightBg, 
                      hex: '#FAF8F5', 
                      rgb: '250, 248, 245', 
                      cmyk: '1, 1, 3, 0', 
                      light: true, 
                      bg: 'bg-[#FAF8F5] border border-rose-100/30', 
                      desc: 'The pure tactile ivory backdrop representing calm and clean space.' 
                    },
                    { 
                      name: dictionary.colors.darkBg, 
                      hex: '#1E1715', 
                      rgb: '30, 23, 21', 
                      cmyk: '65, 68, 67, 72', 
                      light: false, 
                      bg: 'bg-[#1E1715]', 
                      desc: 'Deep grounding background evoking security, silence, and luxury.' 
                    }
                  ].map((color, idx) => (
                    <div 
                      key={idx}
                      className="bg-white dark:bg-[#1E1715] rounded-3xl border border-rose-100/10 p-5 shadow-rosegold flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className={`h-24 w-full rounded-2xl ${color.bg} shadow-inner relative group overflow-hidden`}>
                          <button
                            onClick={() => copyToClipboard(color.hex, `hex_${idx}`)}
                            className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {copiedText === `hex_${idx}` ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            <span>{copiedText === `hex_${idx}` ? dictionary.colors.copySuccess : 'Copy Hex'}</span>
                          </button>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-xs font-sans font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
                            {color.name}
                          </h4>
                          <span className="text-xs font-mono font-bold text-[#B76E79]">
                            {color.hex}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-3 border-t border-rose-100/10 text-[10px] font-mono text-slate-500">
                        <div><span className="font-sans font-bold text-slate-400">RGB:</span> {color.rgb}</div>
                        <div><span className="font-sans font-bold text-slate-400">CMYK:</span> {color.cmyk}</div>
                        <p className="font-sans italic leading-relaxed pt-2 border-t border-rose-100/5 text-slate-400 dark:text-slate-500">
                          {color.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Simulated Foil finishes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Embossed Paper Card */}
                  <div className="bg-[#FAF8F5] dark:bg-[#1E1715]/40 border border-rose-100/10 p-8 rounded-[2rem] text-center space-y-6 relative overflow-hidden shadow-rosegold flex flex-col items-center justify-center h-56 select-none">
                    <div className="absolute inset-0 pointer-events-none shadow-inner opacity-45 bg-gradient-to-tr from-slate-500/5 via-transparent to-white/15" />
                    <div className="space-y-2 z-10">
                      <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-widest block">
                        Tactile Embossed Print
                      </span>
                      <h3 className="text-4xl font-sans tracking-[0.25em] font-light uppercase text-transparent bg-clip-text bg-gradient-to-br from-slate-300 to-slate-500 dark:from-slate-700 dark:to-slate-800" style={{ filter: "drop-shadow(1px 2px 2px rgba(0,0,0,0.15))" }}>
                        RenaSer
                      </h3>
                      <p className="text-[10px] font-sans text-slate-400 italic">
                        No ink. Embossed 3D texture into premium cotton paper.
                      </p>
                    </div>
                  </div>

                  {/* Gold Foil Hot Stamping Card */}
                  <div className="bg-[#1E1715] border border-white/5 p-8 rounded-[2rem] text-center space-y-6 relative overflow-hidden shadow-rosegold flex flex-col items-center justify-center h-56 select-none">
                    <div className="absolute top-0 right-0 h-44 w-44 bg-[#D4AF37]/10 blur-3xl rounded-full" />
                    <div className="space-y-2 z-10">
                      <span className="text-[10px] font-sans font-bold text-amber-500 uppercase tracking-widest block">
                        Gold Foil Stamp finish
                      </span>
                      <h3 className="text-4xl font-sans tracking-[0.25em] font-light uppercase metallic-gold animate-pulse">
                        RenaSer
                      </h3>
                      <p className="text-[10px] font-sans text-amber-500/60 italic">
                        Luxury metallic gold stamping foil reflecting direct ambient light.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Typography */}
            {activeTab === 'typography' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                  <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                    {dictionary.typography.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.typography.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Font pairing guidelines */}
                  <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-6">
                    <div className="flex items-center gap-2">
                      <Type className="h-5 w-5 text-[#B76E79]" />
                      <h4 className="text-lg font-sans font-semibold text-slate-800 dark:text-slate-100">
                        {dictionary.typography.fontPairing}
                      </h4>
                    </div>

                    <div className="h-px bg-rose-100/10" />

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#B76E79] block">
                          {dictionary.typography.headingFont}
                        </span>
                        <p className="text-3xl font-display italic text-slate-900 dark:text-white">
                          Playfair Display
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                          {dictionary.typography.headingDesc}
                        </p>
                      </div>

                      <div className="space-y-2 pt-4 border-t border-rose-100/5">
                        <span className="text-xs font-sans font-bold uppercase tracking-wider text-[#D4AF37] block">
                          {dictionary.typography.bodyFont}
                        </span>
                        <p className="text-xl font-sans tracking-wide font-light text-slate-900 dark:text-white">
                          Outfit Sans-Serif
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                          {dictionary.typography.bodyDesc}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Live Type playground */}
                  <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-6 flex flex-col justify-between">
                    <div className="space-y-4">
                      <h4 className="text-sm font-sans font-bold uppercase tracking-wider text-slate-400">
                        {dictionary.typography.tryText}
                      </h4>
                      <input
                        type="text"
                        value={customTyposText}
                        onChange={(e) => setCustomTyposText(e.target.value)}
                        className="w-full text-sm bg-rose-50/20 dark:bg-slate-900/40 border border-rose-100/20 rounded-xl p-3 placeholder-slate-400 focus:ring-1 focus:ring-[#B76E79] focus:border-[#B76E79] text-slate-800 dark:text-slate-200"
                        placeholder="Write something..."
                      />
                    </div>

                    <div className="py-6 border-t border-b border-rose-100/5 space-y-4">
                      {/* Live display demo */}
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-400 block">Playfair Display Italic (Title display):</span>
                        <p className="text-3xl font-display italic text-slate-900 dark:text-white line-clamp-1 leading-normal">
                          "{customTyposText}"
                        </p>
                      </div>

                      <div className="space-y-1 pt-4 border-t border-rose-100/5">
                        <span className="text-[9px] font-mono text-slate-400 block">Outfit Ultra-Tracking (Logo concept):</span>
                        <p className="text-2xl font-sans font-light uppercase tracking-[0.25em] text-[#B76E79] line-clamp-1 leading-normal">
                          {customTyposText.replace(/[sS]/, 'S')}
                        </p>
                      </div>
                    </div>

                    <div className="text-[11px] font-mono text-slate-400 leading-normal">
                      Recommendation: Use <span className="font-bold text-[#B76E79]">letter-spacing-widest</span> (tracking-widest) and <span className="font-bold text-[#B76E79]">font-light</span> on headers to evoke premium silence.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Geometry & Clear Space */}
            {activeTab === 'geometry' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                  <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                    {dictionary.geometry.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.geometry.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  {/* Schematic diagram */}
                  <div className="lg:col-span-7 bg-[#FAF8F5] dark:bg-[#2C221E]/30 rounded-[2rem] border border-rose-100/15 p-8 flex flex-col justify-center items-center shadow-rosegold relative overflow-hidden min-h-[380px]">
                    <span className="absolute top-4 left-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-sans font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {dictionary.geometry.clearSpaceTitle}
                    </span>

                    {/* Schematic grid representing padding based on 'S' */}
                    <div className="relative border border-[#B76E79]/35 p-16 rounded-xl flex flex-col items-center justify-center">
                      {/* Grid margin borders depicting 1X safe zone */}
                      <div className="absolute top-0 bottom-0 left-0 right-0 border border-dashed border-[#D4AF37]/25" />
                      
                      {/* Safe Area Labels */}
                      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#D4AF37] font-bold">SAFE ZONE 1X (S-height)</span>
                      <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-mono text-[#D4AF37] font-bold">SAFE ZONE 1X (S-height)</span>
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 rotate-90 text-[9px] font-mono text-[#D4AF37] font-bold">1X</span>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-mono text-[#D4AF37] font-bold">1X</span>

                      {/* Typographic Logo Centered */}
                      <h2 className="text-3xl sm:text-4xl font-sans tracking-[0.25em] uppercase font-light text-[#B76E79]">
                        Rena<strong className="font-extrabold text-[#D4AF37] text-[1.1em] inline-block -translate-y-[1px]">S</strong>er
                      </h2>
                    </div>
                  </div>

                  {/* Numeric rules */}
                  <div className="lg:col-span-5 bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 sm:p-10 shadow-rosegold flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-sans font-semibold text-slate-800 dark:text-slate-100">
                        {dictionary.geometry.minSizeTitle}
                      </h4>
                      <div className="h-px bg-rose-100/10" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
                        {dictionary.geometry.minSizeDesc}
                      </p>
                    </div>

                    <div className="space-y-4 pt-4">
                      {[
                        { icon: <Smartphone className="h-5 w-5 text-[#B76E79]" />, text: dictionary.geometry.digitalSize },
                        { icon: <Scissors className="h-5 w-5 text-[#D4AF37]" />, text: dictionary.geometry.printSize },
                        { icon: <Image className="h-5 w-5 text-[#E8B4A0]" />, text: dictionary.geometry.iconSize }
                      ].map((rule, idx) => (
                        <div key={idx} className="flex items-center gap-3.5 p-4 bg-rose-50/15 dark:bg-[#130E0D]/50 border border-rose-100/10 rounded-2xl">
                          <div className="p-2.5 rounded-xl bg-white dark:bg-[#1E1715] shadow-xs">
                            {rule.icon}
                          </div>
                          <span className="text-xs font-sans font-semibold text-slate-700 dark:text-slate-300 leading-tight">
                            {rule.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Rules (Do's & Don'ts) */}
            {activeTab === 'rules' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                  <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                    {dictionary.rules.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.rules.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* DO'S CARD */}
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-8 rounded-[2rem] shadow-rosegold space-y-6">
                    <div className="flex items-center gap-2.5 text-emerald-600">
                      <CheckCircle2 className="h-6 w-6" />
                      <h4 className="text-lg font-sans font-bold uppercase tracking-wider">
                        {dictionary.rules.dos}
                      </h4>
                    </div>

                    <div className="h-px bg-emerald-500/10" />

                    <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed list-none">
                      {[
                        lang === 'pt' ? "✓ Escrever RenaSer exatamente assim, com 'S' maiúsculo sutil." : "✓ Write RenaSer exactly as shown, with the capital 'S'.",
                        lang === 'pt' ? "✓ Utilizar o 'S' geométrico como ícone independente premium." : "✓ Use the geometric ribbon 'S' as the standalone iconic hallmark.",
                        lang === 'pt' ? "✓ Preservar pelo menos 1X (S-height) de margem limpa de respiro." : "✓ Keep at least 1X (S-height) of protective buffer around the logo.",
                        lang === 'pt' ? "✓ Harmonizar com cores da paleta oficial (Ouro Rosa, Marfim, Chocolate)." : "✓ Pair strictly with approved palette tones (Rose Gold, Ivory, Chocolate)."
                      ].map((rule, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="text-emerald-500 font-extrabold shrink-0">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* DONT'S CARD */}
                  <div className="bg-rose-500/5 border border-rose-500/20 p-8 rounded-[2rem] shadow-rosegold space-y-6">
                    <div className="flex items-center gap-2.5 text-rose-500">
                      <AlertCircle className="h-6 w-6" />
                      <h4 className="text-lg font-sans font-bold uppercase tracking-wider">
                        {dictionary.rules.donts}
                      </h4>
                    </div>

                    <div className="h-px bg-rose-500/10" />

                    <ul className="space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-sans leading-relaxed list-none">
                      {[
                        lang === 'pt' ? "✗ Nunca use lótus, mandalas ou símbolos de coaching genéricos." : "✗ Never use generic wellness icons (such as lotus flowers or wings).",
                        lang === 'pt' ? "✗ Não crie gradientes coloridos baratos ou sombras exageradas." : "✗ Avoid cheap neon gradients or excessive heavy drop shadows.",
                        lang === 'pt' ? "✗ Não altere o peso ou as proporções da tipografia do logotipo." : "✗ Do not distort or stretch the custom logo type alignment.",
                        lang === 'pt' ? "✗ Nunca mude o nome para tudo minúsculo (renaser) ou tudo maiúsculo (RENASER)." : "✗ Never write the name as all-lowercase (renaser) or all-caps (RENASER)."
                      ].map((rule, idx) => (
                        <li key={idx} className="flex gap-2.5 items-start">
                          <span className="text-rose-500 font-extrabold shrink-0">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: Mockups */}
            {activeTab === 'mockups' && (
              <div className="space-y-8">
                <div className="bg-white dark:bg-[#1E1715] rounded-[2rem] border border-rose-100/10 p-8 shadow-rosegold space-y-4">
                  <h3 className="text-2xl font-display font-light text-slate-900 dark:text-white">
                    {dictionary.mockups.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {dictionary.mockups.desc}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Mockup 1: Luxury Leather Journal / Notebook */}
                  <div className="bg-gradient-to-b from-[#1C1412] to-[#120E0D] border border-white/5 p-8 rounded-[2rem] h-80 flex flex-col justify-between relative overflow-hidden shadow-rosegold select-none group">
                    <div className="absolute inset-0 bg-radial-grid opacity-10 pointer-events-none" />
                    {/* Simulated leather texture overlay */}
                    <div className="absolute inset-0 bg-diagonal-grid opacity-10 pointer-events-none mix-blend-overlay" />
                    
                    <div className="text-slate-500 text-[10px] font-sans uppercase tracking-widest">
                      Ecosystem Mockup • Premium Journal
                    </div>

                    {/* Centered deeply embossed Gold foil logo */}
                    <div className="text-center space-y-1.5 transform transition-transform duration-500 group-hover:scale-105">
                      {renderGeometricIcon("w-14 h-14 mx-auto mb-2", 2)}
                      <h4 className="text-2xl font-sans tracking-[0.25em] font-light uppercase metallic-gold">
                        RenaSer
                      </h4>
                    </div>

                    <div className="text-slate-400 text-[10px] font-serif italic text-center">
                      Deeply debossed rose gold stamping on natural premium leather.
                    </div>
                  </div>

                  {/* Mockup 2: Watermark Video Screen */}
                  <div className="bg-slate-900 border border-rose-100/5 rounded-[2rem] h-80 flex flex-col justify-between p-6 relative overflow-hidden shadow-rosegold group">
                    {/* Simulated blurry gradient video backing */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#B76E79]/20 via-slate-950 to-[#D4AF37]/10 opacity-70 pointer-events-none" />
                    
                    <div className="flex justify-between items-center text-white/50 text-[10px] font-sans uppercase tracking-wider relative z-10">
                      <span>Video Production Watermark</span>
                      <span>4K Active</span>
                    </div>

                    {/* Minimalist Watermark Logo in the corner */}
                    <div className="flex items-center justify-between mt-auto pt-20 relative z-10 border-t border-white/5">
                      <div className="flex items-center gap-2 text-white opacity-85 hover:opacity-100 transition-opacity">
                        {renderGeometricIcon("h-5 w-5 text-white", 2.2)}
                        <span className="text-xs font-sans tracking-widest font-light uppercase">
                          Rena<strong className="font-bold">S</strong>er
                        </span>
                      </div>
                      <span className="text-[10px] text-white/40 font-serif italic">"remember who you are"</span>
                    </div>
                  </div>

                  {/* Mockup 3: Premium Business Card */}
                  <div className="bg-[#FAF8F5] border border-rose-100/30 rounded-[2rem] h-80 flex flex-col justify-between p-8 relative overflow-hidden shadow-rosegold group text-slate-800">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-[#E8B4A0]/10 blur-2xl rounded-full" />
                    
                    <div className="text-slate-400 text-[10px] font-sans uppercase tracking-widest">
                      Corporate Stationery • Business Card
                    </div>

                    <div className="space-y-1 transform transition-transform duration-500 group-hover:scale-[1.01]">
                      <h4 className="text-lg font-sans tracking-widest font-light uppercase text-[#B76E79]">
                        Rena<strong className="font-extrabold text-[#D4AF37] text-[1.12em] inline-block">S</strong>er
                      </h4>
                      <p className="text-[10px] text-slate-400 tracking-wider uppercase font-sans">
                        Founder & Mindset Guide
                      </p>
                    </div>

                    <div className="flex justify-between items-end text-[9px] font-mono text-slate-400 border-t border-rose-100/20 pt-4">
                      <span>renaser.app</span>
                      <span>hello@renaser.app</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
