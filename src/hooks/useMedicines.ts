import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Medicine } from '@/types/pharmacy';
import { toast } from '@/hooks/use-toast';

export const useMedicines = () => {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Medicine[];
    },
  });
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (medicine: Partial<Medicine>) => {
      const { data, error } = await supabase
        .from('medicines')
        .insert([medicine])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: "Medicine Added", description: "Added to inventory successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to add medicine: ${error.message}`, variant: "destructive" });
    }
  });
};

export const useUpdateMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Medicine> & { id: string }) => {
      const { data, error } = await supabase
        .from('medicines')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: "Updated", description: "Medicine updated successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Failed to update: ${error.message}`, variant: "destructive" });
    }
  });
};

export const useUpdateMedicineStock = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { data, error } = await supabase
        .from('medicines')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Stock update failed: ${error.message}`, variant: "destructive" });
    }
  });
};

export const useDeleteMedicine = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('medicines').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: "Deleted", description: "Medicine removed from inventory" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Delete failed: ${error.message}`, variant: "destructive" });
    }
  });
};
