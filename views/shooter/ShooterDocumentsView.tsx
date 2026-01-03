
import React from 'react';
import { FileText, Upload, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const ShooterDocumentsView: React.FC = () => {
  const docs = [
    { title: 'Certificado de Registro (CR)', expiry: '15/05/2026', status: 'verified' },
    { title: 'Filiação Clube Elite Shield', expiry: '12/10/2025', status: 'verified' },
    { title: 'Laudo Psicológico', expiry: '02/01/2025', status: 'pending' },
    { title: 'Comprovante de Endereço', expiry: 'N/A', status: 'expired' },
  ];

  return (
    <div className="space-y-10 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Central de <span className="text-red-600">Documentos</span></h1>
          <p className="text-gray-500 text-sm">Mantenha sua documentação legal atualizada para evitar bloqueios.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center space-x-2 transition-all">
          <Upload className="w-4 h-4" />
          <span>Enviar Novo Arquivo</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Status por Documento</h3>
          {docs.map((doc, idx) => (
            <div key={idx} className="glass p-6 rounded-3xl border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${
                  doc.status === 'verified' ? 'bg-green-500/10 text-green-500' :
                  doc.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-white">{doc.title}</span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Val: {doc.expiry}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {doc.status === 'verified' && <CheckCircle className="w-4 h-4 text-green-500" />}
                {doc.status === 'pending' && <Clock className="w-4 h-4 text-yellow-500" />}
                {doc.status === 'expired' && <AlertCircle className="w-4 h-4 text-red-500" />}
              </div>
            </div>
          ))}
        </div>

        <div className="glass p-10 rounded-[40px] border-white/5 space-y-8 bg-gradient-to-br from-white/5 to-transparent">
          <h3 className="text-xl font-black uppercase tracking-tighter">Solicitações de Despachante</h3>
          <p className="text-gray-400 text-sm">Facilitamos a emissão de laudos e renovações diretamente pelo portal.</p>
          
          <div className="space-y-3">
            {[
              { title: 'Renovação de CR', price: 'R$ 350,00' },
              { title: 'Guia de Tráfego Especial', price: 'R$ 150,00' },
              { title: 'Laudo de Tiro p/ Porte', price: 'R$ 200,00' },
            ].map((req, idx) => (
              <button key={idx} className="w-full flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-2xl hover:border-red-600 hover:bg-red-600/5 transition-all text-left">
                <span className="text-xs font-black uppercase tracking-widest">{req.title}</span>
                <span className="text-xs font-bold text-red-500">{req.price}</span>
              </button>
            ))}
          </div>
          
          <div className="p-4 bg-blue-600/10 border border-blue-600/20 rounded-2xl">
             <p className="text-[10px] text-blue-400 font-medium leading-relaxed">
               Associados <strong>OPERADOR</strong> e <strong>ELITE</strong> possuem isenção de honorários em solicitações básicas.
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShooterDocumentsView;
