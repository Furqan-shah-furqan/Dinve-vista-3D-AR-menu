-- Preserve the existing allowlist and add the glTF JSON media type.
update storage.buckets
set allowed_mime_types = case when allowed_mime_types is null then null
  else array(select distinct unnest(allowed_mime_types || array['model/gltf+json'])) end
where id = 'menu-models';
