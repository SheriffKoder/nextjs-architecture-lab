-- Function to generate UUID v7 in PostgreSQL
CREATE OR REPLACE FUNCTION uuid7() 
RETURNS uuid 
AS $$
DECLARE
  unix_ts_ms bytea;
  uuid_bytes bytea;
BEGIN
  -- Get current unix timestamp in milliseconds (48 bits)
  unix_ts_ms := decode(lpad(to_hex((EXTRACT(EPOCH FROM now()) * 1000)::bigint), 12, '0'), 'hex');
  
  -- Generate 10 random bytes
  uuid_bytes := unix_ts_ms || gen_random_bytes(10);
  
  -- Set version to 7 (bits 48-51)
  uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
  
  -- Set variant to 1 (bits 64-65)
  uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
  
  RETURN encode(uuid_bytes, 'hex')::uuid;
END;
$$ LANGUAGE plpgsql VOLATILE;