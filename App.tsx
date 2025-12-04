import React, { useState, useEffect, useRef } from 'react';
import { Layout } from './components/Layout';
import { Button } from './components/Button';
import { User, ViewState, FileData, RouteParams } from './types';
import { MockDB } from './services/mockDb';
import { generateFileDescription, analyzeSupportTicket } from './services/geminiService';
import { 
  Upload, File as FileIcon, Link as LinkIcon, Download, 
  Clock, Trash2, CheckCircle, AlertCircle, Sparkles, Copy,
  Share2
} from 'lucide-react';

// --- Helper Components defined in same file for single XML block constraint if preferred, 
// but sticking to modular where reasonable. Since we have Layout/Button, let's put main views here 
// to orchestrate the logic easily.

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>(ViewState.HOME);
  const [routeParams, setRouteParams] = useState<RouteParams>({});
  
  // Hash Router Logic
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/download/')) {
        const fileId = hash.split('/')[2];
        setRouteParams({ fileId });
        setView(ViewState.DOWNLOAD);
      } else if (hash === '#/dashboard') {
        setView(ViewState.DASHBOARD);
      } else if (hash === '#/login') {
        setView(ViewState.LOGIN);
      } else if (hash === '#/register') {
        setView(ViewState.REGISTER);
      } else if (hash === '#/support') {
        setView(ViewState.SUPPORT);
      } else {
        setView(ViewState.HOME);
      }
    };

    // Init
    handleHashChange();
    // Check Auth
    const currentUser = MockDB.getCurrentUser();
    if (currentUser) setUser(currentUser);

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (newView: ViewState, params?: RouteParams) => {
    if (newView === ViewState.HOME) window.location.hash = '';
    if (newView === ViewState.LOGIN) window.location.hash = 'login';
    if (newView === ViewState.REGISTER) window.location.hash = 'register';
    if (newView === ViewState.DASHBOARD) window.location.hash = 'dashboard';
    if (newView === ViewState.SUPPORT) window.location.hash = 'support';
    if (newView === ViewState.DOWNLOAD && params?.fileId) window.location.hash = `download/${params.fileId}`;
    setView(newView);
  };

  const handleLogout = () => {
    MockDB.logout();
    setUser(null);
    navigate(ViewState.HOME);
  };

  return (
    <Layout user={user} currentView={view} onNavigate={navigate} onLogout={handleLogout}>
      {view === ViewState.HOME && <HomeView user={user} onNavigate={navigate} />}
      {view === ViewState.LOGIN && <AuthView type="login" onLogin={(u) => { setUser(u); navigate(ViewState.DASHBOARD); }} />}
      {view === ViewState.REGISTER && <AuthView type="register" onLogin={(u) => { setUser(u); navigate(ViewState.DASHBOARD); }} />}
      {view === ViewState.DASHBOARD && user && <DashboardView user={user} />}
      {view === ViewState.DOWNLOAD && routeParams.fileId && <DownloadView fileId={routeParams.fileId} />}
      {view === ViewState.SUPPORT && <SupportView />}
      
      {/* Protected Route Redirect */}
      {view === ViewState.DASHBOARD && !user && (
         <div className="flex flex-col items-center justify-center h-64">
           <p className="text-slate-600 mb-4">Você precisa estar logado para ver isso.</p>
           <Button onClick={() => navigate(ViewState.LOGIN)}>Fazer Login</Button>
         </div>
      )}
    </Layout>
  );
}

// --- VIEWS ---

