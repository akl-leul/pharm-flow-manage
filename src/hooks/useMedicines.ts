
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
      
      if (error) {
        console.error('Error fetching medicines:', error);
        throw error;
      }
      
      return data as Medicine[];
    },
  });
};

export const useAddMedicine = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (medicine: Omit<Medicine, 'id' | 'created_at' | 'updated_at'>) => {
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
      toast({
        title: "Medicine Added",
        description: "Medicine has been added to inventory successfully"
      });
    },
    onError: (error) => {
      console.error('Error adding medicine:', error);
      toast({
        title: "Error",
        description: "Failed to add medicine to inventory",
        variant: "destructive"
      });
    }
  });
};

export const useUpdateMedicineStock = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, stock }: { id: string; stock: number }) => {
      console.log('Updating medicine stock:', { id, stock });
      
      if (!id) {
        throw new Error('Medicine ID is required for stock update');
      }
      
      const { data, error } = await supabase
        .from('medicines')
        .update({ stock, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating stock:', error);
        throw error;
      }
      
      console.log('Stock updated successfully:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({
        title: "Stock Updated",
        description: "Medicine stock has been updated successfully"
      });
    },
    onError: (error) => {
      console.error('Error updating stock:', error);
      toast({
        title: "Error",
        description: `Failed to update medicine stock: ${error.message}`,
        variant: "destructive"
      });
    }
  });
};
