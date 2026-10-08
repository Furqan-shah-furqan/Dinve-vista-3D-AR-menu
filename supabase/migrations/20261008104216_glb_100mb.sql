-- Global Storage limit must also be at least 100 MB (requires Supabase Pro or above).
update storage.buckets set file_size_limit = 104857600 where id = 'menu-models';
