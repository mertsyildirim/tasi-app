import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PortalLayout from '../../components/portal/Layout';
import { FaChartLine, FaChartBar, FaChartPie, FaDownload, FaFilter, FaCalendarAlt, FaFileAlt, FaTruck, FaUser, FaMoneyBillWave, FaMapMarkedAlt, FaClock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Reports() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dateRange, setDateRange] = useState('week');
  const [reportType, setReportType] = useState('all');
  const [filterLoading, setFilterLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const reportRefs = {};

  useEffect(() => {
    // Kullanıcı kontrolü
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/portal/login');
      return;
    }
    setLoading(false);
  }, [router]);

  // Örnek rapor verileri
  const [reports] = useState([
    {
      id: 'REP001',
      title: 'Aylık Taşıma Raporu',
      type: 'shipment',
      date: '2024-02-01',
      period: 'Ocak 2024',
      status: 'completed',
      data: {
        labels: ['1 Ocak', '5 Ocak', '10 Ocak', '15 Ocak', '20 Ocak', '25 Ocak', '30 Ocak'],
        datasets: [{
          label: 'Taşıma Sayısı',
          data: [12, 19, 15, 17, 22, 24, 20],
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
        }]
      },
      summary: {
        'Toplam Taşıma': 156,
        'Tamamlanan Taşıma': 142,
        'Geciken Taşıma': 8,
        'İptal Edilen Taşıma': 6,
        'Toplam Mesafe': '12,450 km',
        'Ortalama Süre': '2.3 gün'
      }
    },
    {
      id: 'REP002',
      title: 'Finansal Performans Raporu',
      type: 'financial',
      date: '2024-02-10',
      period: 'Ocak 2024',
      status: 'completed',
      data: {
        labels: ['1 Ocak', '5 Ocak', '10 Ocak', '15 Ocak', '20 Ocak', '25 Ocak', '30 Ocak'],
        datasets: [{
          label: 'Gelir (₺)',
          data: [15000, 18000, 22000, 19000, 25000, 28000, 30000],
          borderColor: 'rgb(34, 197, 94)',
          backgroundColor: 'rgba(34, 197, 94, 0.5)',
        }]
      },
      summary: {
        'Toplam Gelir': '₺245.750',
        'Toplam Gider': '₺187.320',
        'Net Kar': '₺58.430',
        'Kar Marjı': '%23.8',
        'Ortalama İşlem': '₺1.575',
        'Bekleyen Ödemeler': '₺12.450'
      }
    },
    {
      id: 'REP003',
      title: 'Sürücü Performans Raporu',
      type: 'driver',
      date: '2024-02-15',
      period: 'Ocak 2024',
      status: 'completed',
      data: {
        labels: ['1 Ocak', '5 Ocak', '10 Ocak', '15 Ocak', '20 Ocak', '25 Ocak', '30 Ocak'],
        datasets: [{
          label: 'Teslimat Sayısı',
          data: [45, 52, 48, 55, 50, 58, 62],
          borderColor: 'rgb(234, 88, 12)',
          backgroundColor: 'rgba(234, 88, 12, 0.5)',
        }]
      },
      summary: {
        'Toplam Sürücü': 28,
        'Aktif Sürücü': 25,
        'Toplam Teslimat': 312,
        'Zamanında Teslimat': 298,
        'Geciken Teslimat': 14,
        'Ortalama Puan': 4.5
      }
    },
    {
      id: 'REP004',
      title: 'Rota Optimizasyon Raporu',
      type: 'route',
      date: '2024-02-20',
      period: 'Ocak 2024',
      status: 'completed',
      data: {
        labels: ['1 Ocak', '5 Ocak', '10 Ocak', '15 Ocak', '20 Ocak', '25 Ocak', '30 Ocak'],
        datasets: [{
          label: 'Optimize Edilen Rotalar',
          data: [8, 12, 15, 18, 20, 22, 25],
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.5)',
        }]
      },
      summary: {
        'Toplam Rota': 89,
        'Optimize Rota': 82,
        'Toplam Mesafe': '15.780 km',
        'Yakıt Verimliliği': '8.2 L/100km',
        'Zaman Verimliliği': '%92',
        'Maliyet Tasarrufu': '₺8.450'
      }
    }
  ]);

  // Tarih aralığına göre veri filtreleme
  const getFilteredData = (data, dateRange) => {
    const labels = data.labels;
    const values = data.datasets[0].data;
    
    switch(dateRange) {
      case 'day':
        return {
          labels: [labels[labels.length - 1]],
          datasets: [{
            ...data.datasets[0],
            data: [values[values.length - 1]]
          }]
        };
      case 'week':
        return {
          labels: labels.slice(-7),
          datasets: [{
            ...data.datasets[0],
            data: values.slice(-7)
          }]
        };
      case 'month':
        return data;
      case 'quarter':
        return {
          labels: labels.slice(-30),
          datasets: [{
            ...data.datasets[0],
            data: values.slice(-30)
          }]
        };
      case 'year':
        return {
          labels: labels.slice(-90),
          datasets: [{
            ...data.datasets[0],
            data: values.slice(-90)
          }]
        };
      default:
        return data;
    }
  };

  // Önce rapor türüne göre filtrele
  const reportsByType = reports.filter(report => {
    if (reportType === 'all') return true;
    return report.type === reportType;
  });

  // Sonra tarih aralığına göre grafik verilerini güncelle
  const filteredReports = reportsByType.map(report => ({
    ...report,
    data: getFilteredData(report.data, dateRange)
  }));

  // Filtreleme işlemi için loading durumu
  const handleFilterChange = (type, value) => {
    setFilterLoading(true);
    if (type === 'dateRange') {
      setDateRange(value);
    } else if (type === 'reportType') {
      setReportType(value);
    }
    // Loading durumunu 500ms sonra kaldır
    setTimeout(() => {
      setFilterLoading(false);
    }, 500);
  };

  // Rapor indirme işlevi
  const handleDownloadReport = async () => {
    setDownloadLoading(true);
    
    try {
      // PDF oluştur
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true
      });
      
      let yOffset = 20;
      
      // Türkçe font ayarları
      pdf.setFont('helvetica', 'bold');
      
      // Başlık ekle
      pdf.setFontSize(18);
      const title = 'Taşıma Raporları';
      pdf.text(title, 20, yOffset);
      yOffset += 15;
      
      // Tarih ve filtre bilgilerini ekle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const dateRangeText = `Tarih Aralığı: ${
        dateRange === 'day' ? 'Bugün' : 
        dateRange === 'week' ? 'Bu Hafta' : 
        dateRange === 'month' ? 'Bu Ay' : 
        dateRange === 'quarter' ? 'Bu Çeyrek' : 'Bu Yıl'
      }`;
      
      const reportTypeText = `Rapor Türü: ${
        reportType === 'all' ? 'Tüm Raporlar' : 
        reportType === 'shipment' ? 'Taşıma Raporları' : 
        reportType === 'financial' ? 'Finansal Raporlar' : 
        reportType === 'driver' ? 'Sürücü Raporları' : 'Rota Raporları'
      }`;
      
      pdf.text(dateRangeText, 20, yOffset);
      yOffset += 10;
      pdf.text(reportTypeText, 20, yOffset);
      yOffset += 15;
      
      // Her rapor için
      for (let i = 0; i < filteredReports.length; i++) {
        const report = filteredReports[i];
        
        // Rapor başlığı
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(14);
        pdf.text(report.title, 20, yOffset);
        yOffset += 10;
        
        // Grafik elementini bul
        const chartElement = document.querySelector(`[data-chart-id="${report.id}"]`);
        if (chartElement) {
          try {
            // Grafiği görüntü olarak al
            const canvas = await html2canvas(chartElement, {
              scale: 2,
              backgroundColor: '#ffffff',
              logging: false,
              useCORS: true
            });
            
            // Görüntüyü PDF'e ekle
            const imgData = canvas.toDataURL('image/png');
            const imgWidth = 170;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            
            // Sayfa kontrolü
            if (yOffset + imgHeight > 250) {
              pdf.addPage();
              yOffset = 20;
            }
            
            pdf.addImage(imgData, 'PNG', 20, yOffset, imgWidth, imgHeight);
            yOffset += imgHeight + 10;
          } catch (error) {
            console.error('Grafik dönüştürme hatası:', error);
            yOffset += 10;
          }
        }
        
        // Rapor özeti
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text('Özet Bilgiler:', 20, yOffset);
        yOffset += 8;
        
        // Özet bilgileri ekle
        pdf.setFont('helvetica', 'normal');
        Object.entries(report.summary).slice(0, 4).forEach(([key, value]) => {
          try {
            pdf.text(`${key}: ${value}`, 25, yOffset);
            yOffset += 7;
          } catch (error) {
            console.error('Metin ekleme hatası:', error);
            yOffset += 7;
          }
        });
        
        yOffset += 10;
        
        // Sayfa kontrolü
        if (yOffset > 250) {
          pdf.addPage();
          yOffset = 20;
        }
      }
      
      // PDF'i indir
      const today = new Date();
      const formattedDate = `${today.getDate()}.${today.getMonth() + 1}.${today.getFullYear()}`;
      pdf.save(`tasi-raporlari-${formattedDate}.pdf`);
    } catch (error) {
      console.error('Rapor indirme hatası:', error);
      alert('Rapor indirilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setDownloadLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <PortalLayout title="Raporlar">
      <div className="space-y-6 p-4">
        {/* Üst Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaFileAlt className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-1 rounded-full">
                Toplam
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Toplam Rapor</h3>
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%10 artış</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <span className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-1 rounded-full">
                Tamamlanan
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Tamamlanan Raporlar</h3>
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>%100 tamamlanma</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaChartBar className="h-5 w-5 text-purple-500" />
              </div>
              <span className="text-xs text-purple-700 font-semibold bg-purple-50 px-2 py-1 rounded-full">
                Analiz
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Analiz Türleri</h3>
            <p className="text-2xl font-bold text-gray-800">4</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>Taşıma, Finans, Sürücü, Rota</span>
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-5">
            <div className="flex justify-between items-center mb-2">
              <div className="p-3 bg-orange-100 rounded-full">
                <FaCalendarAlt className="h-5 w-5 text-orange-500" />
              </div>
              <span className="text-xs text-orange-700 font-semibold bg-orange-50 px-2 py-1 rounded-full">
                Periyot
              </span>
            </div>
            <h3 className="text-gray-500 text-sm">Rapor Periyodu</h3>
            <p className="text-2xl font-bold text-gray-800">Aylık</p>
            <p className="mt-2 text-xs text-green-600">
              <FaChartLine className="inline mr-1" />
              <span>Ocak 2024</span>
            </p>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
            <select
              value={dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
            >
                  <option value="day">Bugün</option>
              <option value="week">Bu Hafta</option>
              <option value="month">Bu Ay</option>
              <option value="quarter">Bu Çeyrek</option>
              <option value="year">Bu Yıl</option>
            </select>
                <FaCalendarAlt className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <select
                  value={reportType}
                  onChange={(e) => handleFilterChange('reportType', e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 appearance-none"
                >
                  <option value="all">Tüm Raporlar</option>
                  <option value="shipment">Taşıma Raporları</option>
                  <option value="financial">Finansal Raporlar</option>
                  <option value="driver">Sürücü Raporları</option>
                  <option value="route">Rota Raporları</option>
                </select>
                <FaFilter className="absolute left-3 top-3 text-gray-400" />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={handleDownloadReport}
                disabled={downloadLoading}
                className={`px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 flex items-center ${downloadLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {downloadLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    İndiriliyor...
                  </>
                ) : (
                  <>
                    <FaDownload className="mr-2" />
                    Rapor İndir
                  </>
                )}
            </button>
            </div>
          </div>
        </div>

        {/* Rapor Grafikleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReports.map(report => (
            <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                  <p className="text-sm text-gray-500">{report.period}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  report.status === 'completed' ? 'bg-green-100 text-green-800' : 
                  report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }`}>
                  {report.status === 'completed' ? 'Tamamlandı' : 
                   report.status === 'pending' ? 'Beklemede' : 
                   'Hata'}
                </span>
              </div>
              
              <div className="h-48 relative" data-chart-id={report.id}>
                {filterLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
                  </div>
                ) : null}
                <Line
                  data={report.data}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          font: {
                            family: "'Inter', sans-serif",
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        titleFont: {
                          family: "'Inter', sans-serif",
                          size: 14
                        },
                        bodyFont: {
                          family: "'Inter', sans-serif",
                          size: 12
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          font: {
                            family: "'Inter', sans-serif",
                            size: 12
                          }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      },
                      x: {
                        ticks: {
                          font: {
                            family: "'Inter', sans-serif",
                            size: 12
                          }
                        },
                        grid: {
                          color: 'rgba(0, 0, 0, 0.05)'
                        }
                      }
                    }
                  }}
                />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(report.summary).slice(0, 4).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-sm text-gray-500">{key}</p>
                      <p className="text-lg font-semibold text-gray-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
} 