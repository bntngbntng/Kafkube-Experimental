import React, { createContext, useState, useEffect, useContext } from 'react';
import { getMahasiswa, tambahMahasiswa } from '../services/api';

const MahasiswaContext = createContext();

export const useMahasiswa = () => useContext(MahasiswaContext);

export const MahasiswaProvider = ({ children }) => {
  const [mahasiswa, setMahasiswa] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMahasiswa = async () => {
    try {
      setLoading(true);
      const data = await getMahasiswa();
      setMahasiswa(data);
      setError(null);
    } catch (err) {
      setError('Gagal memuat data mahasiswa');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addMahasiswa = async (mahasiswaData) => {
    try {
      const newMahasiswa = await tambahMahasiswa(mahasiswaData);
      setMahasiswa(prev => [newMahasiswa, ...prev]);
      return newMahasiswa;
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  return (
    <MahasiswaContext.Provider value={{ 
      mahasiswa, 
      loading, 
      error, 
      addMahasiswa,
      refresh: fetchMahasiswa 
    }}>
      {children}
    </MahasiswaContext.Provider>
  );
};