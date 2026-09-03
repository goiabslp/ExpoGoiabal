import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../../components/Header';
import { TrucoBackButton } from '../../../components/Truco/TrucoBackButton';
import { cadastrarEquipe } from '../../../services/trucoService';
import { SelectCidadeMG } from '../../../components/Truco/SelectCidadeMG';
import { CIDADE_PADRAO_MG } from '../../../data/cidadesMG';
import { 
  Users, 
  Upload, 
  UserPlus, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  AlertCircle,
  AlertTriangle,
  Trophy,
  ShieldAlert,
  IdCard,
  Calendar,
  Clock
} from 'lucide-react';

interface JogadorForm {
  id: string;
  nome_completo: string;
  cpf: string;
  data_nascimento: string;
}

export const TrucoCadastroPage: React.FC = () => {
  const navigate = useNavigate();

  const [nomeEquipe, setNomeEquipe] = useState('');
  const [cidadeEquipe, setCidadeEquipe] = useState(CIDADE_PADRAO_MG);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  const [jogadores, setJogadores] = useState<JogadorForm[]>([
    { id: '1', nome_completo: '', cpf: '', data_nascimento: '' },
    { id: '2', nome_completo: '', cpf: '', data_nascimento: '' },
    { id: '3', nome_completo: '', cpf: '', data_nascimento: '' },
    { id: '4', nome_completo: '', cpf: '', data_nascimento: '' },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showSemCpfModal, setShowSemCpfModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [equipeCriadaNome, setEquipeCriadaNome] = useState('');

  // Formatação de CPF
  const formatCPF = (val: string) => {
    const numbers = val.replace(/\D/g, '').slice(0, 11);
    let res = numbers;
    if (numbers.length > 3) res = numbers.slice(0, 3) + '.' + numbers.slice(3);
    if (numbers.length > 6) res = res.slice(0, 7) + '.' + numbers.slice(6);
    if (numbers.length > 9) res = res.slice(0, 11) + '-' + numbers.slice(9);
    return res;
  };

  const handleJogadorChange = (index: number, field: keyof JogadorForm, value: string) => {
    setJogadores(prev => {
      const copy = [...prev];
      if (field === 'cpf') {
        copy[index] = { ...copy[index], cpf: formatCPF(value) };
      } else {
        copy[index] = { ...copy[index], [field]: value };
      }
      return copy;
    });
  };

  const adicionarJogador = () => {
    setJogadores(prev => [
      ...prev,
      { id: String(Date.now()), nome_completo: '', cpf: '', data_nascimento: '' }
    ]);
  };

  const removerJogador = (index: number) => {
    if (jogadores.length <= 4) {
      setErrorMsg('A equipe precisa ter no mínimo 4 jogadores titulares.');
      return;
    }
    setJogadores(prev => prev.filter((_, i) => i !== index));
  };

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validarCamposBase = () => {
    setErrorMsg(null);

    if (!nomeEquipe.trim()) {
      setErrorMsg('Informe o nome da equipe.');
      return false;
    }

    if (!cidadeEquipe.trim()) {
      setErrorMsg('Informe a cidade da equipe.');
      return false;
    }

    // Validar jogadores
    for (let i = 0; i < jogadores.length; i++) {
      const j = jogadores[i];
      if (!j.nome_completo.trim()) {
        setErrorMsg(`Preencha o nome do Jogador ${i + 1}.`);
        return false;
      }
      if (!j.data_nascimento.trim()) {
        setErrorMsg(`Informe a data de nascimento do Jogador ${i + 1}.`);
        return false;
      }
      // CPF é opcional, mas se informado deve conter 11 dígitos
      if (j.cpf.trim() && j.cpf.replace(/\D/g, '').length !== 11) {
        setErrorMsg(`O CPF informado para o Jogador ${i + 1} (${j.nome_completo || 'Jogador'}) está incompleto. Digite os 11 dígitos ou deixe em branco para continuar sem CPF.`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarCamposBase()) return;

    // Checar se algum jogador está sem CPF informado
    const temJogadorSemCpf = jogadores.some(j => !j.cpf.trim() || j.cpf.replace(/\D/g, '').length !== 11);

    if (temJogadorSemCpf) {
      // Exibir modal de aviso sobre a renúncia ao bônus de premiação
      setShowSemCpfModal(true);
    } else {
      // Todos com CPF informado -> cadastro regularizado e elegível ao bônus
      executarEnvioCadastro(true);
    }
  };

  const executarEnvioCadastro = async (regularizado: boolean) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      await cadastrarEquipe(
        { 
          nome: nomeEquipe, 
          cidade: cidadeEquipe,
          cadastro_regularizado: regularizado
        },
        jogadores.map(j => ({
          nome_completo: j.nome_completo,
          cpf: j.cpf,
          data_nascimento: j.data_nascimento
        })),
        fotoFile
      );

      setEquipeCriadaNome(nomeEquipe);
      setShowSemCpfModal(false);
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error('Erro no cadastro:', err);
      setErrorMsg(err.message || 'Ocorreu um erro ao cadastrar a equipe. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white selection:bg-emerald-500 selection:text-black">
      <Header />

      {/* Decorative Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center opacity-80 pointer-events-none"
        style={{ backgroundImage: 'url(/truco.png)' }}
      />
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/55 via-black/40 to-zinc-950/90 pointer-events-none" />
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.12),transparent)] pointer-events-none" />

      <main className="relative z-10 flex-1 flex flex-col items-center pt-28 pb-20 px-4">
        <div className="w-full max-w-4xl mx-auto flex flex-col items-center">

          <TrucoBackButton to="/ExpoGoiabal/Truco" label="Voltar para o Torneio" />

          {/* Form Header */}
          <div className="text-center max-w-2xl mx-auto mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-widest mb-3">
              <Sparkles size={14} className="text-amber-400" />
              <span>Inscrição de Equipes</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white mb-2">
              📝 Cadastro de Equipe
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">
              Preencha as informações do time e adicione os integrantes para participar do 2º Torneio de Truco.
            </p>
          </div>

          {/* Form Card */}
          <form 
            onSubmit={handleSubmit}
            className="w-full bg-zinc-900/80 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-emerald-950/20 animate-in fade-in slide-in-from-bottom-6 duration-700"
          >
            {/* Erro Banner */}
            {errorMsg && (
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-sm font-semibold animate-in shake duration-300">
                <AlertCircle size={20} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Banner Informativo da Taxa de Inscrição */}
            <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center gap-3.5 text-xs text-amber-200">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-lg font-black shrink-0">
                💵
              </div>
              <div className="flex-1">
                <strong className="text-white block mb-0.5 uppercase tracking-wide text-xs">
                  Taxa de Inscrição: R$ 160,00 por Equipe
                </strong>
                <span className="text-zinc-300 leading-relaxed block">
                  A taxa de inscrição de <strong>R$ 160,00</strong> deve ser acertada diretamente com o organizador <strong className="text-amber-300">Ricardo Moraes</strong>. <strong>100% dos valores das inscrições + patrocínios arrecadados</strong> serão convertidos integralmente em premiação para os <strong>04 primeiros colocados (1º, 2º, 3º e 4º lugares)</strong>!
                </span>
              </div>
            </div>

            {/* SEÇÃO 1: INFORMAÇÕES DA EQUIPE */}
            <div className="mb-10">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-6">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-sm">
                  1
                </div>
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                  Informações da Equipe
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nome do Time */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <Users size={14} className="text-emerald-400" />
                    Nome do Time *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Os Reis do Blefe, Truco de Ouro..."
                    value={nomeEquipe}
                    onChange={e => setNomeEquipe(e.target.value)}
                    className="w-full bg-zinc-950/70 border border-zinc-700/80 focus:border-emerald-500 rounded-xl px-4 py-3.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium text-sm"
                  />
                </div>

                {/* Cidade do Time (Select das Cidades de MG) */}
                <SelectCidadeMG
                  id="cidade-equipe"
                  label="Cidade do Time"
                  value={cidadeEquipe}
                  onChange={setCidadeEquipe}
                  required
                />
              </div>

              {/* Foto do Time */}
              <div className="mt-6 flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                  <Upload size={14} className="text-emerald-400" />
                  Foto ou Escudo do Time (Opcional)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-zinc-950/50 border border-dashed border-zinc-700 hover:border-emerald-500/50 transition-colors">
                  {fotoPreview ? (
                    <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-emerald-500 shadow-md shrink-0">
                      <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setFotoFile(null); setFotoPreview(null); }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-xs text-red-400 font-bold"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-500 shrink-0">
                      <Users size={32} />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left">
                    <label className="cursor-pointer inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 hover:border-emerald-500/40">
                      <Upload size={14} className="text-emerald-400" />
                      <span>{fotoFile ? 'Trocar Imagem' : 'Selecionar Imagem'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFotoChange}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-zinc-500 mt-1.5">
                      PNG, JPG ou WEBP (Recomendado proporção quadrada)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: JOGADORES DA EQUIPE */}
            <div className="mb-10">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-white">
                      Jogadores da Equipe
                    </h2>
                    <p className="text-xs text-zinc-400 font-medium">Cadastre os 4 jogadores titulares e reservas opcionais</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={adicionarJogador}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black uppercase tracking-wider transition-all"
                >
                  <UserPlus size={14} />
                  <span>+ Adicionar Reserva</span>
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {jogadores.map((jogador, index) => {
                  const isTitular = index < 4;
                  const labelJogador = index === 0 
                    ? '(Capitão / Titular 1)' 
                    : index === 1 
                    ? '(Titular 2)' 
                    : index === 2 
                    ? '(Titular 3)' 
                    : index === 3 
                    ? '(Titular 4)' 
                    : `(Reserva ${index - 3})`;

                  return (
                    <div 
                      key={jogador.id}
                      className={`p-5 rounded-2xl bg-zinc-950/60 border transition-all flex flex-col gap-4 relative group ${
                        isTitular ? 'border-white/10 hover:border-emerald-500/30' : 'border-amber-500/20 bg-amber-500/[0.02] hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                          isTitular ? 'text-emerald-400' : 'text-amber-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${isTitular ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                          Jogador #{index + 1} {labelJogador}
                        </span>

                        {jogadores.length > 4 && index >= 4 && (
                          <button
                            type="button"
                            onClick={() => removerJogador(index)}
                            className="text-zinc-500 hover:text-red-400 transition-colors p-1 flex items-center gap-1 text-xs"
                            title="Remover jogador reserva"
                          >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Remover Reserva</span>
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Nome Completo */}
                        <div className="flex flex-col gap-1.5 md:col-span-1">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            <IdCard size={12} className={isTitular ? "text-emerald-400" : "text-amber-400"} />
                            Nome Completo *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="Nome e Sobrenome"
                            value={jogador.nome_completo}
                            onChange={e => handleJogadorChange(index, 'nome_completo', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-sm font-medium"
                          />
                        </div>

                        {/* CPF (Opcional) */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                              <ShieldAlert size={12} className={isTitular ? "text-emerald-400" : "text-amber-400"} />
                              CPF (Opcional)
                            </label>
                            <span className="text-[9px] text-amber-400 font-semibold uppercase tracking-wider">
                              Bônus 🏆
                            </span>
                          </div>
                          <input
                            type="text"
                            maxLength={14}
                            placeholder="000.000.000-00 (Opcional)"
                            value={jogador.cpf}
                            onChange={e => handleJogadorChange(index, 'cpf', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-sm font-medium"
                          />
                        </div>

                        {/* Data de Nascimento */}
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            <Calendar size={12} className={isTitular ? "text-emerald-400" : "text-amber-400"} />
                            Data de Nascimento *
                          </label>
                          <input
                            type="date"
                            required
                            value={jogador.data_nascimento}
                            onChange={e => handleJogadorChange(index, 'data_nascimento', e.target.value)}
                            className="w-full bg-zinc-900 border border-zinc-700/80 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-white placeholder-zinc-500 focus:outline-none text-sm font-medium [color-scheme:dark]"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs text-zinc-500 font-semibold">
                * Equipe com 4 titulares obrigatórios + reservas opcionais. CPF opcional (necessário p/ bônus de premiação).
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-black font-black text-sm uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:shadow-[0_0_35px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Salvando Equipe...</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar Inscrição</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </main>

      {/* MODAL DE CONFIRMAÇÃO: CADASTRO SEM CPF */}
      {showSemCpfModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border-2 border-amber-500/50 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-center animate-in zoom-in-95 duration-300">
            
            {/* Ícone de Alerta */}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/40 shadow-inner">
              <AlertTriangle size={36} className="animate-pulse" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
              <span>⚠️ Cadastro sem CPF</span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-4">
              Aviso de Premiação
            </h3>

            <div className="bg-zinc-950/70 border border-white/10 rounded-2xl p-4 text-left text-zinc-300 text-sm flex flex-col gap-3 mb-6">
              <p className="leading-relaxed">
                O cadastro do seu time será finalizado normalmente mesmo sem informar o CPF.
              </p>

              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-medium leading-relaxed">
                💰 <strong>Pote de Inscrições + Patrocínios Garantido:</strong> Seu time concorre normalmente à premiação em dinheiro do pote se terminar entre os <strong>04 primeiros colocados (1º ao 4º lugar)</strong>, independente do CPF!
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-medium leading-relaxed">
                ⚠️ <strong>Bônus da Prefeitura:</strong> Ao prosseguir sem CPF, o time abre mão apenas do <strong>Bônus Especial de R$ 2.500,00 da Prefeitura</strong>, que é destinado exclusivamente aos 05 melhores colocados com cadastro 100% regularizado.
              </div>

              <p className="text-zinc-400 text-xs font-semibold text-center pt-2 border-t border-white/10">
                Deseja continuar e finalizar a inscrição sem CPF?
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setShowSemCpfModal(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-wider transition-all border border-white/10 hover:border-white/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Voltar e informar CPF</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => executarEnvioCadastro(false)}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <span>Continuar sem CPF</span>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE SUCESSO */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-emerald-500/40 rounded-3xl w-full max-w-md p-8 shadow-[0_0_50px_rgba(16,185,129,0.3)] relative text-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
              <Clock size={36} />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-[10px] font-black uppercase tracking-widest mb-3">
              🟡 Status: Pendente de Aprovação
            </span>

            <h3 className="text-2xl font-black text-white uppercase tracking-wider mb-2">
              Inscrição Enviada!
            </h3>

            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
              A equipe <strong className="text-amber-400 font-bold">{equipeCriadaNome}</strong> foi cadastrada com sucesso e está <strong className="text-amber-400 font-bold">aguardando análise e aprovação</strong> dos organizadores no painel administrativo.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.scrollTo(0, 0);
                  navigate('/ExpoGoiabal/Truco');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
              >
                <Trophy size={16} />
                <span>Voltar para o Torneio</span>
              </button>

              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setNomeEquipe('');
                  setCidadeEquipe('');
                  setFotoFile(null);
                  setFotoPreview(null);
                  setJogadores([
                    { id: '1', nome_completo: '', cpf: '', data_nascimento: '' },
                    { id: '2', nome_completo: '', cpf: '', data_nascimento: '' },
                    { id: '3', nome_completo: '', cpf: '', data_nascimento: '' },
                    { id: '4', nome_completo: '', cpf: '', data_nascimento: '' },
                  ]);
                }}
                className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs uppercase tracking-widest transition-all"
              >
                Cadastrar Outra Equipe
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
