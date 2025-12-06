import React, { useState, useEffect, useRef } from 'react';

const SalesChart = () => {
  const years = [2023, 2024, 2025];
  const currentYear = new Date().getFullYear();
  const initialYear = years.includes(currentYear) ? currentYear : years[years.length - 1];
  
  const [year, setYear] = useState(initialYear);
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const objectUrlRef = useRef(null);

  const fetchChart = async () => {
    // Limpiar URL anterior si existe
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setLoading(true);
    setError(null);
    
    // Configurar URL base del backend
    // En producción: usar la URL completa del backend en Render
    // En desarrollo: usar URL relativa para que funcione con el proxy
    const isProduction = process.env.NODE_ENV === 'production';
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
      (isProduction ? 'https://back-auladiser-final-project.onrender.com' : '');
    const endpoint = `${API_BASE_URL}/sales/branches/line-chart?year=${year}`;
    
    console.log('Consultando endpoint:', endpoint);
    
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'image/png',
        },
      });
      
      console.log('Respuesta recibida:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', errorText);
        throw new Error(`Error ${response.status}: ${response.statusText || 'No se pudieron cargar los datos para el año seleccionado.'}`);
      }
      
      const blob = await response.blob();
      console.log('Blob recibido:', blob.type, blob.size, 'bytes');
      
      if (!blob.type.startsWith('image/')) {
        console.warn('Advertencia: El tipo de contenido no es una imagen:', blob.type);
      }
      
      const newObjectUrl = URL.createObjectURL(blob);
      objectUrlRef.current = newObjectUrl;
      setImageUrl(newObjectUrl);
    } catch (err) {
      console.error('Error al cargar la gráfica:', err);
      const errorMessage = err.message || 'Ocurrió un error al cargar la gráfica. Por favor, verifica que el backend esté corriendo y accesible.';
      setError(errorMessage);
      setImageUrl(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChart();

    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] bg-gray-50 p-6">
      <div className="w-full max-w-4xl bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6">
          <h2 className="text-2xl font-bold text-white text-center">
            Reporte de Ventas Mensuales
          </h2>
          <p className="text-indigo-100 text-center mt-2">
            Visualización gráfica por sucursales
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label htmlFor="year-select" className="text-gray-700 font-medium">
              Selecciona el año a consultar:
            </label>
            <div className="relative w-full sm:w-48">
              <select
                id="year-select"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="block w-full pl-4 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm bg-white border hover:border-gray-400 transition-colors cursor-pointer appearance-none"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="relative min-h-[400px] flex items-center justify-center bg-white border-2 border-dashed border-gray-200 rounded-lg p-4">
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white bg-opacity-80 z-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="mt-4 text-indigo-600 font-medium">Generando gráfica...</p>
              </div>
            )}

            {error ? (
              <div className="text-center p-6 bg-red-50 rounded-lg border border-red-100">
                <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-lg font-medium text-red-800">Error</h3>
                <p className="text-red-600 mt-2">{error}</p>
              </div>
            ) : (
              imageUrl && (
                <div className="w-full h-full flex items-center justify-center transition-opacity duration-500 ease-in-out opacity-100">
                  <img
                    src={imageUrl}
                    alt={`Gráfica de ventas ${year}`}
                    className="max-w-full h-auto rounded shadow-sm object-contain"
                  />
                </div>
              )
            )}
            
            {!loading && !error && !imageUrl && (
              <p className="text-gray-400 italic">Selecciona un año para ver la gráfica</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;

