-- Add purchase_limit column to products table
ALTER TABLE public.products 
ADD COLUMN purchase_limit INTEGER DEFAULT NULL;

-- Create token_product_purchases table to track purchases per token per product
CREATE TABLE public.token_product_purchases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id UUID NOT NULL REFERENCES public.tokens(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    purchase_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(token_id, product_id)
);

-- Create index for faster lookups
CREATE INDEX idx_token_product_purchases_token_product 
ON public.token_product_purchases(token_id, product_id);

-- Create function to check purchase limit
CREATE OR REPLACE FUNCTION public.check_purchase_limit(
    p_token_id UUID,
    p_product_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_limit INTEGER;
    v_current_count INTEGER;
BEGIN
    -- Get the purchase limit for the product
    SELECT purchase_limit INTO v_limit
    FROM public.products
    WHERE id = p_product_id;
    
    -- If no limit is set, allow purchase
    IF v_limit IS NULL THEN
        RETURN TRUE;
    END IF;
    
    -- Get current purchase count
    SELECT COALESCE(purchase_count, 0) INTO v_current_count
    FROM public.token_product_purchases
    WHERE token_id = p_token_id AND product_id = p_product_id;
    
    -- Check if limit is reached
    IF v_current_count >= v_limit THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to increment purchase count
CREATE OR REPLACE FUNCTION public.increment_purchase_count(
    p_token_id UUID,
    p_product_id UUID
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.token_product_purchases (token_id, product_id, purchase_count, updated_at)
    VALUES (p_token_id, p_product_id, 1, now())
    ON CONFLICT (token_id, product_id) 
    DO UPDATE SET 
        purchase_count = public.token_product_purchases.purchase_count + 1,
        updated_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT SELECT ON public.token_product_purchases TO anon, authenticated;
GRANT INSERT, UPDATE ON public.token_product_purchases TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_purchase_limit TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_purchase_count TO authenticated;

-- Enable RLS
ALTER TABLE public.token_product_purchases ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow read access to token_product_purchases"
ON public.token_product_purchases FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Allow insert/update for authenticated users"
ON public.token_product_purchases FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
