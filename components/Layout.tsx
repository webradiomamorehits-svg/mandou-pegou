import React from 'react';
import { ViewState, User } from '../types';
import { UploadCloud, LogOut, User as UserIcon, HelpCircle } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, currentView, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div 
              className="flex items-center cursor-pointer group"
              onClick={() => onNavigate(ViewState.HOME)}
            >
              <div className="bg-blue-600 p-2 rounded-lg group-hover:bg-blue-700 transition-colors">
                <UploadCloud className="h-6 w-6 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-slate-900 tracking-tight">
                Mandei <span className="text-blue-600">Pegou</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <nav className="flex items-center space-x-4">
               <button 
                  onClick={() => onNavigate(ViewState.SUPPORT)}
                  className={`text-sm font-medium px-3 py-2 rounded-md transition-colors flex items-center ${currentView === ViewState.SUPPORT ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  <HelpCircle className="w-4 h-4 mr-1.5" />
                  Ajuda
                </button>

              {user ? (
                <>
                  <button 
                    onClick={() => onNavigate(ViewState.DASHBOARD)}
                    className={`text-sm font-medium px-3 py-2 rounded-md transition-colors flex items-center ${currentView === ViewState.DASHBOARD ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <UserIcon className="w-4 h-4 mr-1.5" />
                    Meus Arquivos
                  </button>
                  <div className="h-6 w-px bg-slate-200 mx-2"></div>
                  <div className="text-sm text-slate-500 mr-2 hidden sm:block">
                    Olá, {user.name.split(' ')[0]}
                  </div>
                  <button 
                    onClick={onLogout}
                    className="text-sm font-medium text-red-600 hover:text-red-700 px-3 py-2 rounded-md hover:bg-red-50 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => onNavigate(ViewState.LOGIN)}
                    className="text-slate-600 hover:text-slate-900 font-medium px-4 py-2"
                  >
                    Entrar
                  </button>
                  <button 
                    onClick={() => onNavigate(ViewState.REGISTER)}
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium shadow-sm transition-all hover:shadow-md"
                  >
                    Criar Conta
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 text-center">
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} Mandei Pegou. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};