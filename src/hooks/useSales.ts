import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sale, SaleItem } from '@/types/pharmacy';
import { toast } from '@/hooks/use-toast';

export const useSales = () => {
  return useQuery({
    queryKey: ['sales'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Sale[];
    },
  });
};

export const useSaleItems = (saleId?: string) => {
  return useQuery({
    queryKey: ['sale_items', saleId],
    queryFn: async () => {
      if (!saleId) return [];
      const { data, error } = await supabase
        .from('sale_items')
        .select('*')
        .eq('sale_id', saleId);
      if (error) throw error;
      return data as SaleItem[];
    },
    enabled: !!saleId,
  });
};

export const useAddSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ sale, items }: { sale: Partial<Sale>; items: Partial<SaleItem>[] }) => {
      // Generate invoice number
      const { data: invoiceData } = await supabase.rpc('generate_invoice_number');
      const invoiceNumber = invoiceData || `INV-${Date.now()}`;

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([{ ...sale, invoice_number: invoiceNumber }])
        .select()
        .single();
      if (saleError) throw saleError;

      if (items.length > 0) {
        const saleItems = items.map(item => ({ ...item, sale_id: saleData.id }));
        const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);
        if (itemsError) throw itemsError;
      }

      return saleData as Sale;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: "Sale completed", description: "Transaction recorded successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Sale failed: ${error.message}`, variant: "destructive" });
    }
  });
};

export const useDeleteSale = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sales').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      toast({ title: "Deleted", description: "Sale record removed" });
    },
    onError: (error) => {
      toast({ title: "Error", description: `Delete failed: ${error.message}`, variant: "destructive" });
    }
  });
};
