import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { authAPI } from '../services/api';
import Swal from 'sweetalert2';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    noPNK: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await authAPI.login({
        noPNK: formData.noPNK,
        username: formData.noPNK,
        password: formData.password
      });

      const data = response.data;

      if (data.success) {
        localStorage.setItem('token', data.token);
        login(data.user);
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: data.message || 'Username atau password salah.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Coba Lagi',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      const status = error.response?.status;
      const msg = error.response?.data?.message;

      if (status === 401) {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: 'Username atau password yang Anda masukkan salah.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Coba Lagi',
        });
      } else if (status === 404) {
        Swal.fire({
          icon: 'error',
          title: 'Akun Tidak Ditemukan',
          text: 'Username tidak terdaftar dalam sistem.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'Coba Lagi',
        });
      } else if (!navigator.onLine) {
        Swal.fire({
          icon: 'warning',
          title: 'Tidak Ada Koneksi',
          text: 'Periksa koneksi internet Anda dan coba lagi.',
          confirmButtonColor: '#d97706',
          confirmButtonText: 'OK',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Terjadi Kesalahan',
          text: msg || 'Gagal terhubung ke server. Silakan coba beberapa saat lagi.',
          confirmButtonColor: '#dc2626',
          confirmButtonText: 'OK',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/images/pt_dharma_dcci_2.jpg)' }}
        />

        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(160deg, rgba(10,25,60,0.72) 0%, rgba(15,40,80,0.60) 60%, rgba(10,20,50,0.75) 100%)',
          }}
        />

        {/* Konten di atas foto */}
        <div className="relative z-10 flex flex-col items-center justify-center p-12 text-center">
          <img
            src="/images/so-v2.png"
            alt="Login Illustration"
            className="w-full max-w-sm h-auto"
            style={{
              mixBlendMode: 'multiply',
              filter: 'brightness(1.05) contrast(1.1)',
            }}
          />
          <div className="mt-6">
            <p className="text-white font-bold text-lg leading-snug drop-shadow">
              PT Dharma Controlcable Indonesia
            </p>
            <p className="text-blue-200 text-sm mt-1 opacity-80">
              System Structure Organization Digitalization
            </p>
          </div>

          {/* Badge lokasi */}
          <div
            className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full text-xs text-white/70"
            style={{
              background: 'rgba(255,255,255,0.10)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg className="w-3 h-3 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Cikarang Utara, Jawa Barat
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="max-w-md w-full space-y-8">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-4">
            <img src="/logo/Logo DG New 2022.png" alt="Logo" className="h-10 object-contain" />
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Login</h2>
            <p className="text-gray-500 text-sm">Masuk ke akun Anda untuk melanjutkan</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="noPNK" className="block text-sm font-medium text-gray-700 mb-2">
                NO NPK
              </label>
              <input
                id="noPNK"
                name="noPNK"
                type="text"
                required
                value={formData.noPNK}
                onChange={handleChange}
                placeholder="Masukkan no NPK"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </>
              ) : 'Submit'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center text-sm text-gray-400 mt-8 pt-6 border-t border-gray-200">
            © 2026 PT. Dharma Controlcable Indonesia. All Rights Reserved.
          </div>
        </div>
      </div>

    </div>
  );
};

export default Login;