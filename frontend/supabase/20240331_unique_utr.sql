-- Migration: Add UNIQUE constraint to proof_utr
-- This prevents users from reusing the same Transaction ID for multiple ticket claims.

-- First, ensure any nulls are handled (though UNIQUE allows multiple NULLs in Postgres).
ALTER TABLE user_tickets ADD CONSTRAINT unique_proof_utr UNIQUE (proof_utr);