function HomeView({ user, onNavigate }: { user: User | null, onNavigate: (v: ViewState) => void }) {
  return (
    <div className="relative overflow-hidden">
      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Compartilhe arquivos <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
              sem complicação
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-slate-600 mb-10">
            Envie arquivos de até 2GB, proteja com links seguros e gerencie tudo em um só lugar. 
            Simples, rápido e eficiente.
          </p>
          <div className="flex justify-center gap-4">
            {user ? (
              <Button onClick={() => onNavigate(ViewState.DASHBOARD)} className="px-8 py-4 text-lg">
                Ir para Meus Arquivos
              </Button>
            ) : (
              <Button onClick={() => onNavigate(ViewState.REGISTER)} className="px-8 py-4 text-lg">
                Começar Grátis
              </Button>
            )}
            <Button variant="secondary" onClick={() => onNavigate(ViewState.SUPPORT)} className="px-8 py-4 text-lg">
              Saiba Mais
            </Button>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Upload className="w-8 h-8 text-blue-600" />}
              title="Upload Rápido"
              description="Arraste e solte seus arquivos. Processamento otimizado para velocidade máxima."
            />
            <FeatureCard 
              icon={<LinkIcon className="w-8 h-8 text-blue-600" />}
              title="Links Seguros"
              description="Gere links únicos que expiram automaticamente para proteger sua privacidade."
            />
            <FeatureCard 
              icon={<Sparkles className="w-8 h-8 text-blue-600" />}
              title="IA Integrada"
              description="Nossa IA analisa e gera descrições automáticas para seus arquivos."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow">
      <div className="bg-white w-14 h-14 rounded-xl flex items-center justify-center shadow-sm mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}

function AuthView({ type, onLogin }: { type: 'login' | 'register', onLogin: (u: User) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // Not used in mock but good for UI
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let user;
      if (type === 'login') {
        user = await MockDB.login(email);
      } else {
        user = await MockDB.register(name, email);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-900 mb-6 text-center">
          {type === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}
        </h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {type === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input 
                type="text" 
                required 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
            <input 
              type="email" 
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
            <input 
              type="password" 
              required 
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full py-3" isLoading={loading}>
            {type === 'login' ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-500">
           {type === 'login' ? (
             <p>Ainda não tem conta? <a href="#/register" className="text-blue-600 hover:underline">Cadastre-se</a></p>
           ) : (
             <p>Já tem conta? <a href="#/login" className="text-blue-600 hover:underline">Faça login</a></p>
           )}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ user }: { user: User }) {
  const [files, setFiles] = useState<FileData[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = async () => {
    const userFiles = await MockDB.getUserFiles(user.id);
    setFiles(userFiles);
  };

  useEffect(() => { loadFiles(); }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    // Validation
    if (file.size > 2 * 1024 * 1024 * 1024) { // 2GB
      alert("Arquivo muito grande! Limite de 2GB.");
      return;
    }
    
    // For Mock: We can't store 2GB in local storage.
    // If > 5MB, we just store metadata. If < 5MB, we store base64 for demo download.
    const isSmall = file.size < 5 * 1024 * 1024;
    setUploading(true);

    let base64 = undefined;
    if (isSmall) {
      base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    }

    try {
      await MockDB.uploadFile(file, user, base64);
      await loadFiles();
    } catch (e) {
      console.error(e);
      alert("Erro no upload");
    } finally {
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este arquivo?')) {
      await MockDB.deleteFile(id);
      loadFiles();
    }
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}#/download/${id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado para a área de transferência!');
  };

  const handleAnalyzeAI = async (file: FileData) => {
     // Optimistic update
     const originalFiles = [...files];
     const updatedFiles = files.map(f => f.id === file.id ? { ...f, description: 'Gerando descrição com IA...' } : f);
     setFiles(updatedFiles);

     try {
       const desc = await generateFileDescription(file.name, file.type, file.base64Data);
       MockDB.updateFileDescription(file.id, desc);
       loadFiles();
     } catch(e) {
       setFiles(originalFiles);
       alert("Erro ao usar IA");
     }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Painel de Controle</h2>
      </div>

      {/* Upload Area */}
      <div 
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 mb-12 ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-slate-300 hover:border-blue-400 bg-white'}`}
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
      >
        <input 
          ref={fileInputRef}
          type="file" 
          className="hidden" 
          onChange={handleChange}
        />
        
        {uploading ? (
          <div className="flex flex-col items-center">
             <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
             <p className="text-lg font-medium text-slate-900">Enviando arquivo...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Arraste e solte seu arquivo aqui
            </h3>
            <p className="text-slate-500 mb-6">ou clique para selecionar do computador (Máx 2GB)</p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Selecionar Arquivo
            </Button>
          </div>
        )}
      </div>

      {/* File List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h3 className="font-semibold text-slate-700">Arquivos Recentes</h3>
        </div>
        
        {files.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Você ainda não enviou nenhum arquivo.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {files.map(file => (
              <li key={file.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                      <FileIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-medium text-slate-900">{file.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {(file.size / 1024 / 1024).toFixed(2)} MB • Expira em {new Date(file.expirationDate).toLocaleDateString()}
                      </p>
                      
                      {/* AI Description Section */}
                      <div className="mt-2">
                        {file.description ? (
                          <div className="text-sm text-slate-600 bg-slate-100 p-2 rounded-md inline-flex items-center">
                            <Sparkles className="w-3 h-3 text-purple-600 mr-2" />
                            {file.description}
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleAnalyzeAI(file)}
                            className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center mt-1"
                          >
                            <Sparkles className="w-3 h-3 mr-1" />
                            Gerar resumo com IA
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="hidden sm:flex flex-col text-right mr-4">
                      <span className="text-sm font-medium text-slate-900">{file.downloads}</span>
                      <span className="text-xs text-slate-500">Downloads</span>
                    </div>
                    
                    <button 
                      onClick={() => handleCopyLink(file.id)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Copiar Link"
                    >
                      <Share2 className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => handleDelete(file.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DownloadView({ fileId }: { fileId: string }) {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const data = await MockDB.getFile(fileId);
        if (!data) throw new Error("Arquivo não encontrado ou expirado.");
        setFile(data);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFile();
  }, [fileId]);

  const handleDownload = () => {
    if (file) {
      MockDB.incrementDownload(file.id);
      
      // If we have base64 (mock), create blob link
      if (file.base64Data) {
         const link = document.createElement("a");
         link.href = file.base64Data;
         link.download = file.name;
         document.body.appendChild(link);
         link.click();
         document.body.removeChild(link);
      } else {
         // Fake download for large mock files
         alert(`Simulando download de ${file.name}...`);
      }
      
      // Update local state to reflect download count increment immediately
      setFile({...file, downloads: file.downloads + 1});
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600 w-8 h-8"/></div>;
  if (error || !file) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="bg-red-100 p-4 rounded-full mb-4"><AlertCircle className="w-8 h-8 text-red-600" /></div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Link Inválido</h2>
      <p className="text-slate-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white max-w-lg w-full rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <div className="bg-blue-600 p-8 text-center text-white">
          <Download className="w-16 h-16 mx-auto mb-4 opacity-90" />
          <h2 className="text-2xl font-bold">Arquivo Pronto</h2>
          <p className="opacity-90 mt-1">Alguém compartilhou este arquivo com você</p>
        </div>
        
        <div className="p-8">
           <div className="flex items-center p-4 bg-slate-50 rounded-xl mb-8 border border-slate-100">
             <div className="bg-white p-3 rounded-lg shadow-sm mr-4 text-blue-600">
               <FileIcon className="w-8 h-8" />
             </div>
             <div>
               <h3 className="font-bold text-slate-900 text-lg truncate max-w-[200px]">{file.name}</h3>
               <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
             </div>
           </div>

           <div className="space-y-4">
             {file.description && (
               <div className="text-sm text-slate-600 bg-blue-50 p-4 rounded-lg flex items-start">
                  <Sparkles className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p>"{file.description}"</p>
               </div>
             )}

             <Button onClick={handleDownload} className="w-full py-4 text-lg shadow-lg shadow-blue-200">
               Baixar Agora
             </Button>
           </div>
           
           <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between text-xs text-slate-400">
             <span className="flex items-center"><Clock className="w-3 h-3 mr-1"/> Expira: {new Date(file.expirationDate).toLocaleDateString()}</span>
             <span>{file.downloads} Downloads</span>
           </div>
        </div>
      </div>
    </div>
  );
}

function SupportView() {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Use Gemini to process the ticket
    const aiReply = await analyzeSupportTicket(message);
    setResponse(aiReply);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-slate-900 mb-4">Central de Ajuda</h2>
      <p className="text-slate-600 mb-8">
        Está com problemas ou tem uma sugestão? Nossa equipe (e nossa IA) está aqui para ajudar.
      </p>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        {!response ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">Como podemos ajudar?</label>
              <textarea 
                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
                placeholder="Descreva seu problema ou feedback..."
                value={message}
                onChange={e => setMessage(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={!message.trim()} isLoading={loading}>
              Enviar Feedback
            </Button>
          </form>
        ) : (
          <div className="animate-fade-in">
            <div className="flex items-center text-green-600 mb-4 font-semibold">
              <CheckCircle className="w-5 h-5 mr-2" />
              Feedback Recebido!
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
              <p className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" /> Resposta Automática
              </p>
              <p className="text-slate-700 italic">"{response}"</p>
            </div>
            <Button variant="secondary" onClick={() => { setResponse(''); setMessage(''); }} className="mt-6">
              Enviar Outro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Icon helper to avoid huge import list above
function Loader2({ className }: { className?: string }) {
  // Lucide loader logic is actually just an SVG, but sticking to props
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
