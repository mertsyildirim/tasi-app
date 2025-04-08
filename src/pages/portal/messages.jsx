import { useState } from 'react';
import PortalLayout from '../../components/portal/Layout';
import { FaSearch, FaBell, FaUser, FaReply, FaPaperPlane } from 'react-icons/fa';

export default function Messages() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('system');
  const [replyText, setReplyText] = useState('');

  const [messages] = useState({
    system: [
      {
        id: 1,
        title: 'Yeni Ödeme Bildirimi',
        content: '15 Mart 2024 tarihli ödemeniz yapıldı.',
        date: '15.03.2024 10:30',
        read: false
      },
      {
        id: 2,
        title: 'Sistem Güncellemesi',
        content: 'Portal sistemimiz güncellendi. Yeni özellikler eklendi.',
        date: '14.03.2024 15:45',
        read: true
      },
      {
        id: 3,
        title: 'Bakım Bildirimi',
        content: 'Yarın 22:00-23:00 saatleri arasında bakım çalışması yapılacaktır.',
        date: '13.03.2024 09:15',
        read: true
      }
    ],
    customer: [
      {
        id: 1,
        customer: 'ABC Lojistik',
        subject: 'Teslimat Süresi',
        content: 'Merhaba, teslimat süresini öğrenebilir miyim?',
        date: '15.03.2024 11:20',
        read: false,
        replies: [
          {
            id: 1,
            sender: 'ABC Lojistik',
            content: 'Merhaba, teslimat süresini öğrenebilir miyim?',
            date: '15.03.2024 11:20'
          },
          {
            id: 2,
            sender: 'Siz',
            content: 'Merhaba, teslimatınız yarın saat 14:00\'te yapılacaktır.',
            date: '15.03.2024 11:25'
          }
        ]
      },
      {
        id: 2,
        customer: 'XYZ Transport',
        subject: 'Fatura Talebi',
        content: 'Son sevkiyat için fatura talep ediyorum.',
        date: '14.03.2024 16:30',
        read: true,
        replies: [
          {
            id: 1,
            sender: 'XYZ Transport',
            content: 'Son sevkiyat için fatura talep ediyorum.',
            date: '14.03.2024 16:30'
          }
        ]
      }
    ]
  });

  const filteredMessages = messages[activeTab].filter(message =>
    activeTab === 'system' 
      ? message.title.toLowerCase().includes(searchTerm.toLowerCase())
      : message.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        message.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleReply = (messageId) => {
    // Burada API'ye yanıt gönderme işlemi yapılacak
    console.log('Yanıt gönderildi:', replyText);
    setReplyText('');
  };

  return (
    <PortalLayout title="Mesajlar">
      <div className="space-y-6">
        {/* Başlık ve Arama */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">Mesajlar</h1>
          <div className="relative flex-1 sm:max-w-md">
            <input
              type="text"
              placeholder="Mesaj ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
        </div>

        {/* Tab Menüsü */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('system')}
              className={`${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaBell className="mr-2" />
              Sistem Mesajları
            </button>
            <button
              onClick={() => setActiveTab('customer')}
              className={`${
                activeTab === 'customer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaUser className="mr-2" />
              Müşteri Mesajları
            </button>
          </nav>
        </div>

        {/* Mesaj Listesi */}
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div key={message.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-6">
                {activeTab === 'system' ? (
                  // Sistem Mesajı
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{message.title}</h3>
                        <p className="mt-1 text-sm text-gray-500">{message.content}</p>
                      </div>
                      <span className="text-sm text-gray-500">{message.date}</span>
                    </div>
                  </div>
                ) : (
                  // Müşteri Mesajı
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{message.customer}</h3>
                        <p className="text-sm text-gray-500">{message.subject}</p>
                      </div>
                      <span className="text-sm text-gray-500">{message.date}</span>
                    </div>
                    
                    {/* Mesaj Geçmişi */}
                    <div className="space-y-4 mb-4">
                      {message.replies.map((reply) => (
                        <div key={reply.id} className={`flex ${reply.sender === 'Siz' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-lg p-3 ${
                            reply.sender === 'Siz' ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <p className="text-sm text-gray-900">{reply.content}</p>
                            <p className="text-xs text-gray-500 mt-1">{reply.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Yanıt Formu */}
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          placeholder="Yanıtınızı yazın..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleReply(message.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <FaPaperPlane />
                          <span>Gönder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PortalLayout>
  );
} 