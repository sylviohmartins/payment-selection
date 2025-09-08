# Sistema de Gestão de Transações Financeiras - Frontend com Modo Escuro

Uma interface web moderna e responsiva com suporte completo a **modo escuro/claro** para demonstrar e explorar funcionalmente a API de seleção de pagamentos backend desenvolvida em Java Spring Boot.

## 🌙 **Modo Escuro - Funcionalidades**

### ✨ **Características Principais**
- **Alternância Instantânea** - Botão no header para trocar entre temas
- **Persistência Local** - Preferência salva automaticamente no localStorage
- **Transições Suaves** - Animações de 0.3s entre mudanças de tema
- **Contraste Otimizado** - Cores cuidadosamente selecionadas para máxima legibilidade
- **Acessibilidade** - Suporte a preferências de movimento reduzido

### 🎨 **Paleta de Cores**

#### **Modo Claro (Padrão):**
```css
--bg-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--bg-secondary: rgba(255, 255, 255, 0.95);
--bg-card: rgba(255, 255, 255, 0.9);
--text-primary: #2d3748;
--text-secondary: #4a5568;
--accent-primary: #667eea;
```

#### **Modo Escuro:**
```css
--bg-primary: linear-gradient(135deg, #1a202c 0%, #2d3748 100%);
--bg-secondary: rgba(26, 32, 44, 0.95);
--bg-card: rgba(45, 55, 72, 0.9);
--text-primary: #f7fafc;
--text-secondary: #e2e8f0;
--accent-primary: #90cdf4;
```

### 🔧 **Implementação Técnica**

#### **Variáveis CSS:**
- Uso de CSS Custom Properties para mudanças dinâmicas
- Fallbacks para navegadores mais antigos
- Transições suaves em todos os elementos

#### **JavaScript:**
```javascript
const themeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeToggle(theme);
    }
};
```

#### **HTML:**
```html
<button id="theme-toggle" class="theme-toggle">
    <i class="fas fa-moon"></i>
    <span>Modo Escuro</span>
</button>
```

### 🎯 **Experiência do Usuário**

#### **Detecção Automática:**
- Carrega a preferência salva do usuário
- Padrão para modo claro se não houver preferência
- Mantém o estado entre sessões

#### **Feedback Visual:**
- **Modo Claro:** Ícone de lua + texto "Modo Escuro"
- **Modo Escuro:** Ícone de sol + texto "Modo Claro"
- Hover effects com elevação e mudança de cor

#### **Transições:**
- Todas as propriedades de cor com transição de 0.3s
- Efeitos suaves em backgrounds, bordas e textos
- Animações respeitam preferências de movimento reduzido

### 📱 **Responsividade no Modo Escuro**

#### **Desktop (> 768px):**
- Botão de tema no header ao lado do status de conexão
- Hover effects completos
- Transições suaves

#### **Mobile (≤ 768px):**
- Header reorganizado em coluna
- Botão de tema mantém funcionalidade
- Touch-friendly com área de toque adequada

### 🔍 **Detalhes de Implementação**

#### **Componentes Afetados:**
- ✅ **Header** - Fundo, texto e botões
- ✅ **Cards** - Filtros, tabela, informações
- ✅ **Tabela** - Cabeçalho, linhas, seleções
- ✅ **Botões** - Todos os estados (normal, hover, disabled)
- ✅ **Modais** - Fundo, conteúdo, overlay
- ✅ **Toasts** - Notificações de sucesso/erro
- ✅ **Formulários** - Inputs, selects, labels

#### **Estados Especiais:**
- **Seleção de linhas** - Destaque azul mantido em ambos os temas
- **Status badges** - Cores ajustadas para contraste adequado
- **Loading states** - Spinners e barras de progresso adaptados

### 🧪 **Testes Realizados**

#### **Funcionalidades Testadas:**
1. ✅ **Alternância de tema** - Clique no botão funciona perfeitamente
2. ✅ **Persistência** - Recarregar página mantém tema escolhido
3. ✅ **Seleção de itens** - Funciona em ambos os temas
4. ✅ **Responsividade** - Layout adapta corretamente
5. ✅ **Acessibilidade** - Navegação por teclado mantida
6. ✅ **Performance** - Transições suaves sem lag

#### **Cenários Validados:**
- Mudança de tema com itens selecionados
- Filtros aplicados em modo escuro
- Modal de processamento em ambos os temas
- Notificações toast em diferentes contextos

### 🎨 **Design System Atualizado**

#### **Novos Componentes:**
- **Theme Toggle Button** - Botão de alternância estilizado
- **Dark Theme Variables** - Conjunto completo de variáveis CSS
- **Transition System** - Sistema de transições unificado

#### **Melhorias de Acessibilidade:**
- Contraste WCAG 2.1 AA em ambos os temas
- Focus indicators visíveis em modo escuro
- Suporte a `prefers-reduced-motion`
- ARIA labels para o botão de tema

### 🚀 **Como Usar o Modo Escuro**

#### **Para Usuários:**
1. Clique no botão "Modo Escuro" no header
2. A interface muda instantaneamente
3. Sua preferência é salva automaticamente
4. Clique em "Modo Claro" para voltar

#### **Para Desenvolvedores:**
1. Todas as cores usam variáveis CSS
2. Adicione `data-theme="dark"` para forçar modo escuro
3. Customize as variáveis em `:root` e `[data-theme="dark"]`
4. Use `themeManager.setTheme('dark')` via JavaScript

### 📊 **Benefícios do Modo Escuro**

#### **Para Usuários:**
- **Redução de fadiga ocular** em ambientes com pouca luz
- **Economia de bateria** em dispositivos OLED
- **Preferência pessoal** e conforto visual
- **Uso noturno** mais confortável

#### **Para Desenvolvedores:**
- **Código modular** com variáveis CSS
- **Fácil manutenção** de cores
- **Extensibilidade** para novos temas
- **Performance otimizada** com transições CSS

### 🔧 **Personalização Avançada**

#### **Adicionando Novos Temas:**
```css
[data-theme="custom"] {
    --bg-primary: your-gradient;
    --text-primary: your-color;
    /* ... outras variáveis */
}
```

#### **Modificando Transições:**
```css
* {
    transition: background-color 0.5s ease, color 0.5s ease;
}
```

#### **Desabilitando Animações:**
```css
@media (prefers-reduced-motion: reduce) {
    * {
        transition-duration: 0.01ms !important;
    }
}
```

### 📋 **Arquivos Modificados**

```
payment-selection-frontend/
├── index.html              # Adicionado botão de tema
├── styles-dark.css         # Novo arquivo com suporte a modo escuro
├── script.js              # Adicionado themeManager
├── api.js                 # Inalterado
└── README-DARK-MODE.md    # Esta documentação
```

### 🎯 **Próximos Passos**

#### **Melhorias Futuras:**
- [ ] Detecção automática de preferência do sistema
- [ ] Mais opções de tema (azul, verde, roxo)
- [ ] Modo de alto contraste
- [ ] Sincronização entre abas

#### **Otimizações:**
- [ ] Lazy loading de temas
- [ ] Compressão de CSS
- [ ] Service Worker para cache de temas

---

**🌙 Modo Escuro implementado com sucesso! Desfrute da nova experiência visual.**

