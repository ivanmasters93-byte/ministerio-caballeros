'use client';

import { useState } from 'react';
import { AlertCircle, CheckCircle2, Mail, Phone, MapPin, Briefcase, Heart, Users } from 'lucide-react';

type Step = 'intro' | 'personal' | 'adicional' | 'red' | 'success' | 'error';

interface FormData {
  nombre: string;
  edad: string;
  telefono: string;
  email: string;
  direccion: string;
  ocupacion: string;
  estadoCivil: string;
  red: 'MENOR' | 'MEDIA' | 'MAYOR' | '';
}

const REDES = [
  { id: 'MENOR', nombre: 'Red Menor', rango: '18-30 años', emoji: '🌱', color: 'from-green-400 to-green-600' },
  { id: 'MEDIA', nombre: 'Red Media', rango: '31-40 años', emoji: '🌿', color: 'from-emerald-400 to-emerald-600' },
  { id: 'MAYOR', nombre: 'Red Mayor', rango: '41-75 años', emoji: '🌳', color: 'from-teal-400 to-teal-600' }
];

export default function RegistroHermanos() {
  const [step, setStep] = useState<Step>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    edad: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacion: '',
    estadoCivil: '',
    red: ''
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleNextStep = () => {
    if (step === 'intro') {
      setStep('personal');
    } else if (step === 'personal') {
      if (!formData.nombre.trim()) {
        setError('Por favor ingresa tu nombre');
        return;
      }
      if (!formData.edad || isNaN(parseInt(formData.edad))) {
        setError('Por favor ingresa una edad válida');
        return;
      }
      if (!formData.telefono.trim()) {
        setError('Por favor ingresa tu teléfono');
        return;
      }
      if (!formData.email.trim() || !validateEmail(formData.email)) {
        setError('Por favor ingresa un email válido');
        return;
      }
      setStep('adicional');
    } else if (step === 'adicional') {
      if (!formData.direccion.trim()) {
        setError('Por favor ingresa tu dirección');
        return;
      }
      if (!formData.ocupacion.trim()) {
        setError('Por favor ingresa tu ocupación');
        return;
      }
      if (!formData.estadoCivil) {
        setError('Por favor selecciona tu estado civil');
        return;
      }
      setStep('red');
    } else if (step === 'red') {
      if (!formData.red) {
        setError('Por favor selecciona tu red');
        return;
      }
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/registro-hermanos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en el registro');
      }

      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setStep('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevious = () => {
    if (step === 'personal') setStep('intro');
    else if (step === 'adicional') setStep('personal');
    else if (step === 'red') setStep('adicional');
  };

  const renderIntro = () => (
    <div className="text-center space-y-6">
      <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
        GEDEONES
      </div>
      <p className="text-xl text-gray-600">Ministerio de Caballeros</p>
      <p className="text-sm text-gray-500 italic">Conectados en Fe</p>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded my-6">
        <p className="text-gray-700">
          Bienvenido. Te invitamos a ser parte de GEDEONES, una plataforma diseñada para conectarte con tu comunidad de fe.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 my-6">
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📅</span>
          <span className="text-xs text-gray-600">Calendario</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📬</span>
          <span className="text-xs text-gray-600">Anuncios</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">📖</span>
          <span className="text-xs text-gray-600">Recursos</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-3xl">🙏</span>
          <span className="text-xs text-gray-600">Peticiones</span>
        </div>
      </div>
    </div>
  );

  const renderPersonal = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Tu Información Personal</h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo</label>
        <input
          type="text"
          placeholder="Tu nombre..."
          value={formData.nombre}
          onChange={(e) => handleInputChange('nombre', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Edad</label>
          <input
            type="number"
            placeholder="Tu edad..."
            value={formData.edad}
            onChange={(e) => handleInputChange('edad', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            placeholder="Tu teléfono..."
            value={formData.telefono}
            onChange={(e) => handleInputChange('telefono', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
        <input
          type="email"
          placeholder="tu.email@ejemplo.com"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        />
      </div>
    </div>
  );

  const renderAdicional = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Un Poco Más Sobre Ti</h2>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <MapPin className="w-4 h-4" /> Dirección
        </label>
        <input
          type="text"
          placeholder="Tu dirección..."
          value={formData.direccion}
          onChange={(e) => handleInputChange('direccion', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> Ocupación
        </label>
        <input
          type="text"
          placeholder="Tu trabajo..."
          value={formData.ocupacion}
          onChange={(e) => handleInputChange('ocupacion', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <Heart className="w-4 h-4" /> Estado Civil
        </label>
        <select
          value={formData.estadoCivil}
          onChange={(e) => handleInputChange('estadoCivil', e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition"
        >
          <option value="">Selecciona...</option>
          <option value="Soltero">Soltero/a</option>
          <option value="Casado">Casado/a</option>
          <option value="Divorciado">Divorciado/a</option>
          <option value="Viudo">Viudo/a</option>
        </select>
      </div>
    </div>
  );

  const renderRed = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-800">Tu Red Ministerial</h2>
      <p className="text-gray-600">Selecciona tu grupo de edad:</p>

      <div className="grid gap-3">
        {REDES.map((red) => (
          <button
            key={red.id}
            onClick={() => handleInputChange('red', red.id as any)}
            className={`p-4 rounded-lg border-2 transition-all ${
              formData.red === red.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <div className="text-lg font-bold">{red.emoji} {red.nombre}</div>
                <div className="text-sm text-gray-600">{red.rango}</div>
              </div>
              {formData.red === red.id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">✓</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle2 className="w-24 h-24 text-green-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800">¡Excelente!</h2>
      <p className="text-gray-600">Tu información ha sido registrada correctamente</p>
      <p className="text-lg font-semibold text-blue-600">Ya eres parte de la comunidad GEDEONES</p>

      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mt-6">
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Próximos pasos:</strong></p>
          <p>1. Recibirás un email con tus credenciales</p>
          <p>2. Accede a la app y explora tu red</p>
          <p>3. Conecta con tu comunidad de fe</p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-8">¿Preguntas? Contacta a tu líder de red</p>
    </div>
  );

  const renderError = () => (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <AlertCircle className="w-24 h-24 text-red-500" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800">Error en el Registro</h2>
      <p className="text-red-600 font-semibold">{error}</p>
      <button
        onClick={() => {
          setStep('personal');
          setError('');
        }}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Intentar de Nuevo
      </button>
    </div>
  );

  const progressSteps = {
    intro: 1,
    personal: 2,
    adicional: 3,
    red: 4,
    success: 5,
    error: 2
  };

  const currentProgress = progressSteps[step];
  const totalSteps = 4;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold">GEDEONES - Registro de Hermanos</h1>
          <p className="text-blue-100 text-sm mt-1">Conectados en Fe</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        {['intro', 'personal', 'adicional', 'red'].includes(step) && (
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Paso {currentProgress} de {totalSteps}</span>
              <span>{Math.round((currentProgress / totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-orange-500 transition-all duration-300"
                style={{ width: `${(currentProgress / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Card Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {error && ['personal', 'adicional', 'red'].includes(step) && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {step === 'intro' && renderIntro()}
          {step === 'personal' && renderPersonal()}
          {step === 'adicional' && renderAdicional()}
          {step === 'red' && renderRed()}
          {step === 'success' && renderSuccess()}
          {step === 'error' && renderError()}

          {/* Navigation Buttons */}
          {!['success', 'error'].includes(step) && (
            <div className="flex gap-4 mt-8 pt-6 border-t">
              {step !== 'intro' && (
                <button
                  onClick={handlePrevious}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
                >
                  Anterior
                </button>
              )}
              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className={`flex-1 px-6 py-3 rounded-lg text-white font-semibold transition ${
                  isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-orange-500 hover:shadow-lg'
                }`}
              >
                {isLoading ? 'Registrando...' : step === 'red' ? 'Registrarse' : 'Siguiente'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-6 text-gray-500 text-xs">
        <p>GEDEONES © 2024 - Ministerio de Caballeros</p>
      </div>
    </div>
  );
}

