import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaUser, FaSignOutAlt, FaCog } from 'react-icons/fa';

const Profile = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error('Kullanıcı bilgileri parse edilemedi:', err);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/admin/login');
  };

  const handleProfileClick = () => {
    router.push('/admin/profile');
    setShowDropdown(false);
  };

  const handleSettingsClick = () => {
    router.push('/admin/settings');
    setShowDropdown(false);
  };

  if (!userData) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
          {userData.avatar ? (
            <img
              src={userData.avatar}
              alt={userData.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <FaUser className="w-4 h-4 text-gray-600" />
          )}
        </div>
        <span className="text-sm font-medium text-gray-700">
          {userData.name}
        </span>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <FaUser className="w-4 h-4" />
              <span>Profil</span>
            </button>
            
            <button
              onClick={handleSettingsClick}
              className="w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
            >
              <FaCog className="w-4 h-4" />
              <span>Ayarlar</span>
            </button>

            <hr className="my-1 border-gray-200" />
            
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2 text-sm text-left text-red-600 hover:bg-red-50 flex items-center space-x-2"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile; 