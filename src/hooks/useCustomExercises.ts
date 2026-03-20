// useCustomExercises — CRUD de exercícios personalizados no Supabase
// Fiel ao original: customExercises[], loadCustomExercises, saveCustomExercises (L6134–6146)
// Supabase substitui localStorage — mesmo padrão do useDiary

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { CustomExercise } from '../types/workout';

export function useCustomExercises() {
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [loading, setLoading] = useState(true);

  // Carrega exercícios do usuário (não arquivados)
  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('custom_exercises')
      .select('*')
      .eq('arquivado', false)
      .order('created_at', { ascending: true });
    setCustomExercises((data as CustomExercise[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Cria exercício — id gerado pelo Supabase (UUID)
  // Original: id: "custom_" + Date.now() (L7979)
  const createCustomExercise = useCallback(async (
    nome: string,
    grupo: string,
    secundarios: string[]
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newEx: Omit<CustomExercise, 'id' | 'created_at'> = {
      user_id: user.id,
      nome,
      grupo,
      secundarios,
      arquivado: false,
    };

    const { data } = await supabase
      .from('custom_exercises')
      .insert(newEx)
      .select()
      .single();

    if (data) {
      setCustomExercises(prev => [...prev, data as CustomExercise]);
    }
  }, []);

  // Rename + atualiza grupo principal e secundários (rename inline — original L6638–6650)
  const renameCustomExercise = useCallback(async (
    id: string,
    nome: string,
    grupo: string,
    secundarios: string[]
  ) => {
    // Optimistic
    setCustomExercises(prev =>
      prev.map(e => e.id === id ? { ...e, nome, grupo, secundarios } : e)
    );
    await supabase
      .from('custom_exercises')
      .update({ nome, grupo, secundarios })
      .eq('id', id);
  }, []);

  // Soft delete — arquivado: true (original L6551–6555)
  const deleteCustomExercise = useCallback(async (id: string) => {
    // Optimistic
    setCustomExercises(prev => prev.filter(e => e.id !== id));
    await supabase
      .from('custom_exercises')
      .update({ arquivado: true })
      .eq('id', id);
  }, []);

  return {
    customExercises,
    loading,
    createCustomExercise,
    renameCustomExercise,
    deleteCustomExercise,
  };
}
