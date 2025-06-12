
-- Create medicines table for inventory management
CREATE TABLE public.medicines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  expiry_date DATE NOT NULL,
  min_stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create sales table for transaction records
CREATE TABLE public.sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  medicine_id UUID NOT NULL REFERENCES public.medicines(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  sale_date DATE NOT NULL,
  sale_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create admin users table for authentication
CREATE TABLE public.admin_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert sample medicines
INSERT INTO public.medicines (name, stock, price, category, expiry_date, min_stock) VALUES
('Paracetamol 500mg', 100, 2.50, 'Pain Relief', '2025-12-31', 20),
('Amoxicillin 250mg', 50, 8.75, 'Antibiotic', '2025-08-15', 10),
('Ibuprofen 400mg', 75, 3.20, 'Pain Relief', '2025-10-20', 15),
('Aspirin 100mg', 80, 1.50, 'Pain Relief', '2025-09-30', 25),
('Metformin 500mg', 60, 4.25, 'Diabetes', '2025-11-15', 15);

-- Insert default admin user (username: admin, password: pharmacy123)
-- Note: In production, use proper password hashing
INSERT INTO public.admin_users (username, password_hash) VALUES
('admin', 'pharmacy123');

-- Enable Row Level Security
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since this is an admin-only system)
CREATE POLICY "Allow all operations on medicines" ON public.medicines FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_users" ON public.admin_users FOR ALL USING (true);

-- Create function to automatically update stock when sale is made
CREATE OR REPLACE FUNCTION public.update_medicine_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease stock when sale is inserted
  IF TG_OP = 'INSERT' THEN
    UPDATE public.medicines 
    SET stock = stock - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.medicine_id;
    RETURN NEW;
  END IF;
  
  -- Restore stock when sale is deleted
  IF TG_OP = 'DELETE' THEN
    UPDATE public.medicines 
    SET stock = stock + OLD.quantity,
        updated_at = now()
    WHERE id = OLD.medicine_id;
    RETURN OLD;
  END IF;
  
  -- Handle stock changes when sale is updated
  IF TG_OP = 'UPDATE' THEN
    UPDATE public.medicines 
    SET stock = stock + OLD.quantity - NEW.quantity,
        updated_at = now()
    WHERE id = NEW.medicine_id;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update stock
CREATE TRIGGER trigger_update_medicine_stock
  AFTER INSERT OR UPDATE OR DELETE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_medicine_stock();
