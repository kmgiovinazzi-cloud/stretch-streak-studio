
-- Move can_view_user_media into a private schema so it's not part of the exposed API
CREATE SCHEMA IF NOT EXISTS private;
GRANT USAGE ON SCHEMA private TO anon, authenticated;

CREATE OR REPLACE FUNCTION private.can_view_user_media(_owner uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    _owner = auth.uid()
    OR EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = _owner AND p.is_private = false)
    OR EXISTS (
      SELECT 1 FROM public.follows f
      WHERE f.followee_id = _owner
        AND f.follower_id = auth.uid()
        AND f.status = 'accepted'
    );
$$;
REVOKE EXECUTE ON FUNCTION private.can_view_user_media(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.can_view_user_media(uuid) TO anon, authenticated;

-- Repoint storage policy to private fn, then drop the public one
DROP POLICY IF EXISTS "stretch_media read" ON storage.objects;
CREATE POLICY "stretch_media read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'stretch-media'
    AND private.can_view_user_media( ((storage.foldername(name))[1])::uuid )
  );

DROP FUNCTION IF EXISTS public.can_view_user_media(uuid);

-- posts: respect private accounts
DROP POLICY IF EXISTS "Posts viewable by everyone" ON public.posts;
CREATE POLICY "Posts viewable by allowed viewers" ON public.posts
  FOR SELECT USING (private.can_view_user_media(user_id));

-- goal_folders: respect private accounts
DROP POLICY IF EXISTS "Folders viewable by everyone" ON public.goal_folders;
CREATE POLICY "Folders viewable by allowed viewers" ON public.goal_folders
  FOR SELECT USING (private.can_view_user_media(user_id));

-- follows: hide relationships involving private accounts from outsiders
DROP POLICY IF EXISTS "Follows viewable by everyone" ON public.follows;
CREATE POLICY "Follows viewable when permitted" ON public.follows
  FOR SELECT USING (
    auth.uid() = follower_id
    OR auth.uid() = followee_id
    OR (private.can_view_user_media(followee_id) AND private.can_view_user_media(follower_id))
  );

-- post_likes: hide likes on posts whose owner isn't viewable
DROP POLICY IF EXISTS "Likes viewable by everyone" ON public.post_likes;
CREATE POLICY "Likes viewable when post viewable" ON public.post_likes
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_likes.post_id
        AND private.can_view_user_media(p.user_id)
    )
  );
