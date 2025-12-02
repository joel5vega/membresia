import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Calendar } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeTeachers: 0,
    sundayAttendance: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Load stats from Firebase
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8">IglesiaFlow</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Members Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Miembros</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalMembers}</p>
            </div>
            <Users className="h-12 w-12 text-blue-600" />
          </div>
        </div>

        {/* Teachers Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Maestros</p>
              <p className="text-3xl font-bold text-green-600">{stats.activeTeachers}</p>
            </div>
            <BookOpen className="h-12 w-12 text-green-600" />
          </div>
        </div>

        {/* Attendance Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Asistencia Hoy</p>
              <p className="text-3xl font-bold text-purple-600">{stats.sundayAttendance}</p>
            </div>
            <Calendar className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition">
            Añadir Miembro
          </button>
          <button className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition">
            Añadir Maestro
          </button>
          <button className="bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition">
            Registrar Asistencia
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
