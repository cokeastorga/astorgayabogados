import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { getLegalNews } from '../services/geminiService';
import { NewsResult } from '../types';

const NewsFeed: React.FC = () => {
  const [news, setNews] = useState<NewsResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    const data = await getLegalNews();
    setNews(data);
    setLoading(false);
  };

  return (
    <section id="news" className="py-16 bg-slate-100 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="bg-navy-900 p-3 rounded-full mr-4">
              <Newspaper className="h-6 w-6 text-gold-500" />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold text-navy-900 leading-none">
                Actualidad Jurídica
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Conexión en tiempo real: Poder Judicial & Diario Oficial
              </p>
            </div>
          </div>
          
          <button 
            onClick={fetchNews} 
            disabled={loading}
            className="flex items-center text-sm font-medium text-gold-600 hover:text-navy-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Noticias
          </button>
        </div>

        <div className="bg-white rounded-sm shadow-md p-6 border-l-4 border-gold-500">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-gold-500 animate-spin mb-4" />
              <p className="text-gray-500">Obteniendo titulares oficiales...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* News Content */}
              <div className="lg:col-span-2">
                <h4 className="font-bold text-navy-900 mb-4 uppercase text-xs tracking-wider">Titulares Recientes</h4>
                <div className="prose prose-slate max-w-none">
                  <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                    {news?.text}
                  </div>
                </div>
              </div>

              {/* Sources / Links */}
              <div className="bg-slate-50 p-6 rounded-sm border border-slate-100">
                <h4 className="font-bold text-navy-900 mb-4 uppercase text-xs tracking-wider">Fuentes Oficiales</h4>
                {news?.sources && news.sources.length > 0 ? (
                  <ul className="space-y-3">
                    {news.sources.map((source, idx) => (
                      <li key={idx}>
                        <a 
                          href={source.uri} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="group flex items-start text-sm text-gray-600 hover:text-gold-600 transition-colors"
                        >
                          <ExternalLink className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0 opacity-50 group-hover:opacity-100" />
                          <span className="line-clamp-2">{source.title}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400 italic">No se encontraron enlaces directos.</p>
                )}
                <div className="mt-6 pt-6 border-t border-slate-200">
                   <p className="text-xs text-gray-400 text-center">
                     Información generada mediante IA basada en resultados públicos de la web.
                   </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsFeed;
