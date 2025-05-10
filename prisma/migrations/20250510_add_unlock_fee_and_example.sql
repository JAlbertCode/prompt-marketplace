-- Add unlock fee for system prompt
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "unlockFee" INTEGER NOT NULL DEFAULT 0;

-- Add example output reference 
-- In a production system, you might want to store this in a separate table
-- especially if the examples could be large
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "exampleOutput" TEXT;

-- Make sure the isPublished field exists (it should already, but just to be safe)
ALTER TABLE "Prompt" ADD COLUMN IF NOT EXISTS "isPublished" BOOLEAN NOT NULL DEFAULT false;
