import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/Header';
import { User, Calendar, MapPin, Phone, ArrowRight, ArrowLeft, CheckCircle, RefreshCcw, Star, Ticket, AlertTriangle } from 'lucide-react';
import { supabase } from '../../services/supabase';

export const TresTamboresInscricaoPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    nome: '',
    idade: '',
    responsavel: '',
    cidade: '',
    nomeCavalo: '',
    whatsapp: '',
    termoAceito: false
  });
  const [isTermosOpen, setIsTermosOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState<{ isOpen: boolean; message: string }>({ isOpen: false, message: '' });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [registrationId, setRegistrationId] = useState('');

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<any | null>(null);
  const [searchError, setSearchError] = useState('');

  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedState, setSelectedState] = useState('MG');
  const [loadingCities, setLoadingCities] = useState(false);

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?ordenar=nome');
        const data = await response.json();
        setStates(data);
      } catch (err) {
        console.error('Erro ao buscar estados:', err);
      }
    };
    fetchStates();
  }, []);

  useEffect(() => {
    if (!selectedState) return;
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios?ordenar=nome`);
        const data = await response.json();
        setCities(data);
      } catch (err) {
        console.error('Erro ao buscar cidades:', err);
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [selectedState]);

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedState(e.target.value);
    setFormData(prev => ({ ...prev, cidade: '' }));
  };

  const getRegistrationId = (id: string) => {
    const idStr = String(id);
    if (idStr.includes('-')) {
      return `EG3T-${idStr.split('-')[0].toUpperCase()}`;
    }
    return `EG3T-${idStr.padStart(5, '0')}`;
  };

  const navigate = useNavigate();

  const handleCopyPix = () => {
    navigator.clipboard.writeText('62.378.994/0001-31');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReceipt = () => {
    // Create a programmatical canvas element
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Background Fill (Premium Deep Charcoal / Gold border)
    ctx.fillStyle = '#18181b'; // zinc-900 background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative Gold Border
    ctx.strokeStyle = '#eab308'; // yellow-500 gold
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    // Inner subtle border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    // 2. Load the Logo Image
    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      // Draw Logo
      const logoWidth = 140;
      const logoHeight = 140 * (logoImg.height / logoImg.width);
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = 40;
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

      const contentYStart = logoY + logoHeight + 25;

      // 3. Header Texts
      ctx.textAlign = 'center';
      
      // Receipt Title
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308'; // Gold Title
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa'; // zinc-400
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      // Gold Divider Line
      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      // 4. Data Card Background Box
      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b'; // zinc-950 background inside the box
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Banner ID Único Grande
      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(registrationId, canvas.width / 2, bannerY + 48);

      // Write Data Rows
      ctx.textAlign = 'left';
      const items = [
        { label: 'COMPETIDORA', value: formData.nome.toUpperCase() },
        { label: 'IDADE', value: `${formData.idade} anos` },
        ...(formData.idade && parseInt(formData.idade) < 18 ? [{ label: 'RESPONSÁVEL', value: formData.responsavel.toUpperCase() }] : []),
        { label: 'CIDADE', value: formData.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: formData.nomeCavalo.toUpperCase() },
        { label: 'WHATSAPP', value: formData.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: 'AGUARDANDO VALIDAÇÃO', color: '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a'; // zinc-500
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65; // move down after each row of 2 columns
        }
      });

      // 5. Confirmation Footer inside Card
      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date().toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      // 6. Organization Footer text outside Card
      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      // 7. Trigger the PNG Download
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${formData.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    logoImg.onerror = () => {
      console.error("Erro ao carregar logo.png para canvas");
      // Fallback in case image loading fails (e.g. no network or blocked path)
      ctx.textAlign = 'center';
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('EXPO GOIABAL 2026', canvas.width / 2, 80);
      
      const contentYStart = 120;
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      // Banner ID Único Grande (Fallback)
      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(registrationId, canvas.width / 2, bannerY + 48);

      ctx.textAlign = 'left';
      const items = [
        { label: 'COMPETIDORA', value: formData.nome.toUpperCase() },
        { label: 'IDADE', value: `${formData.idade} anos` },
        ...(formData.idade && parseInt(formData.idade) < 18 ? [{ label: 'RESPONSÁVEL', value: formData.responsavel.toUpperCase() }] : []),
        { label: 'CIDADE', value: formData.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: formData.nomeCavalo.toUpperCase() },
        { label: 'WHATSAPP', value: formData.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: 'AGUARDANDO VALIDAÇÃO', color: '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65;
        }
      });

      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date().toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${formData.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    logoImg.src = window.location.origin + '/logo.png';
  };

  const handleSearchStatus = async () => {
    const cleanId = searchId.trim().toUpperCase().replace('EG3T-', '');
    if (!cleanId) return;

    setSearchLoading(true);
    setSearchResult(null);
    setSearchError('');

    try {
      const { data, error } = await supabase
        .from('inscricoes_3tambores')
        .select('*');
      
      if (error) throw error;

      const match = data?.find(i => {
        const idStr = String(i.id);
        const firstPart = idStr.includes('-') ? idStr.split('-')[0].toUpperCase() : idStr.padStart(5, '0');
        return firstPart === cleanId || idStr === cleanId;
      });

      if (!match) {
        setSearchError('Inscrição não encontrada. Verifique o código e tente novamente.');
      } else {
        setSearchResult(match);
      }
    } catch (err: any) {
      console.error(err);
      setSearchError('Erro ao consultar status. Tente novamente.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleDownloadSpecificReceipt = (inscricao: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 800;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    ctx.strokeRect(16, 16, canvas.width - 32, canvas.height - 32);

    const logoImg = new Image();
    logoImg.crossOrigin = 'anonymous';
    logoImg.onload = () => {
      const logoWidth = 140;
      const logoHeight = 140 * (logoImg.height / logoImg.width);
      const logoX = (canvas.width - logoWidth) / 2;
      const logoY = 40;
      ctx.drawImage(logoImg, logoX, logoY, logoWidth, logoHeight);

      const contentYStart = logoY + logoHeight + 25;
      ctx.textAlign = 'center';
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(getRegistrationId(inscricao.id), canvas.width / 2, bannerY + 48);

      ctx.textAlign = 'left';
      const isConfirmed = inscricao.status === 'Confirmado';
      const items = [
        { label: 'COMPETIDORA', value: inscricao.nome.toUpperCase() },
        { label: 'IDADE', value: `${inscricao.idade} anos` },
        ...(inscricao.responsavel ? [{ label: 'RESPONSÁVEL', value: inscricao.responsavel.toUpperCase() }] : []),
        { label: 'CIDADE', value: inscricao.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: inscricao.nome_cavalo.toUpperCase() },
        { label: 'WHATSAPP', value: inscricao.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: isConfirmed ? 'CONFIRMADO & LIBERADO' : 'AGUARDANDO VALIDAÇÃO', color: isConfirmed ? '#22c55e' : '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65;
        }
      });

      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date(inscricao.created_at).toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(isConfirmed ? 'Inscrição Liberada Oficialmente.' : 'A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${inscricao.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    logoImg.onerror = () => {
      ctx.textAlign = 'center';
      ctx.font = '900 24px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('EXPO GOIABAL 2026', canvas.width / 2, 80);
      
      const contentYStart = 120;
      ctx.font = '900 20px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('COMPROVANTE DE INSCRIÇÃO', canvas.width / 2, contentYStart);
      
      ctx.font = 'bold 12px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('PROVA DE 3 TAMBORES • EXPO GOIABAL 2026', canvas.width / 2, contentYStart + 22);

      ctx.beginPath();
      ctx.moveTo(40, contentYStart + 35);
      ctx.lineTo(canvas.width - 40, contentYStart + 35);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2;
      ctx.stroke();

      const cardY = contentYStart + 55;
      const cardWidth = canvas.width - 80;
      const cardHeight = 440;
      const cardX = 40;
      
      ctx.fillStyle = '#09090b';
      const r = 16;
      ctx.beginPath();
      ctx.moveTo(cardX + r, cardY);
      ctx.lineTo(cardX + cardWidth - r, cardY);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + r);
      ctx.lineTo(cardX + cardWidth, cardY + cardHeight - r);
      ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - r, cardY + cardHeight);
      ctx.lineTo(cardX + r, cardY + cardHeight);
      ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - r);
      ctx.lineTo(cardX, cardY + r);
      ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.stroke();

      ctx.fillStyle = 'rgba(234, 179, 8, 0.08)';
      const bannerH = 65;
      const bannerY = cardY + 20;
      ctx.fillRect(cardX + 20, bannerY, cardWidth - 40, bannerH);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(cardX + 20, bannerY, cardWidth - 40, bannerH);

      ctx.textAlign = 'center';
      ctx.font = 'bold 9px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText('CÓDIGO DE INSCRIÇÃO (ID)', canvas.width / 2, bannerY + 20);

      ctx.font = '900 24px monospace';
      ctx.fillStyle = '#eab308';
      ctx.fillText(getRegistrationId(inscricao.id), canvas.width / 2, bannerY + 48);

      ctx.textAlign = 'left';
      const isConfirmed = inscricao.status === 'Confirmado';
      const items = [
        { label: 'COMPETIDORA', value: inscricao.nome.toUpperCase() },
        { label: 'IDADE', value: `${inscricao.idade} anos` },
        ...(inscricao.responsavel ? [{ label: 'RESPONSÁVEL', value: inscricao.responsavel.toUpperCase() }] : []),
        { label: 'CIDADE', value: inscricao.cidade.toUpperCase() },
        { label: 'NOME DO CAVALO', value: inscricao.nome_cavalo.toUpperCase() },
        { label: 'WHATSAPP', value: inscricao.whatsapp },
        { label: 'STATUS DO PAGAMENTO', value: isConfirmed ? 'CONFIRMADO & LIBERADO' : 'AGUARDANDO VALIDAÇÃO', color: isConfirmed ? '#22c55e' : '#f59e0b' },
        { label: 'RECEBEDOR', value: 'BeP Eventos Cronometrados' },
        { label: 'CHAVE PIX CNPJ', value: '62.378.994/0001-31' }
      ];

      let rowY = cardY + 115;
      items.forEach((item, index) => {
        const col = index % 2;
        const colX = cardX + 30 + col * 260;
        
        ctx.font = 'bold 9px sans-serif';
        ctx.fillStyle = '#71717a';
        ctx.fillText(item.label, colX, rowY);
        
        ctx.font = 'bold 13px sans-serif';
        ctx.fillStyle = item.color || '#ffffff';
        ctx.fillText(item.value, colX, rowY + 18);

        if (col === 1 || index === items.length - 1) {
          rowY += 65;
        }
      });

      const cardFooterY = cardY + cardHeight - 25;
      ctx.textAlign = 'center';
      ctx.font = 'medium 11px sans-serif';
      ctx.fillStyle = '#71717a';
      const nowStr = new Date(inscricao.created_at).toLocaleString('pt-BR');
      ctx.fillText(`Confirmação: ${nowStr}`, canvas.width / 2, cardFooterY);

      const footerY = cardY + cardHeight + 40;
      ctx.textAlign = 'center';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillStyle = '#a1a1aa';
      ctx.fillText(isConfirmed ? 'Inscrição Liberada Oficialmente.' : 'A Organização entrará em contato para liberar sua inscrição.', canvas.width / 2, footerY);
      
      ctx.font = '900 12px sans-serif';
      ctx.fillStyle = '#eab308';
      ctx.fillText('PREFEITURA DE SÃO JOSÉ DO GOIABAL', canvas.width / 2, footerY + 20);

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Comprovante_Inscricao_3Tambores_${inscricao.nome.replace(/\s+/g, '_')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };
    logoImg.src = window.location.origin + '/logo.png';
  };

  const nextStep = () => {
    // Validações
    if (step === 1 && !formData.nome) return;
    if (step === 2) {
      if (!formData.idade) return;
      if (parseInt(formData.idade) < 18 && !formData.responsavel) return;
    }
    if (step === 3 && !formData.cidade) return;
    if (step === 4 && !formData.nomeCavalo) return;
    if (step === 5 && !formData.whatsapp) return;
    
    setStep(prev => Math.min(prev + 1, 6));
  };
  
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'whatsapp') {
      const cleaned = value.replace(/\D/g, '').slice(0, 11);
      let formatted = cleaned;
      if (cleaned.length > 0) formatted = '(' + cleaned;
      if (cleaned.length > 2) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2);
      if (cleaned.length > 3) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2, 3) + ' ' + cleaned.slice(3);
      if (cleaned.length > 7) formatted = '(' + cleaned.slice(0, 2) + ') ' + cleaned.slice(2, 3) + ' ' + cleaned.slice(3, 7) + '-' + cleaned.slice(7);
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!formData.termoAceito) {
      setErrorModal({ isOpen: true, message: 'Você precisa aceitar os termos de responsabilidade.' });
      return;
    }

    setIsSubmitting(true);

    try {
      // Inserir dados no banco e obter o ID gerado
      const { data, error: insertError } = await supabase
        .from('inscricoes_3tambores')
        .insert({
          nome: formData.nome,
          idade: parseInt(formData.idade),
          responsavel: parseInt(formData.idade) < 18 ? formData.responsavel : null,
          cidade: formData.cidade,
          nome_cavalo: formData.nomeCavalo,
          whatsapp: formData.whatsapp,
          termo_aceito: formData.termoAceito
        })
        .select('id')
        .single();

      if (insertError) {
        console.error("SUPABASE ERROR:", insertError);
        throw new Error(`Erro Supabase: ${insertError.message}`);
      }

      // Formatar o ID único da inscrição
      let finalId = '';
      if (data && data.id) {
        const idStr = String(data.id);
        if (idStr.includes('-')) {
          // UUID: pega a primeira seção para ficar limpo
          finalId = `EG3T-${idStr.split('-')[0].toUpperCase()}`;
        } else {
          // Serial ID: formata com zeros à esquerda
          finalId = `EG3T-${idStr.padStart(5, '0')}`;
        }
      } else {
        // Fallback robusto baseado em data/hora + número aleatório
        const rand = Math.floor(1000 + Math.random() * 9000);
        finalId = `EG3T-F${rand}`;
      }
      
      setRegistrationId(finalId);

      // Sucesso!
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error('Erro na submissão:', error);
      setErrorModal({ isOpen: true, message: error.message || 'Ocorreu um erro inesperado.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nome: '',
      idade: '',
      responsavel: '',
      cidade: '',
      nomeCavalo: '',
      whatsapp: '',
      termoAceito: false
    });
    setStep(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-zinc-900">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center pt-28 px-4 relative pb-12">
        <div className="md:hidden absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background2.png)', backgroundAttachment: 'fixed' }} />
        <div className="hidden md:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-10" style={{ backgroundImage: 'url(/background.png)', backgroundAttachment: 'fixed' }} />
        
        <div className="z-10 w-full max-w-6xl mt-4 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-20 animate-in slide-in-from-bottom-8 fade-in duration-1000">
          
          {/* Lado Esquerdo: Logo */}
          <div className="flex flex-col items-center gap-6">
            <img 
              src="/logo.png" 
              alt="ExpoGoiabal Logo" 
              className="w-full max-w-[280px] md:max-w-md drop-shadow-[0_0_15px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-500"
            />
            <div className="text-center">
              <h1 className="text-3xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                3 Tambores
              </h1>
              <div className="mt-4 flex flex-col gap-3 items-center">
                <p className="text-yellow-500 tracking-widest uppercase text-sm font-bold drop-shadow-[0_0_10px_rgba(255,215,0,0.4)]">
                  Inscrições Abertas
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchId('');
                    setSearchResult(null);
                    setSearchError('');
                    setIsStatusModalOpen(true);
                  }}
                  className="mt-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 border border-yellow-500/20 rounded-2xl text-xs font-black uppercase tracking-widest text-zinc-950 transition-all shadow-[0_0_20px_rgba(234,179,8,0.25)] hover:shadow-[0_0_35px_rgba(234,179,8,0.5)] flex items-center justify-center gap-2.5 cursor-pointer hover:scale-[1.04] active:scale-[0.98] duration-300 animate-pulse hover:animate-none"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  Consultar Status da Inscrição
                </button>
                
                <div className="flex items-center gap-3 bg-yellow-500/10 px-6 py-3 rounded-full border border-yellow-500/30 shadow-[0_0_15px_rgba(255,215,0,0.15)] mt-3">
                  <Ticket className="text-yellow-500" size={18} />
                  <span className="text-zinc-300 font-semibold uppercase tracking-widest text-xs">
                    Código IMA (GTA):
                  </span>
                  <span className="font-black text-yellow-500 tracking-widest text-xs md:text-sm">
                    96779
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Lado Direito: Formulário */}
          <div className="w-full max-w-xl flex flex-col gap-6">
            <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            
            {/* Progress Bar */}
            {step < 7 && (
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5, 6].map(s => (
                  <div key={s} className={`h-2 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-yellow-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]' : 'bg-zinc-800'}`} />
                ))}
              </div>
            )}

            <form onSubmit={step === 6 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
              
              {/* Step 1: Nome Completo */}
              {step === 1 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <User size={28} />
                    <h2 className="text-2xl font-bold text-white">Nome Completo</h2>
                  </div>
                  <input 
                    type="text" 
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Digite seu nome completo"
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Step 2: Idade */}
              {step === 2 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-yellow-500 mb-2">
                      <Calendar size={28} />
                      <h2 className="text-2xl font-bold text-white">Idade</h2>
                    </div>
                    <input 
                      type="number" 
                      name="idade"
                      value={formData.idade}
                      onChange={handleInputChange}
                      placeholder="Sua idade"
                      min="1"
                      max="100"
                      required
                      className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                    />
                  </div>

                  {formData.idade && parseInt(formData.idade) < 18 && (
                    <div className="flex flex-col gap-2 mt-2 animate-in slide-in-from-top-4 duration-300">
                      <div className="flex items-center gap-3 text-yellow-500 mb-2">
                        <User size={28} />
                        <h2 className="text-2xl font-bold text-white">Nome do Responsável</h2>
                      </div>
                      <input 
                        type="text" 
                        name="responsavel"
                        value={formData.responsavel}
                        onChange={handleInputChange}
                        placeholder="Nome do pai, mãe ou responsável legal"
                        required
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Cidade */}
              {step === 3 && (
                <div className="flex flex-col gap-5 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-1">
                    <MapPin size={28} />
                    <h2 className="text-2xl font-bold text-white">Cidade</h2>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Estado (UF)</label>
                      <select 
                        value={selectedState}
                        onChange={handleStateChange}
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg appearance-none cursor-pointer"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23eab308\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1.5rem center',
                          backgroundSize: '1.2rem'
                        }}
                      >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">Selecione o Estado</option>
                        {states.map(state => (
                          <option key={state.id} value={state.sigla} className="bg-zinc-900 text-white">
                            {state.nome} ({state.sigla})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Município</label>
                      <select 
                        value={formData.cidade}
                        onChange={(e) => setFormData(prev => ({ ...prev, cidade: e.target.value }))}
                        disabled={!selectedState || loadingCities}
                        required
                        className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%23eab308\' stroke-width=\'3\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'right 1.5rem center',
                          backgroundSize: '1.2rem'
                        }}
                      >
                        <option value="" disabled className="bg-zinc-900 text-zinc-500">
                          {loadingCities ? 'Carregando cidades...' : 'Selecione a Cidade'}
                        </option>
                        {cities.map(city => (
                          <option key={city.id} value={`${city.nome} - ${selectedState}`} className="bg-zinc-900 text-white">
                            {city.nome}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Nome do Cavalo */}
              {step === 4 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Star size={28} />
                    <h2 className="text-2xl font-bold text-white">Nome do Cavalo</h2>
                  </div>
                  <input 
                    type="text" 
                    name="nomeCavalo"
                    value={formData.nomeCavalo}
                    onChange={handleInputChange}
                    placeholder="Digite o nome do cavalo"
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Step 5: WhatsApp */}
              {step === 5 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <Phone size={28} />
                    <h2 className="text-2xl font-bold text-white">WhatsApp</h2>
                  </div>
                  <input 
                    type="tel" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="(00) 0 0000-0000"
                    maxLength={16}
                    minLength={16}
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-700 rounded-xl px-6 py-4 text-white placeholder-zinc-500 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 transition-all text-lg"
                  />
                </div>
              )}

              {/* Step 6: Pagamento */}
              {step === 6 && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-right fade-in">
                  <div className="flex items-center gap-3 text-yellow-500 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                    <h2 className="text-2xl font-bold text-white">Pagamento da Inscrição</h2>
                  </div>
                  
                  <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 flex flex-col gap-4 text-zinc-300">
                    <p className="text-sm">
                      Para confirmar sua participação na Prova de 3 Tambores, realize o pagamento da taxa via PIX:
                    </p>
                    
                    <div className="bg-black/40 rounded-lg p-4 border border-zinc-800 flex flex-col gap-2 relative">
                      <span className="text-zinc-500 uppercase tracking-widest text-[10px] font-black text-left">Chave PIX CNPJ</span>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-white font-mono font-bold text-base select-all">62.378.994/0001-31</span>
                        <button
                          type="button"
                          onClick={handleCopyPix}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                            copied 
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.15)]' 
                              : 'bg-zinc-800 hover:bg-zinc-700 text-yellow-500 border border-zinc-700'
                          }`}
                        >
                          {copied ? 'Copiado!' : 'Copiar'}
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 bg-black/20 p-3 rounded-lg border border-zinc-800/40 text-xs">
                      <span className="text-zinc-500 uppercase tracking-widest text-[9px] font-black text-left">Nome do Recebedor</span>
                      <span className="text-white font-bold text-left">BeP Eventos Cronometrados</span>
                    </div>

                    <p className="text-[11px] text-zinc-500 italic text-left">
                      * Após realizar a transferência em seu aplicativo bancário, clique no botão "Confirmar Pagamento" abaixo para registrar a sua inscrição.
                    </p>
                  </div>
                </div>
              )}

              {/* Checkbox Termos Global */}
              {step > 1 && step <= 5 && (
                <div className="flex items-start gap-3 mt-8 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 animate-in fade-in">
                  <input 
                    type="checkbox" 
                    id="termo"
                    name="termoAceito"
                    checked={formData.termoAceito}
                    onChange={(e) => setFormData(prev => ({...prev, termoAceito: e.target.checked}))}
                    className="mt-1 w-5 h-5 rounded border-zinc-700 bg-zinc-900 text-yellow-500 focus:ring-yellow-500 cursor-pointer"
                    required
                  />
                  <label htmlFor="termo" className="text-sm text-zinc-300">
                    Li e concordo com o{' '}
                    <button 
                      type="button" 
                      onClick={() => setIsTermosOpen(true)}
                      className="text-yellow-500 hover:text-yellow-400 font-bold underline outline-none"
                    >
                      Termo de Responsabilidade
                    </button>.
                  </label>
                </div>
              )}

              {/* Navigation Buttons */}
              {step <= 6 && (
                <div className="flex justify-between items-center mt-10 gap-4">
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={handleReset}
                      className="flex items-center justify-center w-12 h-12 md:w-auto md:px-6 md:py-3 rounded-xl font-bold text-zinc-400 bg-zinc-800 hover:bg-red-500/20 hover:text-red-400 transition-all"
                      title="Resetar Formulário"
                    >
                      <RefreshCcw size={20} />
                      <span className="hidden md:block ml-2">Resetar</span>
                    </button>

                    {step > 1 && (
                      <button 
                        type="button" 
                        onClick={prevStep}
                        className="flex items-center gap-2 px-4 md:px-6 py-3 rounded-xl font-bold text-white bg-zinc-700 hover:bg-zinc-600 transition-all"
                      >
                        <ArrowLeft size={20} />
                        <span className="hidden md:block">Voltar</span>
                      </button>
                    )}
                  </div>

                  <button 
                    type="submit"
                    disabled={(step === 1 && !formData.nome) || (step === 5 && !formData.termoAceito) || isSubmitting}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-black uppercase tracking-wide transition-all ${
                      (step === 1 && !formData.nome) || (step === 5 && !formData.termoAceito) || isSubmitting
                        ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:scale-105 shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    }`}
                  >
                    {isSubmitting ? (
                      <span key="submitting" className="flex items-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processando...
                      </span>
                    ) : step === 6 ? (
                      <span key="finalizar">Confirmar Pagamento</span>
                    ) : (
                      <span key="proximo">Próximo</span>
                    )}
                    {!isSubmitting && step < 6 && <ArrowRight size={20} />}
                  </button>
                </div>
              )}
            </form>

          </div>

          {/* Aviso Importante */}
          <div className="bg-red-950/90 backdrop-blur-xl border border-red-500/50 rounded-2xl p-5 flex items-start sm:items-center gap-4 shadow-[0_0_30px_rgba(239,68,68,0.2)]">
            <AlertTriangle className="text-red-500 shrink-0" size={24} />
            <p className="text-white font-bold uppercase tracking-wider text-xs md:text-sm leading-relaxed">
              Será exigido exame de AIE, atestado sanitário da propriedade e GTA impressos e originais.
            </p>
          </div>

          </div>
        </div>
      </main>

      {/* Modal de Termos */}
      {isTermosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-xl font-bold text-white">Termo de Responsabilidade</h2>
              <button 
                onClick={() => setIsTermosOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto text-zinc-300 space-y-4 text-sm leading-relaxed">
              <p className="font-bold text-center text-white mb-4">
                TERMO DE RESPONSABILIDADE<br/>
                PROVA DE 3 TAMBORES — EXPOGOIABAL 2026
              </p>
              <p>Declaro, para os devidos fins, minha inscrição voluntária para participação na prova de 3 Tambores da EXPOGOIABAL 2026, promovida pela Prefeitura Municipal de São José do Goiabal.</p>
              
              <h3 className="font-bold text-yellow-500 mt-4">1. DA PARTICIPAÇÃO</h3>
              <p>O participante declara estar ciente das regras da competição e de que sua participação é voluntária.</p>

              <h3 className="font-bold text-yellow-500 mt-4">2. DA RESPONSABILIDADE</h3>
              <p>O participante assume inteira responsabilidade por sua conduta e a de seu animal durante o evento, bem como pelos risks inerentes ao esporte equestre, isentando a Prefeitura Municipal de São José do Goiabal e a organização do evento de qualquer responsabilidade civil ou criminal por acidentes, danos físicos, materiais ou morais.</p>

              <h3 className="font-bold text-yellow-500 mt-4">3. DA AUTORIZAÇÃO DE USO DE IMAGEM</h3>
              <p>O participante autoriza, de forma gratuita e por prazo indeterminado, o uso de sua imagem para fins de divulgação do evento.</p>
            </div>
            <div className="p-6 border-t border-zinc-800 bg-zinc-900/50">
              <button 
                type="button"
                onClick={() => {
                  setFormData(prev => ({...prev, termoAceito: true}));
                  setIsTermosOpen(false);
                }}
                className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-colors uppercase tracking-widest"
              >
                Li e Aceito os Termos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-green-500/30 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_40px_rgba(34,197,94,0.25)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-green-500/15 to-transparent pointer-events-none"></div>
            
            <div className="p-4 sm:p-6 flex flex-col items-center text-center gap-3.5 sm:gap-4 relative z-10">
              
              {/* Modern compact success ribbon */}
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 px-4 py-2.5 rounded-2xl w-full justify-center">
                <CheckCircle size={18} className="text-green-400 shrink-0" />
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
                  Inscrição Realizada!
                </h3>
              </div>
              
              <p className="text-zinc-300 leading-normal text-[11px] sm:text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
                A organização da <strong className="text-green-400">ExpoGoiabal</strong> entrará em contato para confirmar o pagamento.
              </p>

              {/* Comprovante Visual Container (Unified Digital Receipt Card) */}
              <div className="w-full bg-zinc-950/80 rounded-2xl p-4 sm:p-5 border border-zinc-800 flex flex-col gap-3.5 text-left font-sans text-xs relative overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.4)]">
                {/* Gold accent vertical line on the left side */}
                <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500"></div>

                <div className="flex justify-between items-center pb-2.5 border-b border-zinc-800/80">
                  <img src="/logo.png" alt="Logo ExpoGoiabal" className="h-7 sm:h-9 object-contain drop-shadow-[0_0_6px_rgba(255,215,0,0.2)]" />
                  <div className="text-right">
                    <span className="block font-black uppercase text-[8px] sm:text-[9px] tracking-widest text-yellow-500">
                      3 Tambores
                    </span>
                    <span className="block text-[7px] uppercase tracking-wider text-zinc-400">
                      ExpoGoiabal 2026
                    </span>
                  </div>
                </div>

                {/* Highly visible unique Registration ID section */}
                <div className="bg-black/60 px-3 py-2.5 rounded-xl border border-yellow-500/20 flex flex-col items-center gap-0.5 text-center">
                  <span className="text-[8px] uppercase tracking-widest text-zinc-400 font-bold">
                    Código de Inscrição (ID)
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-yellow-500 font-mono tracking-wider drop-shadow-[0_0_8px_rgba(255,215,0,0.25)]">
                    {registrationId}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 pt-0.5">
                  <div className="flex flex-col col-span-2">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Competidora</span>
                    <span className="text-white font-bold truncate text-[10px] sm:text-xs">{formData.nome}</span>
                  </div>
                  {formData.idade && parseInt(formData.idade) < 18 && (
                    <div className="flex flex-col col-span-2">
                      <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Responsável</span>
                      <span className="text-white font-bold truncate text-[10px] sm:text-xs">{formData.responsavel}</span>
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Cavalo</span>
                    <span className="text-white font-bold truncate text-[10px] sm:text-xs">{formData.nomeCavalo}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Cidade</span>
                    <span className="text-white font-semibold truncate text-[10px] sm:text-xs">{formData.cidade}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[8px] uppercase tracking-wider text-zinc-400 font-bold mb-0.5">Status</span>
                    <span className="text-yellow-500 font-black text-[10px] sm:text-xs drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">Aguardando Validação</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-zinc-800/80 flex justify-between items-center text-[8px] sm:text-[9px] text-zinc-400 font-medium">
                  <span>Confirmação: {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="text-yellow-500/80 font-bold uppercase tracking-wider text-[7px]">Oficial</span>
                </div>
              </div>

              {/* Bloco de Envio para WhatsApp */}
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col gap-3.5 w-full text-center">
                <p className="text-zinc-300 text-[11px] sm:text-xs leading-relaxed font-semibold">
                  ⚠️ <strong className="text-white">ATENÇÃO:</strong> Para confirmar e liberar sua participação na prova, você deve enviar o <strong className="text-emerald-400">comprovante de pagamento (PIX)</strong> e o <strong className="text-emerald-400">comprovante de inscrição</strong> gerado abaixo.
                </p>
                <a 
                  href={`https://wa.me/5531983446102?text=Olá! Segue o comprovante de pagamento e o comprovante de inscrição 3 Tambores (ID: ${registrationId}) para realizar a liberação.`}
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full py-3 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(37,211,102,0.25)] flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.292-4.147c1.8.196 3.11.1 4.7.1 5.3 0 9.6-4.3 9.6-9.6s-4.3-9.6-9.6-9.6-9.6 4.3-9.6 9.6c0 1.9.5 3.7 1.4 5.3l.1.2-1 3.7 3.8-1zm10.708-7.853c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.8-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4-.1-.5-.1-.2-.7-1.7-.9-2.2-.3-.6-.6-.5-.9-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.5 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.7-.7 2-1.3.3-.6.3-1.1.2-1.2-.1-.1-.3-.2-.6-.3z"/></svg>
                  Enviar para o WhatsApp
                </a>
              </div>
              
              <div className="flex gap-3 w-full mt-0.5">
                <button 
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="flex-1 py-2 sm:py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-wider rounded-xl transition-all border border-zinc-700 flex items-center justify-center gap-1.5 text-[10px] sm:text-xs"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar PNG
                </button>
                
                <button 
                  onClick={() => {
                    setShowSuccessModal(false);
                    navigate('/ExpoGoiabal/Inicio');
                  }}
                  className="flex-1 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 hover:scale-[1.01] text-white font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_12px_rgba(34,197,94,0.3)] text-[10px] sm:text-xs"
                >
                  Concluir
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Erro */}
      {errorModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-red-500/50 rounded-3xl w-full max-w-md flex flex-col shadow-[0_0_30px_rgba(239,68,68,0.3)] overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-red-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-xl font-bold text-white">Ops! Algo deu errado</h3>
              <p className="text-zinc-400">{errorModal.message}</p>
              <button 
                onClick={() => setErrorModal({ isOpen: false, message: '' })}
                className="mt-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Consulta de Status */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900">
              <h2 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Status da Inscrição
              </h2>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors text-xl font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Código da Inscrição (ID)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    placeholder="EG3T-00001 ou C8E645A9"
                    className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 rounded-xl px-4 py-3 text-white placeholder-zinc-550 focus:outline-none transition-all text-sm font-semibold font-mono"
                  />
                  <button
                    onClick={handleSearchStatus}
                    disabled={searchLoading || !searchId.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {searchLoading ? 'Buscando...' : 'Buscar'}
                  </button>
                </div>
              </div>

              {searchError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-3.5 text-xs text-center font-medium animate-in fade-in">
                  {searchError}
                </div>
              )}

              {searchResult && (
                <div className="flex flex-col gap-4 animate-in slide-in-from-top-4 duration-300">
                  <div className={`p-4 rounded-2xl border text-center flex flex-col gap-2.5 ${
                    searchResult.status === 'Confirmado'
                      ? 'bg-green-500/5 border-green-500/20 text-green-400'
                      : 'bg-yellow-500/5 border-yellow-500/20 text-yellow-500'
                  }`}>
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400">Status do Pagamento</span>
                    <div className="flex items-center justify-center gap-2 text-base font-black uppercase tracking-wider">
                      {searchResult.status === 'Confirmado' ? (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping animate-duration-1000"></span>
                          <span>Inscrição Confirmada!</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse"></span>
                          <span>Pagamento Pendente</span>
                        </>
                      )}
                    </div>
                    {searchResult.status !== 'Confirmado' && (
                      <p className="text-[11px] text-zinc-500 leading-normal font-semibold max-w-xs mx-auto">
                        ⚠️ Envie seu comprovante de pagamento Pix e de inscrição para nosso WhatsApp (+55 31 98344-6102) para realizar a liberação imediata.
                      </p>
                    )}
                  </div>

                  {/* Detalhes Compactos do Registro */}
                  <div className="bg-zinc-950/80 border border-zinc-800 rounded-2xl p-4.5 flex flex-col gap-2.5 text-xs relative overflow-hidden">
                    <div className="absolute left-0 top-0 w-1 h-full bg-yellow-500"></div>
                    <div className="flex justify-between items-center pb-2 border-b border-zinc-800/80">
                      <span className="font-mono text-[10px] text-yellow-500 font-bold">{getRegistrationId(searchResult.id)}</span>
                      <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-bold">Oficial</span>
                    </div>
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-1 font-sans">
                      <div className="flex flex-col col-span-2">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold mb-0.5">Competidora</span>
                        <span className="text-white font-bold truncate">{searchResult.nome}</span>
                      </div>
                      {searchResult.responsavel && (
                        <div className="flex flex-col col-span-2">
                          <span className="text-[8px] text-zinc-500 uppercase font-bold mb-0.5">Responsável</span>
                          <span className="text-white font-bold truncate">{searchResult.responsavel}</span>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold mb-0.5">Cavalo</span>
                        <span className="text-white font-bold truncate">{searchResult.nome_cavalo}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold mb-0.5">Cidade</span>
                        <span className="text-white font-semibold truncate">{searchResult.cidade}</span>
                      </div>
                      <div className="flex flex-col col-span-2">
                        <span className="text-[8px] text-zinc-500 uppercase font-bold mb-0.5">Confirmado em</span>
                        <span className="text-white font-semibold truncate">{searchResult.created_at ? new Date(searchResult.created_at).toLocaleDateString('pt-BR') : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Baixar Comprovante apenas se Confirmado */}
                  {searchResult.status === 'Confirmado' ? (
                    <button
                      onClick={() => handleDownloadSpecificReceipt(searchResult)}
                      className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Baixar Comprovante Liberado (PNG)
                    </button>
                  ) : (
                    <a 
                      href={`https://wa.me/5531983446102?text=Olá! Gostaria de confirmar o pagamento da minha inscrição 3 Tambores (ID: ${getRegistrationId(searchResult.id)}).`}
                      target="_blank" 
                      rel="noreferrer"
                      className="w-full py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-black font-black uppercase tracking-wider text-xs rounded-xl transition-all shadow-[0_0_12px_rgba(37,211,102,0.2)] flex items-center justify-center gap-2 cursor-pointer text-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 24 24" className="shrink-0"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.733-1.455L0 24zm6.292-4.147c1.8.196 3.11.1 4.7.1 5.3 0 9.6-4.3 9.6-9.6s-4.3-9.6-9.6-9.6-9.6 4.3-9.6 9.6c0 1.9.5 3.7 1.4 5.3l.1.2-1 3.7 3.8-1zm10.708-7.853c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.4-2.3-1.4-.8-.7-1.4-1.6-1.6-1.8-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.1.2-.3.3-.4.1-.2 0-.4-.1-.5-.1-.2-.7-1.7-.9-2.2-.3-.6-.6-.5-.9-.5h-.7c-.2 0-.6.1-.9.4-.3.3-1.1 1.1-1.1 2.7s1.2 3.1 1.3 3.3c.2.2 2.3 3.5 5.5 4.9.8.3 1.4.5 1.9.7.8.2 1.5.2 2.1.1.7-.1 1.7-.7 2-1.3.3-.6.3-1.1.2-1.2-.1-.1-.3-.2-.6-.3z"/></svg>
                      Enviar Comprovante de Pagamento
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
